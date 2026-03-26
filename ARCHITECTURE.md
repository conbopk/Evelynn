# Evelynn — System Architecture

## High-Level Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │  HTTPS
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                                 │
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                    NEXT.JS 16 APP (App Router)                     │   │
│   │                                                                    │   │
│   │   ┌──────────────┐   ┌───────────────┐   ┌──────────────────────┐  │   │
│   │   │  (auth)      │   │  (dashboard)  │   │  API Routes          │  │   │
│   │   │  /auth/[path]│   │  /dashboard   │   │  /api/auth/[...all]  │  │   │
│   │   │              │   │  /create      │   │  /api/images/[...key]│  │   │
│   │   │  AuthView    │   │  /projects    │   └──────────────────────┘  │   │
│   │   │  (better-    │   │  /settings    │                             │   │
│   │   │   auth-ui)   │   │  /customer-   │                             │   │
│   │   └──────┬───────┘   │   portal      │                             │   │
│   │          │           └───────┬───────┘                             │   │
│   │          │                   │                                     │   │
│   │          │       Server Actions (text-to-image.ts)                 │   │
│   │          │         generateImage()                                 │   │
│   │          │         getUserImageProjects()                          │   │
│   │          │         deleteImageProject()                            │   │
│   │          │         getUserImageStats()                             │   │
│   └──────────┼───────────────────┼─────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
               │                   │
    ┌──────────┘                   │
    │                              │
    ▼                              ▼
┌──────────────────────┐   ┌──────────────────────────────────────────────────┐
│   BETTER-AUTH        │   │           INFERENCE BACKEND  (choose one)        │
│                      │   │                                                  │
│  • Email/Password    │   │  Option A — Modal (current production)           │
│  • OAuth providers   │   │  ┌────────────────────────────────────────────┐  │
│  • Session mgmt      │   │  │  ZImageServer (@app.cls)                   │  │
│  • Polar plugin      │   │  │  GPU: NVIDIA L40S  |  scaledown: 600s      │  │
│  • Credits system    │   │  │  @modal.enter() → load pipeline            │  │
└──────────┬───────────┘   │  │  POST /generate_image.get_web_url()        │  │
           │               │  │          → run inference                   │  │
           │               │  │  Auth: Modal-Key + Modal-Secret headers    │  │
           ▼               │  └────────────────────────────────────────────┘  │
┌──────────────────────┐   │                                                  │
│   POSTGRESQL         │   │  Option B — FastAPI service (self-hosted)        │
│   (via Prisma)       │   │  ┌────────────────────────────────────────────┐  │
│                      │   │  │  backend/services/inference                │  │
│  • user              │   │  │  FastAPI + Uvicorn + Diffusers             │  │
│  • session           │   │  │  Docker container, any CUDA GPU            │  │
│  • account           │   │  │  POST /v1/generate                         │  │
│  • verification      │   │  │  Auth: X-API-Key header                    │  │
│  • image_project     │   │  │  Metrics: /metrics (Prometheus)            │  │
└──────────────────────┘   │  └────────────────────────────────────────────┘  │
                           └──────────────────────────────────────────────────┘
                                              │
                                              │  PNG → PutObject
                                              ▼
                                   ┌─────────────────────┐
                                   │    AWS S3 BUCKET    │
                                   │    (private)        │
                                   │  images/<uuid>.png  │
                                   └──────────┬──────────┘
                                              │  Presigned URL (60s)
                                              │  via GET /api/images/[...key]
                                              ▼
                                        User Browser
```

---

## Request Flow: Image Generation

```text
 Client                  Next.js Server         Inference Backend       AWS S3
   │                          │                         │                  │
   │  click "Generate"        │                         │                  │
   ├─────────────────────────►│                         │                  │
   │                          │  1. validate session    │                  │
   │                          │  2. check credits > 0   │                  │
   │                          │                         │                  │
   │                          │                         │                  │
   │                          │  POST /generate         │                  │
   │                          │  (Modal-Key headers     │                  │
   │                          │   or X-API-Key)         │                  │
   │                          ├────────────────────────►│                  │
   │                          │  {prompt, width,        │                  │
   │                          │   height, steps, seed}  │                  │
   │                          │                         │  run inference   │
   │                          │                         │  (~5-15s GPU)    │
   │                          │                         │                  │
   │                          │                         │  img.save() →    │
   │                          │                         ├─────────────────►│
   │                          │    3. decrement credits │  PutObject       │
   │                          │◄────────────────────────┤                  │
   │                          │  {image_s3_key, seed,   │                  │
   │                          │   model_id}             │                  │
   │                          │  save ImageProject → DB │                  │
   │◄─────────────────────────┤                         │                  │
   │  {success, s3_key, seed} │                         │                  │
   │                          │                         │                  │
   │  GET /api/images/<key>   │                         │                  │
   ├─────────────────────────►│                         │                  │
   │                          │verify ownership in DB   │                  │
   │                          │  GetObject presigned    │                  │
   │                          ├────────────────────────────────────────────►
   │◄─────────────────────────┤◄────────────────────────────────────────────
   │  302 → presigned URL     │                         │                  │
   │◄──────────────────────────────────────────────────────────────────────┤
   │  PNG image               │                         │                  │
```

---

## Request Flow: Auth + Session

```text
  Browser                better-auth                 PostgreSQL        Polar
     │                        │                           │               │
     │  POST /api/auth/sign-in│                           │               │
     ├───────────────────────►│                           │               │
     │                        │  SELECT user WHERE email  │               │
     │                        ├──────────────────────────►│               │
     │                        │◄──────────────────────────┤               │
     │                        │  verify password hash     │               │
     │                        │  INSERT session           │               │
     │                        ├──────────────────────────►│               │
     │◄───────────────────────┤                           │               │
     │  Set-Cookie: session   │                           │               │
     │                        │                           │               │
     │  (Credit-based system) │                           │               │
     │                        │◄──────────────────────────────────────────┤
     │                        │  POST /api/auth (webhook) │               │
     │                        │  grant credits / plan     │               │
     │                        ├──────────────────────────►│               │
     │                        │  UPDATE user.credits      │               │
