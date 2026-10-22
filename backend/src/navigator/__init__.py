"""Navigator: a multi-tenant atlas of past, planned and someday trips."""

import argparse
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config


def main() -> None:
    parser = argparse.ArgumentParser(prog="navigator")
    sub = parser.add_subparsers(dest="cmd", required=True)
    serve = sub.add_parser("serve", help="run the web app")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8930)
    serve.add_argument("--reload", action="store_true")
    sub.add_parser("migrate", help="apply database migrations (uses NAVIGATOR_MIGRATE_DATABASE_URL)")
    args = parser.parse_args()

    from navigator.settings import get_settings

    settings = get_settings()
    logging.basicConfig(level=settings.log_level.upper(), format="%(asctime)s %(levelname)s %(name)s %(message)s")

    if args.cmd == "serve":
        import uvicorn

        uvicorn.run(
            "navigator.main:create_app",
            factory=True,
            host=args.host,
            port=args.port,
            reload=args.reload,
            proxy_headers=True,
            forwarded_allow_ips="*" if settings.env == "prod" else "127.0.0.1",
            log_level=settings.log_level,
        )
    elif args.cmd == "migrate":
        migrate()


def alembic_config() -> Config:
    cfg = Config()
    cfg.set_main_option("script_location", str(Path(__file__).parent / "migrations"))
    return cfg


def migrate() -> None:
    command.upgrade(alembic_config(), "head")
