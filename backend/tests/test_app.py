from pathlib import Path

from fastapi.testclient import TestClient

from navigator.main import create_app
from navigator.settings import Settings


def test_healthz_is_dependency_free(offline_settings: Settings) -> None:
    with TestClient(create_app(offline_settings)) as client:
        r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
    assert r.headers["cache-control"] == "private, no-store"
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["referrer-policy"] == "no-referrer"


def test_readyz_reports_unavailable_database(offline_settings: Settings) -> None:
    with TestClient(create_app(offline_settings)) as client:
        r = client.get("/readyz")
    assert r.status_code == 503
    assert r.json() == {"status": "unavailable", "checks": {"database": "unavailable"}}


def test_api_docs_hidden_in_prod(offline_settings: Settings) -> None:
    prod = offline_settings.model_copy(update={"env": "prod"})
    with TestClient(create_app(prod)) as client:
        assert client.get("/api/docs").status_code == 404
        assert client.get("/api/openapi.json").status_code == 200


def make_spa(root: Path) -> None:
    (root / "assets").mkdir(parents=True)
    (root / "index.html").write_text("<!doctype html><title>Navigator</title>")
    (root / "assets" / "app-abc123.js").write_text("console.log(1)")
    (root.parent / "secret.txt").write_text("outside the static root")


def test_spa_serves_assets_and_falls_back_to_index(offline_settings: Settings, tmp_path: Path) -> None:
    static = tmp_path / "static"
    make_spa(static)
    app = create_app(offline_settings.model_copy(update={"static_dir": static}))
    with TestClient(app) as client:
        asset = client.get("/assets/app-abc123.js")
        assert asset.status_code == 200
        assert asset.headers["cache-control"] == "public, max-age=31536000, immutable"

        for path in ("/", "/trip/0192f1e4-0000-7000-8000-000000000000", "/?cc=JP&show=ideas"):
            page = client.get(path)
            assert page.status_code == 200, path
            assert "<title>Navigator</title>" in page.text
            assert page.headers["cache-control"] == "no-cache"

        # a missing hashed asset (old deploy) is a 404, never index.html served as JS
        assert client.get("/assets/app-old999.js").status_code == 404

        # unknown API paths stay JSON 404s instead of returning the SPA
        assert client.get("/api/nope").status_code == 404
        assert client.get("/api/nope").headers["content-type"].startswith("application/json")


def test_spa_never_serves_files_outside_its_root(offline_settings: Settings, tmp_path: Path) -> None:
    static = tmp_path / "static"
    make_spa(static)
    app = create_app(offline_settings.model_copy(update={"static_dir": static}))
    with TestClient(app) as client:
        for path in ("/../secret.txt", "/%2e%2e/secret.txt", "/assets/..%2f..%2fsecret.txt"):
            r = client.get(path)
            assert "outside the static root" not in r.text, path
