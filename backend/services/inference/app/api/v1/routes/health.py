"""
Health check endpoints.

/healthz — liveness probe (is the process alive?)
/readyz — readiness probe (is the model loaded and ready to serve?)

Kubernetes / Docker health checks should use these endpoints.
"""

from fastapi import APIRouter, Response, status

from app.core.config import settings
from app.models.schemas import HealthResponse
from app.services.image_generator import ImageGeneratorService

router = APIRouter(tags=["health"])


@router.get("/healthz", include_in_schema=False)
async def liveness() -> Response:
    """Always returns 200 if the process is alive."""
    return Response(content="ok", status_code=status.HTTP_200_OK)


@router.get("/readyz", response_model=HealthResponse, summary="Readiness probe — returns 200 only when the model is loaded")
async def readiness() -> HealthResponse:
    svc = ImageGeneratorService.get_instance()
    loaded = svc.is_loaded

    return HealthResponse(
        status="ok" if loaded else "loading",
        env=settings.ENV,
        model_id=settings.MODEL_ID,
        model_loaded=loaded,
    )
