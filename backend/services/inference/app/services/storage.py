"""
AWS S3 storage service.
Encapsulates all S3 interactions so the rest of the app stays cloud-agnostic.
"""

import logging
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings

log = logging.getLogger(__name__)


class StorageError(RuntimeError):
    """Raised when an S3 operation fails."""


class S3StorageService:
    """Thin wrapper around boto3 S3 client."""

    def __init__(self) -> None:
        self._client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
        )
        self._bucket = settings.AWS_S3_BUCKET_NAME

    def upload(self, local_path: Path, s3_key: str, content_type: str = "image/png") -> str:
        """Upload a local file and return the S3 key."""
        try:
            self._client.upload_file(
                str(local_path),
                self._bucket,
                s3_key,
                ExtraArgs={"ContentType": content_type}
            )
            log.debug("S3 upload success", extra={"key": s3_key, "bucket": self._bucket})
            return s3_key
        except (BotoCoreError, ClientError) as exc:
            log.error("S3 upload failed", extra={"key": s3_key, "error": str(exc)})
            raise StorageError(f"S3 upload failed: {exc}") from exc

    def delete(self, s3_key: str) -> None:
        try:
            self._client.delete_object(Bucket=self._bucket, Key=s3_key)
        except (BotoCoreError, ClientError) as exc:
            raise StorageError(f"S3 delete failed: {exc}") from exc