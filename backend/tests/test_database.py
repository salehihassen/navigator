"""Migrations and role boundaries against a real Postgres 18."""

import psycopg
import pytest
from fastapi.testclient import TestClient

from navigator import migrate
from navigator.main import create_app
from navigator.settings import Settings, get_settings
from tests.conftest import needs_db

pytestmark = needs_db


def plain_url(url: str) -> str:
    """SQLAlchemy URL -> libpq URL for direct psycopg checks."""
    return url.replace("postgresql+psycopg://", "postgresql://", 1)


@pytest.fixture(scope="module")
def settings() -> Settings:
    get_settings.cache_clear()
    s = get_settings()
    migrate()  # idempotent: upgrade to head
    return s


def test_readyz_ok_with_real_dependencies(settings: Settings) -> None:
    with TestClient(create_app(settings)) as client:
        r = client.get("/readyz")
    assert r.status_code == 200, r.text
    assert r.json()["checks"]["database"] == "ok"
    if settings.storage_configured:
        assert r.json()["checks"]["storage"] == "ok"


def test_runtime_role_cannot_bypass_rls_or_change_schema(settings: Settings) -> None:
    with psycopg.connect(plain_url(settings.database_url.get_secret_value()), autocommit=True) as conn:
        superuser, bypass = conn.execute(
            "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user"
        ).fetchone()  # type: ignore[misc]
        assert (superuser, bypass) == (False, False)

        for ddl in ("CREATE TABLE app.sneaky (id int)", "CREATE TABLE public.sneaky (id int)"):
            with pytest.raises(psycopg.errors.InsufficientPrivilege):
                conn.execute(ddl)

        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            conn.execute("SELECT * FROM app.alembic_version")


def test_current_atlas_is_null_unless_set_and_transaction_local(settings: Settings) -> None:
    atlas = "0192f1e4-0000-7000-8000-000000000001"
    with psycopg.connect(plain_url(settings.database_url.get_secret_value())) as conn:
        assert conn.execute("SELECT app.current_atlas()").fetchone() == (None,)
        conn.execute("SELECT set_config('app.atlas_id', %s, true)", (atlas,))
        assert str(conn.execute("SELECT app.current_atlas()").fetchone()[0]) == atlas  # type: ignore[index]
        conn.commit()
        # SET LOCAL semantics: a pooled connection never carries the tenant over
        assert conn.execute("SELECT app.current_atlas()").fetchone() == (None,)
