"""S3-compatible media storage. Only a readiness probe for now; signed upload and
download URLs arrive with media in M4."""

from typing import TYPE_CHECKING

import anyio
import boto3
from botocore.config import Config

from navigator.settings import Settings

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client


def make_client(settings: Settings) -> S3Client:
    assert settings.s3_access_key_id and settings.s3_secret_access_key
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.s3_secret_access_key.get_secret_value(),
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            connect_timeout=3,
            read_timeout=5,
            retries={"max_attempts": 1},
        ),
    )


async def ping(client: S3Client, bucket: str) -> None:
    await anyio.to_thread.run_sync(lambda: client.head_bucket(Bucket=bucket))
