"""Runtime configuration. Everything comes from NAVIGATOR_* environment variables;
nothing secret has a default, so a missing value fails loudly at startup."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="NAVIGATOR_", extra="ignore")

    env: Literal["dev", "test", "prod"] = "dev"
    public_url: str = "http://localhost:5173"

    # runtime connection: the non-owner role that row-level security applies to
    database_url: SecretStr
    # migrations: the schema owner. Only needed by `navigator migrate`.
    migrate_database_url: SecretStr | None = None
    # interpolated into GRANT statements by migrations, so only plain identifiers
    db_app_role: str = Field(default="navigator_app", pattern=r"^[a-z_][a-z0-9_]{0,62}$")

    # S3-compatible media store (Garage locally and on the VPS, B2 later). Optional
    # until media lands; /readyz only checks it when an endpoint is configured.
    s3_endpoint: str | None = None
    # host that browsers use for signed URLs (e.g. https://files.<domain>); defaults to s3_endpoint
    s3_public_endpoint: str | None = None
    s3_region: str = "garage"
    s3_bucket: str = "navigator-media"
    s3_access_key_id: SecretStr | None = None
    s3_secret_access_key: SecretStr | None = None

    # built SPA (the Docker image sets this; in dev Vite serves the frontend)
    static_dir: Path | None = None
    log_level: str = "info"

    @property
    def storage_configured(self) -> bool:
        return bool(self.s3_endpoint and self.s3_access_key_id and self.s3_secret_access_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # required fields come from the environment
