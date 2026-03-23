"""
Image generation service.

Design decisions:
- Singleton pattern — the pipeline is heavy (~5GB), load once per process.
- Lazy loading by default; call .load() explicitly at startup if PRELOAD_MODEL=true.
- Thread-safe: inference runs synchronously; FastAPI runs it in a thread pool
  via run_in_executor so the event loop is not blocked.
"""

import logging
import os
import random
import tempfile
import threading
import uuid
from pathlib import Path

import torch
from diffusers import ZImagePipeline  # type: ignore[import]

from app.core.config import settings
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.storage import S3StorageService

log = logging.getLogger(__name__)


class ImageGeneratorService:
    """Singleton wrapper around the diffusion pipeline."""

    _instance: "ImageGeneratorService | None" = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self) -> None:
        self._pipe: ZImagePipeline | None = None  # type: ignore[valid-type]
        self._loaded = False
        self._pipe_lock = threading.Lock()

    # ------------------------------------------------------------------
    # Singleton
    # ------------------------------------------------------------------

    @classmethod
    def get_instance(cls) -> "ImageGeneratorService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        """Load the pipeline into GPU memory.   Idempotent."""
        if self._loaded:
            return

        with self._pipe_lock:
            if self._loaded:
                return

            log.info("Loading pipeline", extra={"model_id": settings.MODEL_ID})

            import torch
            from diffusers import ZImagePipeline  # type: ignore[import]

            token = (settings.HF_TOKEN or "").strip().strip('"') or None

            os.environ["HF_HUB_CACHE"] = settings.HF_HUB_CACHE

            self._pipe = ZImagePipeline.from_pretrained(
                settings.MODEL_ID,
                torch_dtype=torch.bfloat16,
                low_cpu_mem_usage=False,
                token=token,
            )

            device = "cuda" if torch.cuda.is_available() else "cpu"
            if device == "cpu":
                log.warning("No CUDA GPU detected — running on CPU (very slow!)")

            self._pipe = self._pipe.to(device)  # type: ignore[union-attr]
            self._loaded = True

            log.info(
                "Pipeline ready",
                extra={"model_id": settings.MODEL_ID, "device": device},
            )

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def generate(self, req: GenerateRequest) -> GenerateResponse:
        """Run inference and upload the result to S3.

        This method is synchronous and blocking. Call from a thread pool
        to avoid blocking to FastAPI event loop.
        """
        if not self._loaded:
            self.load()

        seed = int(req.seed) if req.seed is not None else random.randint(0, 2**32 - 1)
        device = str(self._pipe.device)  # type: ignore[union-attr]
        gen = torch.Generator(device).manual_seed(seed)

        log.info(
            "Generating image",
            extra={
                "prompt_len": len(req.prompt),
                "seed": seed,
                "steps": req.num_inference_steps,
                "scale": req.guidance_scale,
                "size": f"{req.width}x{req.height}",
            },
        )

        result = self._pipe(  # type: ignore[union-attr, operator, misc]
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            height=req.height,
            width=req.width,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            generator=gen,
        )
        img = result.images[0]

        # ----------------------------------------------------------------
        # Upload to S3
        # ----------------------------------------------------------------
        s3_key = f"{settings.S3_KEY_PREFIX}/{uuid.uuid4()}.png"

        with tempfile.TemporaryDirectory(prefix="evelynn_") as tmp:
            out_path = Path(tmp) / "out.png"
            img.save(out_path)

            storage = S3StorageService()
            storage.upload(local_path=out_path, s3_key=s3_key)

        log.info("Image uploaded", extra={"s3_key": s3_key, "seed": seed})

        return GenerateResponse(
            image_s3_key=s3_key,
            seed=seed,
            model_id=settings.MODEL_ID,
            width=req.width,
            height=req.height,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
        )
