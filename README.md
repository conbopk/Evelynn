<div align="center">

<img src="frontend/public/evelynn-favicons/favicon-ai_eye-128x128.png" alt="Evelynn Logo" width="72" height="72" />

# Evelynn - AI Image Generator

**Transform text into stunning images in seconds.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
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

### Backend (Inference)

| Layer     | Technology                                                                    |
|-----------|-------------------------------------------------------------------------------|
| Runtime   | [Modal](https://modal.com) (serverless GPU)                                   |
| GPU       | NVIDIA L40S                                                                   |
| Model     | [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) (Tongyi-MAI) |
| Framework | Diffusers + Pytorch                                                           |
| Storage   | AWS S3                                                                        |

---

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full ASCII system-design diagram.

```
User Browser
    │
    ▼
Next.js (Vercel) ——— better-auth ——— PostgreSQL
    │                      │
    │                    Polar (billing) 
    │ 
    ├── GET /api/images/[key] ——— S3 presigned URL ——— AWS S3
    │
    └── POST /actions/generate ——— Modal Endpoint ——— Z-Image-Turbo (L40S GPU)
                                                             │
                                                         PNG → AWS S3
```

---

## Self-Hosting Guide

### Prerequisites

- Node.js ≥ 20 & npm 11
- Python 3.12 (for backend)
- PostgreSQL database (e.g [Neon](https://neon.tech), [Supabase](https://supabase.com))
- [Modal](https://modal.com) account
- AWS S3 Bucket
- [Polar](https://polar.sh) account (optional - for billing)

---

### 1. Clone the repo

```bash
git clone https://github.com/conbopk/Evelynn.git
cd Evelynn
```

---

### 2. Backend — Modal inference service

```bash
cd backend/text-to-image

# Create and active virtualenv
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

### Backend (`backend/text-to-image/.env`)

| Variable             | Description                       |
|----------------------|-----------------------------------|
| `MODAL_KEY_ID`       | Modal API key ID (for local runs) |
| `MODAL_SECRET_KEY`   | Modal API secret key              |
| `AWS_S3_BUCKET_NAME` | Your S3 bucket name               |

Secrets on the Modal platform are managed via `modal secret create` — see step 2 above.

## Project Structure

```
Evelynn/
├── backend/
│   └── text-to-image/
│       ├── text-to-image.py   # Modal inference app (Z-Image-Turbo)
│       ├── requirements.txt
│       └── .env.example
├── frontend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── actions/           # Next.js Server Actions
│   │   ├── app/               # App Router pages & layouts
│   │   │   ├── (auth)/        # Auth pages (sign-in, sign-up …)
│   │   │   ├── (account)/     # Account pages (settings, …)
│   │   │   ├── (dashboard)/   # Protected dashboard
│   │   │   └── api/           # Route handlers (auth, images)
│   │   ├── components/        # React components
│   │   │   ├── sidebar/
│   │   │   └── ui/
│   │   ├── lib/               # auth, s3_client, utils
│   │   └── server/            # db.ts (Prisma client)
│   ├── .env.example
│   └── package.json
├── ARCHITECTURE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── README.md                  ← you are here
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

```bash
# Fork → clone → branch
git checkout -b feat/my-feature

# Make changes, then
npm run check   # lint + typecheck
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
- [create-t3-app](https://create.t3.gg/) for the Next.js scaffold
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [better-auth](https://better-auth.com) for authentication
- [Polar](https://polar.sh) for developer-friendly billing
