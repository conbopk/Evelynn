"""
Request and response schemas for the inference API.
"""

from pydantic import BaseModel, Field, model_validator

from app.core.config import settings


class HealthResponse(BaseModel):
    status: str = "ok"
    env: str
    model_id: str
    model_loaded: bool


class ErrorResponse(BaseModel):
    detail: str


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000, description="Text prompt")
    negative_prompt: str | None = Field(None, max_length=10000, description="Negative prompt")
    width: int = Field(default_factory=lambda: settings.DEFAULT_WIDTH, ge=256, description="Image width in pixels")
    height: int = Field(default_factory=lambda: settings.DEFAULT_HEIGHT, ge=256, description="Image height in pixels")
    num_inference_steps: int = Field(default_factory=lambda: settings.DEFAULT_STEPS, ge=1, le=50)
    guidance_scale: float = Field(default_factory=lambda: settings.DEFAULT_GUIDANCE_SCALE, ge=0.0, le=20.0)
    seed: int | None = Field(None, ge=0, le=2**32 - 1, description="Random seed; omit for random")

    @model_validator(mode="after")
    def validate_dimensions(self) -> "GenerateRequest":
        if self.width > settings.MAX_WIDTH:
            raise ValueError(f"width must be ≤ {settings.MAX_WIDTH}")
        if self.height > settings.MAX_HEIGHT:
            raise ValueError(f"height must be ≤ {settings.MAX_HEIGHT}")
        # Enforce multiples of 64 (diffusion model requirement)
        self.width = (self.width // 64) * 64
        self.height = (self.height // 64) * 64
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "prompt": "a dragon flying over mountains, epic fantasy, 8k",
                "negative_prompt": "blurry, low quality",
                "width": 1024,
                "height": 1024,
                "num_inference_step": 9,
                "guidance_scale": 0.0,
                "seed": 42,
            }
        }
    }


class GenerateResponse(BaseModel):
    image_s3_key: str = Field(..., description="S3 object key for the generated image")
    seed: int = Field(..., description="Seed used for generation (useful for reproducibility)")
    model_id: str = Field(..., description="HuggingFace model ID used")
    width: int
    height: int
    num_inference_steps: int
    guidance_scale: float
