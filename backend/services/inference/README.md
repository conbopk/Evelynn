# Inference Service

FastAPI-based text-to-image inference service for Evelynn.
Runs [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) on any CUDA GPU,
uploads results to AWS S3, and exposes a clean REST API.

---

## Features

- `POST /v1/generate` — text-to-image generation
- `GET /v1/healthz` — liveness probe
- `GET /v1/readyz` — readiness probe (returns 200 only when model is loaded)
- `GET /metrics` — Prometheus metrics
- `GET /docs` — Swagger UI (development only)
- API key authentication via X-API-Key header
- JSON structure logging in production
- Multi-stage Docker build with NVIDIA CUDA base
- Hot-reload dev setup via docker compose

---

## Quick Start (Docker)

```bash
cp .env.example .env
# Fill in .env

# Dev (with hot reload)
docker compose up --build

# Dev + Monitoring (prometheus + grafana)
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

The API will be available at `http://localhost:8000`. Swagger UI at `http://localhost:8000/docs` (dev mode only).
Monitoring with Prometheus UI at `http://localhost:9090` and Grafana at `http://localhost:3001`.

---

## Quick Start (Local venv)

```bash
python -m venv .venv && source .venv/bin/activate

# Base + ML deps (CUDA)
pip install -r requirements/gpu.txt

# Dev/test deps only
pip install -r requirements/dev.txt

cp .env.example .env

# Start
uvicorn app.main:app --reload
```

---

## Running Tests

```bash
pip install -r requirements/dev.txt
pytest

# Test a specific file
pytest tests/test_health.py -v

# Test a specific test
pytest tests/test_generate.py::test_generate_success -v
```

Tests run without a GPU — the pipeline and S3 are mocked via `conftest.py`.

---

## API Reference

### `POST /v1/generate`

**Headers:** `X-API-Key: <key>`, `Content-Type: application/json`

**Request body:**

| Field                 | Type           | Default  | Description                           |
|-----------------------|----------------|----------|---------------------------------------|
| `prompt`              | string         | required | Text prompt (<10000 chars)            |
| `negative_prompt`     | string \| null | null     | Things to avoid                       |
| `width`               | int            | 1024     | Image width (snapped to nearest 256)  |
| `height`              | int            | 1024     | Image height (snapped to nearest 256) |
| `num_inference_steps` | int            | 9        | Denoising steps (1-50)                |
| `guidance_scale`      | float          | 0.0      | CFG scale (0-20)                      |
| `seed`                | int \| null    | random   | Seed for reproducibility              |

**Response:**

```json
{
  "image_s3_key": "images/550e8400-e29b-41d4-a716-446655440000.png",
  "seed": 1234567890,
  "model_id": "Tongyi-MAI/Z-Image-Turbo",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 9,
  "guidance_scale": 0.0
}
```

---

## Environment Variables

See [.env.example](.env.example) for the full annotated reference.

---

## Deployment Options

The service is a standard Docker container — deploy anywhere:

| Platform               | Notes                                                              |
|------------------------|--------------------------------------------------------------------|
| **EC2/bare metal**     | Use `docker compose -f docker-compose.prod.yml up -d`              |
| **EKS/GKE/AKS**        | Use the Dockerfile; add GPU node selector                          |
| **Modal**              | See `.../text-to-image/` for the original Modal-native version     |
| **RunPod/Lambda Labs** | Standard Docker GPU deployment                                     |
| **Homelab**            | Works on any machine with an NVIDIA GPU + nvidia-container-toolkit |

---

Project Structure

```text
services/inference/
├── app/
│   ├── main.py                  # FastAPI app, lifespan, middleware
│   ├── api/v1/routes/
│   │   ├── generate.py          # POST /v1/generate
│   │   └── health.py            # GET /v1/healthz, /v1/readyz
│   ├── core/
│   │   ├── config.py            # Pydantic Settings (multi-env)
│   │   └── logging.py           # JSON / console logging
│   ├── middleware/
│   │   └── auth.py              # API key dependency
│   ├── models/
│   │   └── schemas.py           # Request / response schemas
│   └── services/
│       ├── image_generator.py   # Singleton pipeline, inference logic
│       └── storage.py           # S3 upload/delete
├── tests/
│   ├── conftest.py              # Fixtures, mocks
│   ├── test_health.py
│   ├── test_generate.py
│   └── test_schemas.py
├── monitoring/                          
│   ├── prometheus.yml                #  Prometheus config
│   └── grafana/                      
│       └── provisioning/
│           ├── datasources/          
│           │   └── prometheus.yml    # auto-connect Grafana → Prometheus
│           └── dashboards/
│               ├── dashboard.yml     # Declare the folder containing the dashboard
│               └── inference.json    # dashboard definition
├── requirements/
│   ├── base.txt                      # FastAPI, boto3, prometheus
│   ├── gpu.txt                       # PyTorch CUDA + diffusers
│   └── dev.txt                       # pytest, ruff, mypy
├── scripts/
│   ├── start.sh                      # Production entrypoint with pre-flight checks
│   └── test-api.sh                   # Smoke test against live instance
├── .env.example
├── docker-compose.yml                # Dev (hot reload)
├── docker-compose.prod.yml           # Production
├── docker-compose.monitoring.yml     # Monitoring
├── Dockerfile                        # Multi-stage CUDA build
└── pyproject.toml                    # ruff, mypy, pytest config
```