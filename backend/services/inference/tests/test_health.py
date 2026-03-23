"""Tests for /v1/healthz and /v1/readyz endpoints."""


def test_liveness(client):
    res = client.get("/v1/healthz")
    assert res.status_code == 200
    assert res.text == "ok"


def test_readiness_before_model_load(client):
    res = client.get("/v1/readyz")
    assert res.status_code == 200
    data = res.json()
    assert data["model_loaded"] is False
    assert data["status"] == "loading"
    assert data["env"] == "testing"


def test_readiness_after_model_load(client):
    from app.services.image_generator import ImageGeneratorService

    svc = ImageGeneratorService.get_instance()
    # Simulate loaded state
    svc._loaded = True

    res = client.get("/v1/readyz")
    assert res.status_code == 200
    data = res.json()
    assert data["model_loaded"] is True
    assert data["status"] == "ok"