```

## Data Model

```text
┌──────────────┐        ┌─────────────────────┐
│    User      │        │    ImageProject     │
├──────────────┤        ├─────────────────────┤
│ id (PK)      │──┐     │ id (cuid, PK)       │
│ name         │  └────►│ userId (FK)         │
│ email        │        │ name?               │
│ emailVerified│        │ prompt              │
│ image?       │        │ negativePrompt?     │
│ credits      │        │ s3Key               │
│ createdAt    │        │ width / height      │
│ updatedAt    │        │ numInferenceSteps   │
└──────────────┘        │ guidanceScale       │
       │                │ seed (BigInt)       │
       │                │ modelId             │
  ┌────┴──────┐         │ createdAt           │
  │           │         │ updatedAt           │
  ▼           ▼         └─────────────────────┘
┌────────┐ ┌─────────┐
│Session │ │ Account │  (better-auth managed)
└────────┘ └─────────┘
```

---

## Infrastructure Map

### Option A ─ Modal (current production)

```text
┌───────────────────────────────────────────────────────────┐
│                        PRODUCTION                         │
│                                                           │
│  ┌─────────────┐   ┌────────────────┐   ┌─────────────┐   │
│  │   Vercel    │   │     Modal      │   │   AWS S3    │   │
│  │  (frontend) │   │  (inference)   │   │  (storage)  │   │
│  │  Next.js 16 │   │  L40S GPU      │   │  private    │   │
│  │  Edge CDN   │   │  scaledown=10m │   │  bucket     │   │
│  └──────┬──────┘   └───────┬────────┘   └──────┬──────┘   │
│         │                  │                   │          │
│  ┌──────▼──────┐           │                   │          │
│  │ PostgreSQL  │           │                   │          │
│  │ (Neon/      │           └──────────────────►│          │
│  │  Supabase)  │                  upload PNG              │
│  └─────────────┘                                          │
│                                                           │
│  ┌─────────────┐                                          │
│  │    Polar    │◄─── webhook ──── better-auth             │
│  │  (billing)  │                                          │
│  └─────────────┘                                          │
└───────────────────────────────────────────────────────────┘
```

### Option B ─ Self-hosted FastAPI (backend/services/inference)

```text
┌──────────────────────────────────────────────────────────┐
│                        PRODUCTION                        │
│                                                          │
│  ┌─────────────┐   ┌────────────────┐   ┌─────────────┐  │
│  │   Vercel    │   │  EC2 / VPS /   │   │   AWS S3    │  │
│  │  (frontend) │   │  RunPod / EKS  │   │  (storage)  │  │
│  │  Next.js 16 │   │                │   │  private    │  │
│  │  Edge CDN   │   │  FastAPI       │   │  bucket     │  │
│  │             │   │  Uvicorn       │   │             │  │
│  │             │   │  CUDA GPU      │   │             │  │
│  └──────┬──────┘   └───────┬────────┘   └──────┬──────┘  │
│         │               ▲  │                   │         │
│  ┌──────▼──────┐        │  └──────────────────►│         │
│  │ PostgreSQL  │        │          upload PNG            │
│  └─────────────┘        │                                │
│                         │                                │
│  ┌─────────────┐        │ scrape at /metrics             │
│  │   Polar     │   ┌────────────────┐                    │
│  │  (billing)  │   │   Prometheus   │                    │
│  └─────────────┘   │   + Grafana    │                    │
│                    │  (monitoring)  │                    │
│                    └────────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

---

## FastAPI Service ─ Internal Architecture

```text
┌──────────────────────────────────────────────────────────┐
│              backend/services/inference                  │
│                                                          │
│  Request                                                 │
│     │                                                    │
│     ▼                                                    │
│  CORSMiddleware                                          │
│     │                                                    │
│     ▼                                                    │
│  POST /v1/generate                                       │
│     │                                                    │
│     ├── require_api_key (X-API-Key header) ──► 401       │
│     │                                                    │
│     ├── GenerateRequest validation ──────────► 422       │
│     │   (prompt, dimensions snap to 64,                  │
│     │    steps, scale, seed)                             │
│     │                                                    │
│     ▼                                                    │
│  ThreadPoolExecutor (max_workers=1)                      │
│     │   (keeps event loop non-blocking)                  │
│     ▼                                                    │
│  ImageGeneratorService.generate()  [singleton]           │
│     │                                                    │
│     ├── ZImagePipeline (loaded once on startup)          │
│     │   torch.bfloat16, CUDA GPU                         │
│     │                                                    │
│     ├── Generate PIL image                               │
│     │                                                    │
│     └── S3StorageService.upload()                        │
│         images/<uuid>.png → AWS S3                       │
│                                                          │
│  GET /v1/healthz  → liveness  (always 200)               │
│  GET /v1/readyz   → readiness (200 only when loaded)     │
│  GET /metrics     → Prometheus scrape endpoint           │
└──────────────────────────────────────────────────────────┘
```

---

## Credits System Flow

```text
  New User signup
       │
       ▼
  credits = 10 (default)
       │
       ├── User generates image → credits -= 1
       │
       ├── credits == 0 → show upgrade prompt
       │
       └── Polar credit-based system
                │
                ▼
           better-auth Polar plugin
                │
                ▼
           UPDATE user SET credits += plan_credits
```