"""Alembic environment. Migrations run as the schema owner
(NAVIGATOR_MIGRATE_DATABASE_URL), never as the runtime role."""

import asyncio

from alembic import context
from sqlalchemy import Connection, pool
from sqlalchemy.ext.asyncio import create_async_engine

from navigator.settings import get_settings

settings = get_settings()


def run(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=None,
        version_table_schema="app",
        include_schemas=True,
    )
    with context.begin_transaction():
        # the version table lives in the app schema, so it must exist first
        connection.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS app")
        context.run_migrations()


async def run_async() -> None:
    url = settings.migrate_database_url
    if url is None:
        raise SystemExit("NAVIGATOR_MIGRATE_DATABASE_URL is not set (migrations run as the schema owner)")
    engine = create_async_engine(url.get_secret_value(), poolclass=pool.NullPool)
    async with engine.connect() as conn:
        await conn.run_sync(run)
        await conn.commit()
    await engine.dispose()


if context.is_offline_mode():
    raise SystemExit("offline migrations are not supported")
asyncio.run(run_async())
