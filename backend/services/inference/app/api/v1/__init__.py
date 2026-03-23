from fastapi import APIRouter

from app.api.v1.routes import generate, health

router = APIRouter()
router.include_router(health.router)
router.include_router(generate.router)
