"""
Evelynn — Inference Service
FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.v1 import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.services.image_generator import ImageGeneratorService

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    import logging
    log = logging.getLogger(__name__)

    log.info("Starting inference service", extra={"model_id": settings.MODEL_ID})

    if settings.PRELOAD_MODEL:
        svc = ImageGeneratorService.get_instance()
        svc.load()
        log.info("Model pre-loaded successfully")
    else:
        log.info("Model will be loaded on first request (PRELOAD_MODEL=false)")

    yield

    log.info("Shutting down inference service")

app = FastAPI(
    title="Evelynn Inference Service",
    description="Text-to-Image generation API powered by Z-Image-Turbo",
    version="1.0.0",
    docs_url="/docs" if settings.ENV != "production" else None,
    redoc_url="/redoc" if settings.ENV != "production" else None,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Prometheus metrics — /metrics
# ---------------------------------------------------------------------------
Instrumentator(
    should_group_status_codes=True,
    should_group_untemplated=True,
    excluded_handlers=["/healthz", "/readyz", "/metrics"]
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(v1_router, prefix="/v1")