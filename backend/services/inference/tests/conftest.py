"""
Pytest fixtures shared across all tests.

The ML pipeline and AWS S3 are mocked so tests run without a GPU or real cloud credentials.
"""

import os
import sys
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Mock heavy ML modules BEFORE any app import
# ---------------------------------------------------------------------------
_fake_torch = MagicMock()
_fake_torch.cuda.is_available.return_value = False
_fake_torch.bfloat16 = MagicMock()

_fake_diffusers = MagicMock()
_fake_diffusers.ZImagePipeline = MagicMock()

sys.modules["torch"] = _fake_torch
sys.modules["diffusers"] = _fake_diffusers

# ---------------------------------------------------------------------------
# Force test environment BEFORE any app module is imported
# ---------------------------------------------------------------------------
os.environ.update(
    {
        "ENV": "testing",
        "LOG_FORMAT": "console",
        "LOG_LEVEL": "WARNING",
        "API_KEYS": "test-key",
        "PRELOAD_MODEL": "false",
        "AWS_ACCESS_KEY_ID": "test",
        "AWS_SECRET_ACCESS_KEY": "test",
        "AWS_REGION": "us-east-1",
        "AWS_S3_BUCKET_NAME": "test-bucket",
        "MODEL_ID": "Tongyi-MAI/Z-Image-Turbo",
        "HF_HUB_CACHE": "/tmp/test-models",
    }
)


# ---------------------------------------------------------------------------
# Mock setup
# ---------------------------------------------------------------------------

_fake_image = MagicMock()
_fake_image.save = MagicMock()


@pytest.fixture(autouse=True)
def mock_pipeline(tmp_path):
    """Replace the diffusion pipeline and S3 upload with lightweight mocks."""

    mock_pipe_cls = _fake_diffusers.ZImagePipeline
    mock_pipe_instance = MagicMock()
    mock_param = MagicMock()

    mock_pipe_instance.return_value.images = [_fake_image]
    mock_param.device.type = "cpu"
    mock_pipe_instance.parameters.return_value = [mock_param]
    mock_pipe_instance.device = "cpu"
    mock_pipe_cls.from_pretrained.return_value = mock_pipe_instance

    with patch("app.services.storage.S3StorageService.upload") as mock_s3:
        mock_s3.return_value = "images/test-uuid.png"
        yield {
            "pipeline_cls": mock_pipe_cls,
            "pipeline": mock_pipe_instance,
            "s3": mock_s3,
        }


@pytest.fixture
def client():
    """FastAPI TestClient with a fresh app instance per test."""
    from app.services.image_generator import ImageGeneratorService

    ImageGeneratorService._instance = None

    from app.main import app

    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers() -> dict[str, str]:
    return {"X-API-Key": "test-key"}
