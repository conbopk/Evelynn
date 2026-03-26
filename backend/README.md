# Evelynn — Backend

This directory contains all backend services for Evelynn.
Each service is an independent, containerized application with its own dependencies, Dockerfile, and CI/CD pipeline.

---

## Structure

```text
backend/
├── services/
│   ├── inference/          ← Text-to-Image FastAPI service (this repo's current service)
│   │   └── README.md       ← Service-specific docs
│   └── <future-service>/   ← e.g. billing-worker, notification-service, ...
│
└── text-to-image/          ← Original Modal-native deployment (kept for reference)
    ├── text-to-image.py
    ├── requirements.txt
    └── .env.example
```

---

## Services

| Service     | Language    | Framework           | Status   |
|-------------|-------------|---------------------|----------|
| `inference` | Python 3.12 | FastAPI + Diffusers | ✅ Active |

---

## Running All Services

```bash
# From /backend
make dev        # start inference service in dev mode
make test       # run all tests
make lint       # lint all services
```

See the [Makefile](./Makefile) for all available commands.

---

## Adding a New Service

1. Create `services/<service-name>/`
2. Add a `Dockerfile`, `docker-compose.yml`, `README.md`
3. Add a CI workflow under `.github/workflows/ci-<service-name>.yml`
4. Update this README's services table

Each service should be independently deployable with no shared runtime dependencies.