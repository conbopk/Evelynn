"""Unit tests for config and schema validation."""

import pytest
from pydantic import ValidationError


def test_generate_request_defaults():
    from app.models.schemas import GenerateRequest

    req = GenerateRequest(prompt="test prompt")
    assert req.width == 1024
    assert req.height == 1024
    assert req.num_inference_steps == 9
    assert req.guidance_scale == 0.0
    assert req.seed is None
    assert req.negative_prompt is None


def test_generate_request_rejects_empty_prompt():
    from app.models.schemas import GenerateRequest

    with pytest.raises(ValidationError, match="string_too_short"):
        GenerateRequest(prompt="")


def test_generate_request_rejects_oversized_dimensions():
    from app.models.schemas import GenerateRequest

    with pytest.raises(ValidationError):
        GenerateRequest(prompt="test", width=4096, height=4096)


def test_generate_request_snaps_dimensions():
    from app.models.schemas import GenerateRequest

    req = GenerateRequest(prompt="test", width=700, height=900)
    assert req.width % 64 == 0
    assert req.height % 64 == 0
    assert req.width == 640
    assert req.height == 896        # 900 // 64 = 14, 14*64 = 896


def test_settings_api_key_set():
    from app.core.config import Settings

    s = Settings(API_KEYS="key1, key2, key3", _env_file=None) # type: ignore[call-arg]
    assert s.api_key_set == {"key1", "key2", "key3"}


def test_settings_empty_api_key_set():
    from app.core.config import Settings

    s = Settings(API_KEYS="", _env_file=None)   # type: ignore[call-arg]
    assert s.api_key_set == set()