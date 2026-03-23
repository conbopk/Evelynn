"""Tests for POST /v1/generate."""

VALID_PAYLOAD = {
    "prompt": "a dragon flying over mountains, epic fantasy, 8k",
    "width": 512,
    "height": 512,
    "num_inference_steps": 2,
    "guidance_scale": 0.0,
}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def test_generate_no_api_key_return_401(client):
    res = client.post("/v1/generate", json=VALID_PAYLOAD)
    assert res.status_code == 401


def test_generate_wrong_api_key_returns_401(client):
    res = client.post(
        "/v1/generate",
        json=VALID_PAYLOAD,
        headers={"X-API-Key": "wrong-key"},
    )
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def test_generate_empty_prompt_returns_422(client, auth_headers):
    res = client.post("/v1/generate", json={**VALID_PAYLOAD, "prompt": ""}, headers=auth_headers)
    assert res.status_code == 422


def test_generate_invalid_dimensions_returns_422(client, auth_headers):
    res = client.post(
        "/v1/generate",
        json={**VALID_PAYLOAD, "width": 99999},
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_generate_negative_steps_returns_422(client, auth_headers):
    res = client.post(
        "/v1/generate",
        json={**VALID_PAYLOAD, "num_inference_steps": 0},
        headers=auth_headers,
    )
    assert res.status_code == 422


# ---------------------------------------------------------------------------
# Success path (pipeline + S3 are mocked in conftest)
# ---------------------------------------------------------------------------

def test_generate_success(client, auth_headers, mock_pipeline):
    from app.services.image_generator import ImageGeneratorService

    # Pre-mark as loaded to skip actual model loading
    svc = ImageGeneratorService.get_instance()
    svc._loaded = True
    svc._pipe = mock_pipeline["pipeline"]

    res = client.post("/v1/generate", json=VALID_PAYLOAD, headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert "image_s3_key" in data
    assert "seed" in data
    assert data["width"] == 512
    assert data["height"] == 512
    assert data["model_id"] == "Tongyi-MAI/Z-Image-Turbo"


def test_generate_with_seed_is_deterministic(client, auth_headers, mock_pipeline):
    from app.services.image_generator import ImageGeneratorService

    svc = ImageGeneratorService.get_instance()
    svc._loaded = True
    svc._pipe = mock_pipeline["pipeline"]

    payload = {**VALID_PAYLOAD, "seed": 42}

    r1 = client.post("/v1/generate", json=payload, headers=auth_headers)
    r2 = client.post("/v1/generate", json=payload, headers=auth_headers)

    assert r1.json()["seed"] == 42
    assert r2.json()["seed"] == 42


def test_generate_dimension_snapped_to_multiple_of_64(client, auth_headers, mock_pipeline):
    """Width/height should be rounded DOWN to nearest 64."""
    from app.services.image_generator import ImageGeneratorService

    svc = ImageGeneratorService.get_instance()
    svc._loaded = True
    svc._pipe = mock_pipeline["pipeline"]

    payload = {**VALID_PAYLOAD, "width": 500, "height": 500}
    res = client.post("/v1/generate", json=payload, headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert data["width"] == 448     # 500 // 64 * 64
    assert data["height"] == 448