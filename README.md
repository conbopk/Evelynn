<div align="center">

<img src="frontend/public/evelynn-favicons/favicon-ai_eye-128x128.png" alt="Evelynn Logo" width="72" height="72" />

# Evelynn - AI Image Generator

**Transform text into stunning images in seconds.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135.1-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Modal](https://img.shields.io/badge/Modal-GPU%20Inference-5B4BF5?logo=modal)](https://modal.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[Live Demo](https://evelynn-v0.vercel.app/) • [Report Bug](https://github.com/conbopk/Evelynn/issues) • [Request Feature](https://github.com/conbopk/Evelynn/issues)

</div>

---

## What is Evelynn ?

Evelynn is a **full-stack AI image generation SaaS** built with the T3 stack. Users type a text prompt and get a
high-quality image back in seconds — powered by the **Z-Image-Turbo** diffusion model running on Modal's GPU cloud, with
outputs stored on AWS S3.

Everything is included: authentication, a credit system, a billing via Polar, image history with pagination, and a clean
dashboard – all ready to self-host or ship as a product.

The inference backend ships in **two flavours**:
- **Modal** — serverless GPU, zero infrastructure to manage, cold-start aware
- **FastAPI** (`backend/services/inference/`) — Docker container, runs on CUDA GPU (EC2, RunPod, EKS, homelab), full observability with Prometheus + Grafana 

---

## Screenshots

| Auth                                                | Dashboard                                                 | Create                                               | Projects                                              |
|-----------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------|-------------------------------------------------------|
| *[sign-in page](docs/screenshots/sign-in-page.png)* | *[stats + quick actions](docs/screenshots/dashboard.png)* | *[prompt → image](docs/screenshots/create-page.png)* | *[image library](docs/screenshots/image-library.png)* |

---

## Tech Stack

### Frontend

| Layer      | Technology                                                            |
|------------|-----------------------------------------------------------------------|
| Framework  | [Next.js 16](https://nextjs.org) (App Router, Turbopack)              |
| Language   | TypeScript 5                                                          |
| Styling    | Tailwind CSS v4 + shadcn/ui                                           |
| Auth       | [better-auth](https://better-auth.com) + `@daveyplate/better-auth-ui` |
| ORM        | [Prisma 6](https://prisma.io) + PostgreSQL                            |
| Payments   | [Polar](https://polar.sh) via `@polar-sh/better-auth`                 |
| Storage    | AWS S3 + presigned URLs                                               |
| Deployment | [Vercel](https://vercel.com)                                          |

### Backend — Option A: Modal (serverless, current product)

| Layer     | Technology                                                                    |
|-----------|-------------------------------------------------------------------------------|
| Runtime   | [Modal](https://modal.com) (serverless GPU)                                   |
| GPU       | NVIDIA L40S                                                                   |
| Model     | [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) (Tongyi-MAI) |
| Framework | Diffusers + Pytorch                                                           |
| Storage   | AWS S3                                                                        |

### Backend — Option B: FastAPI service (self-hosted)

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Framework  | [FastAPI](https://fastapi.tiangolo.com) + Uvicorn |
| Language   | Python 3.12                                       |
| Model      | Z-Image-Turbo via Diffusers + Pytorch (CUDA)      |
| Packaging  | Docker (multi-stage, NVIDIA CUDA base)            |
| Monitoring | Prometheus + Grafana                              |
| CI/CD      | GitHub Actions + GHCR                             |
| Storage    | AWS S3                                            |

---

## Architecture

See [System Design Excalidraw](./docs/system-design.excalidraw) for full beauty excalidraw system-design diagram or [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full ASCII system-design diagram.

```text
User Browser
    │
    ▼
Next.js (Vercel) ——— better-auth ——— PostgreSQL
    │                      │
    │                   Polar (billing)
    │
    ├── GET /api/images/[key] ——— S3 presigned URL ——— AWS S3
    │
    └── POST /actions/generate
              │
              ├── Option A: Modal Endpoint ——— Z-Image-Turbo (L40S GPU)
              │                                        │
              └── Option B: FastAPI /v1/generate       └── PNG → AWS S3
                           (Docker, CUDA GPU)
```

---

## Self-Hosting Guide

### Prerequisites

- Node.js ≥ 20 & npm 11
- Python 3.12 (for backend)
- PostgreSQL database (e.g [Neon](https://neon.tech), [Supabase](https://supabase.com))
- AWS S3 Bucket
- [Polar](https://polar.sh) account (optional - for billing)
- **Option A only:** [Modal](https://modal.com) account
- **Option B only:** Docker Desktop + NVIDIA with [nvidia-container-toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

---

### 1. Clone the repo

```bash
git clone https://github.com/conbopk/Evelynn.git
cd Evelynn
```

---

### 2A. Backend — Modal (serverless)

```bash
cd backend/text-to-image

# Create and activate virtualenv
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Authenticate Modal
modal setup

# Create secrets on Modal dashboard (or via CLI):
#   HF_TOKEN          — HuggingFace token (for gated models)
#   AWS_ACCESS_KEY_ID
#   AWS_SECRET_ACCESS_KEY
#   AWS_S3_BUCKET_NAME
#   AWS_DEFAULT_REGION

# Deploy
modal deploy text-to-image.py

# Note the endpoint URL printed after deploy — you'll need it for the frontend
```

**Test locally:**

```bash
cp .env.example .env    # Fill in MODAL_KEY_ID, MODAL_SECRET_KEY, AWS_S3_BUCKET_NAME
modal run text-to-image.py --prompt "a dragon flying over mountains"
```

---

### 2B. Backend - FastAPI service (Docker)

```bash
cd backend/services/inference

cp .env.example .env
# Fill in: API_KEYs, AWS_*, HF_TOKEN, MODEL_ID

# Dev (hot reload, PRELOAD_MODEL=false)
docker compose up --build

# Production (pulls image from GHCR)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With Prometheus + Grafana monitoring
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build
```

| Endpoint      | URL                                     |
|---------------|-----------------------------------------|
| API + Swagger | `http://localhost:8000/docs`            |
| Prometheus    | `http://localhost:9090`                 |
| Grafana       | `http://localhost:3001` (admin / admin) |

See [`backend/services/inference/README.md`](./backend/services/inference/README.md) for the full guide.

---

### 3. Frontend - Next.js app

```bash
cd frontend

npm install

cp .env.example .env.local
# Fill in all values — see .env.example for description
```

**Run database migrations:**

```bash
npm run db:push       # development (no migration history)
# or
npm run db:migrate    # production (applies migration files)
```

**Start dev server:**

```bash
npm run dev
# → http://localhost:3000
```

**Build for production:**

```bash
npm run build
npm start
```

### 4. AWS S3 - Bucket setup

1. Create an S3 bucket (e.g. `evelynn-images`)
2. Keep the bucket **private** — all access goes through presigned URLs
3. Add a CORS configuration:

    ```json
    [
      {
        "AllowedHeaders": [
          "*"
        ],
        "AllowedMethods": [
          "GET",
          "PUT",
          "POST"
        ],
        "AllowedOrigins": [
          "https://your-domain.com"
        ],
        "ExposeHeaders": []
      }
    ]
    ```

4. Create an IAM user with `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on your bucket, then use those credentials
   in both the Modal secret and the frontend `.env`.

---

### 5. Polar — Billing (optional)

1. Create a [Polar](https://polar.sh) account and a product/plan
2. Set `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` in `.env.local`
3. Point Polar webhook to `https://your-domain.com/api/auth` (better-auth handles Polar events automatically via
   `@polar-sh/better-auth`)

---

## Environment Variables

### Frontend (`frontend/.env.local`)

See [`frontend/.env.example`](./frontend/.env.example) for a fully annotated reference.

| Variable                      | Description                               |
|-------------------------------|-------------------------------------------|
| `DATABASE_URL`                | PostgreSQL connection string              |
| `BETTER_AUTH_SECRET`          | Random 32-char secret for session signing |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public URL of your app                    |
| `AWS_ACCESS_KEY_ID`           | IAM key with S3 access                    |
| `AWS_SECRET_ACCESS_KEY`       | IAM secret                                |
| `AWS_S3_BUCKET_NAME`          | Your S3 bucket name                       |
| `AWS_REGION`                  | e.g. `us-east-1`                          |
| `MODAL_BACKEND_URL`           | Endpoint URL from `modal deploy`          |
| `MODAL_KEY_ID`                | Modal API key ID                          |
| `MODAL_SECRET_KEY`            | Modal API secret key                      |
| `POLAR_ACCESS_TOKEN`          | Polar API token (billing)                 |
| `POLAR_WEBHOOK_SECRET`        | Polar webhook secret                      |

### Backend Option A — Modal (`backend/text-to-image/.env`)

| Variable             | Description                       |
|----------------------|-----------------------------------|
| `MODAL_KEY_ID`       | Modal API key ID (for local runs) |
| `MODAL_SECRET_KEY`   | Modal API secret key              |
| `AWS_S3_BUCKET_NAME` | Your S3 bucket name               |

Secrets on the Modal platform are managed via `modal secret create` — see step 2A above.

### Backend Option B — FastAPI (`backend/services/inference/.env`)

See [backend/services/inference/.env.example](./backend/services/inference/.env.example) for a fully annotated reference.

| Variable        | Description                               |
|-----------------|-------------------------------------------|
| `API_KEYS`      | Comma-separated keys for `X-API-Key` auth |
| `AWS_*`         | Same IAM credentials as frontend          |
| `HF_TOKEN`      | HuggingFace token (for gated models)      |
| `MODEL_ID`      | HuggingFace model ID                      |
| `PRELOAD_MODEL` | `true` = load at startup, `false` = lazy  |
| `CORS_ORIGINS`  | Comma-separated allowed origins           |

---

## Project Structure

```text
Evelynn/
├── .github/
│   ├── ISSUE_TEMPLATE/            # Bug report & feature request forms
│   ├── workflows/
│   │   ├── ci-inference.yml       # CI: lint → test → docker build (on PRs)
│   │   └── cd-inference.yml       # CD: build + push to GHCR (on main merge)
│   └── PULL_REQUEST_TEMPLATE.md
│
├── backend/
│   ├── services/
│   │   └── inference/             # FastAPI service — Docker, any CUDA GPU
│   │       ├── app/               # FastAPI application
│   │       ├── tests/             # pytest suite (no GPU required)
│   │       ├── monitoring/        # Prometheus + Grafana config
│   │       ├── requirements/      # base / gpu / dev split
│   │       ├── scripts/           # start.sh, test-api.sh
│   │       ├── Dockerfile
│   │       ├── docker-compose.yml
│   │       ├── docker-compose.prod.yml
│   │       └── docker-compose.monitoring.yml
│   │
│   └── text-to-image/             # Modal-native deployment (Option A)
│       ├── text-to-image.py
│       ├── requirements.txt
│       └── .env.example
│
├── docs/
│   ├── screenshots/               # App screenshots for README
│   └── system-design.excalidraw  # Full system design diagram
│
├── frontend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── actions/               # Next.js Server Actions
│   │   ├── app/                   # App Router pages & layouts
│   │   │   ├── (auth)/            # Sign-in, sign-up
│   │   │   ├── (account)/         # Account pages
│   │   │   ├── (dashboard)/       # Protected dashboard
│   │   │   └── api/               # Route handlers (auth, images)
│   │   ├── components/            # React components
│   │   │   ├── sidebar/
│   │   │   └── ui/                # shadcn/ui components
│   │   ├── lib/                   # auth, s3_client, utils
│   │   └── server/                # db.ts (Prisma client)
│   ├── .env.example
│   └── package.json
│
├── Makefile                       # Dev shortcuts (make dev, make test, make monitor…)
├── ARCHITECTURE.md                # ASCII system-design diagrams
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── README.md                      ← you are here
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

```bash
# Fork → clone → branch
git checkout -b feat/my-feature

# Frontend changes
cd frontend && npm run check    # eslint + tsc

# Backend changes
cd backend/services/inference
source .venv/bin/activate
ruff check app/ tests/ && pytest

git commit -m "feat: add my feature"
git push origin feat/my-feature
# Open a pull request
```

---

## Security

Found a vulnerability? Please **do not** open a public issue. Read [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

---

## License

[Apache License 2.0](LICENSE) — free to use, modify, and distribute.

---

## Acknowledgements

- [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) by Tongyi-MAI
- [Modal](https://modal.com) for serverless GPU infra
- [FastAPI](https://fastapi.tiangolo.com) for the Python web framework
- [create-t3-app](https://create.t3.gg/) for the Next.js scaffold
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [better-auth](https://better-auth.com) for authentication
- [Polar](https://polar.sh) for developer-friendly billing