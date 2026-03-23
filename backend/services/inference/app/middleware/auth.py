"""
API key authentication.

Key are passed via `X-API-Key` header.
Multiple keys are supported (rotate without downtime).

In development (ENV=development), auth is skipped if no keys are configured.
"""

import logging

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import settings

log = logging.getLogger(__name__)

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(api_key: str | None = Security(_api_key_header)) -> str:
    """FastAPI dependency — raises 401 if the key is invalid."""
    key_set = settings.api_key_set

    # Dev shortcut: skip auth when no keys are configured
    if not key_set:
        if settings.ENV == "development":
            log.debug("API key auth skipped — no keys configured (dev mode)")
            return "dev"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is not configured (no API_KEYS set)",
        )

    if api_key and api_key in key_set:
        return api_key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key",
        headers={"WWW-Authenticate": "ApiKey"},
    )
