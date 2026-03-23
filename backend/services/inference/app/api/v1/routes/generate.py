"""
POST /v1/generate — text-to-image generation endpoint.
"""

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import require_api_key
from app.models.schemas import ErrorResponse, GenerateRequest, GenerateResponse
from app.services.image_generator import ImageGeneratorService

log = logging.getLogger(__name__)
router = APIRouter()

# One thread per worker — the model is not thread-safe for concurrent inference.
_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="inference")


@router.post(
    "/generate",
    response_model=GenerateResponse,
    responses={
        401: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Generate an image from a text prompt",
    tags=["inference"],
)
async def generate(req: GenerateRequest, _key: str = Depends(require_api_key)) -> GenerateResponse:
    """
    Generate an image from a text prompt using Z-Image-Turbo.

    The generated image is uploaded to S3 and the S3 key is returned.
    Use the frontend `/api/image/{key}` route to retrieve the image via a
    short-lived presigned URL.
    """
    svc = ImageGeneratorService.get_instance()

    if not svc.is_loaded:
        # Trigger lazy load (blocks until ready)
        log.info("Lazy-loading model on first request")

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(_executor, svc.generate, req)
        return response
    except Exception as exc:
        log.exception("Image generation failed", extra={"error": str(exc)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {exc}",
        ) from exc
