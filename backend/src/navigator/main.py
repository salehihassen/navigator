"""FastAPI application: API routes, health probes and the built single-page app."""

import logging
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse, JSONResponse

from navigator import db, storage
from navigator.settings import Settings, get_settings

log = logging.getLogger("navigator")

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
}


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.engine = db.make_engine(settings)
        app.state.s3 = storage.make_client(settings) if settings.storage_configured else None
        try:
            yield
        finally:
            await app.state.engine.dispose()

    app = FastAPI(
        title="Navigator",
        lifespan=lifespan,
        openapi_url="/api/openapi.json",
        docs_url="/api/docs" if settings.env != "prod" else None,
        redoc_url=None,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        response = await call_next(request)
        for k, v in SECURITY_HEADERS.items():
            response.headers.setdefault(k, v)
        if request.url.path.startswith(("/api/", "/healthz", "/readyz")):
            response.headers.setdefault("Cache-Control", "private, no-store")
        return response

    @app.get("/healthz", include_in_schema=False)
    async def healthz() -> dict[str, str]:
        """Liveness: the process is up. Never touches dependencies."""
        return {"status": "ok"}

    @app.get("/readyz", include_in_schema=False)
    async def readyz(request: Request) -> JSONResponse:
        """Readiness: the database (and media store, when configured) answer."""
        checks: dict[str, str] = {}
        try:
            await db.ping(request.app.state.engine)
            checks["database"] = "ok"
        except Exception as exc:  # report, don't crash the probe
            log.warning("readyz database check failed: %s", type(exc).__name__)
            checks["database"] = "unavailable"
        if request.app.state.s3 is not None:
            try:
                await storage.ping(request.app.state.s3, settings.s3_bucket)
                checks["storage"] = "ok"
            except Exception as exc:
                log.warning("readyz storage check failed: %s", type(exc).__name__)
                checks["storage"] = "unavailable"
        ok = all(v == "ok" for v in checks.values())
        return JSONResponse({"status": "ok" if ok else "unavailable", "checks": checks}, status_code=200 if ok else 503)

    if settings.static_dir:
        mount_spa(app, settings.static_dir)
    return app


def mount_spa(app: FastAPI, root: Path) -> None:
    """Serve the Vite build: hashed assets are immutable, every other non-API path
    falls back to index.html so client-side routes (/trip/<id>, ?cc=JP) deep-link."""
    root = root.resolve()
    index = root / "index.html"

    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str) -> Response:
        if path.startswith(("api/", "auth/")):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        candidate = (root / path).resolve()
        if path and candidate.is_file() and candidate.is_relative_to(root):
            immutable = path.startswith("assets/")
            return FileResponse(
                candidate,
                headers={"Cache-Control": "public, max-age=31536000, immutable" if immutable else "no-cache"},
            )
        if path.startswith("assets/"):  # a stale hashed asset must 404, not become HTML
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        return FileResponse(index, headers={"Cache-Control": "no-cache"})
