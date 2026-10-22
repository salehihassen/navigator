import os
from pathlib import Path

import pytest
from pydantic import SecretStr

from navigator.settings import Settings

# Database tests need a migrated navigator database reachable with the runtime and
# owner URLs (scripts/dev-test sources .dev/navigator.env; CI sets them explicitly).
HAS_DB = bool(os.environ.get("NAVIGATOR_DATABASE_URL") and os.environ.get("NAVIGATOR_MIGRATE_DATABASE_URL"))
needs_db = pytest.mark.skipif(not HAS_DB, reason="NAVIGATOR_DATABASE_URL / NAVIGATOR_MIGRATE_DATABASE_URL not set")


@pytest.fixture
def offline_settings(tmp_path: Path) -> Settings:
    """Settings pointing at a database that refuses connections, no storage."""
    return Settings(
        env="test",
        database_url=SecretStr("postgresql+psycopg://nobody:x@127.0.0.1:1/none"),
        static_dir=None,
        s3_endpoint=None,  # don't inherit a developer's real storage from the environment
    )
