"""Baseline: the app schema, runtime-role privileges and the tenant helper.

The runtime role (NAVIGATOR_DB_APP_ROLE, created by deploy/initdb) gets data access
only: it can't create or alter objects, isn't an owner, so FORCE ROW LEVEL SECURITY
applies to it on every tenant table added from M1 on.

Revision ID: 0001
Revises:
Create Date: 2026-10-22
"""

from collections.abc import Sequence

from alembic import op

from navigator.settings import get_settings

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    app_role = get_settings().db_app_role
    op.execute("CREATE SCHEMA IF NOT EXISTS app")
    op.execute(f'GRANT USAGE ON SCHEMA app TO "{app_role}"')
    # every table/sequence the owner creates later is usable (not alterable) by the app
    op.execute(f'ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "{app_role}"')
    op.execute(f'ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT USAGE, SELECT ON SEQUENCES TO "{app_role}"')
    # the migration bookkeeping table is not the app's business
    op.execute(f'REVOKE ALL ON app.alembic_version FROM "{app_role}"')
    # the active atlas for this transaction; NULL (=> no rows under RLS) when unset
    op.execute(
        """
        CREATE FUNCTION app.current_atlas() RETURNS uuid
        LANGUAGE sql STABLE PARALLEL SAFE AS
        $$ SELECT nullif(current_setting('app.atlas_id', true), '')::uuid $$
        """
    )
    op.execute(f'GRANT EXECUTE ON FUNCTION app.current_atlas() TO "{app_role}"')


def downgrade() -> None:
    app_role = get_settings().db_app_role
    op.execute("DROP FUNCTION IF EXISTS app.current_atlas()")
    op.execute(
        f'ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM "{app_role}"'
    )
    op.execute(f'ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE USAGE, SELECT ON SEQUENCES FROM "{app_role}"')
    op.execute(f'REVOKE USAGE ON SCHEMA app FROM "{app_role}"')
