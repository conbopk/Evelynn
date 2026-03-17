# Evelynn — System Architecture

## High-Level Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │  HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                                  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    NEXT.JS 16 APP (App Router)                      │   │
│   │                                                                     │   │
│   │   ┌──────────────┐   ┌───────────────┐   ┌──────────────────────┐   │   │
│   │   │  (auth)      │   │  (dashboard)  │   │  API Routes          │   │   │
│   │   │  /auth/[path]│   │  /dashboard   │   │  /api/auth/[...all]  │   │   │
│   │   │              │   │  /create      │   │  /api/images/[...key]│   │   │
│   │   │  AuthView    │   │  /projects    │   └──────────────────────┘   │   │
│   │   │  (better-    │   │  /settings    │                              │   │
│   │   │   auth-ui)   │   │  /customer-   │                              │   │
│   │   └──────┬───────┘   │   portal      │                              │   │
│   │          │           └───────┬───────┘                              │   │
│   │          │                   │                                      │   │
│   │          │                   ▼                                      │   │
│   │          │       ┌────────────────────────────────────┐             │   │  
│   │          │       │  Server Actions (text-to-image.ts) │             │   │ 
│   │          │       │     generateImage()                │             │   │   
│   │          │       │     getUserImageProjects()         │             │   │   
│   │          │       │     deleteImageProject()           │             │   │   
│   │          │       │     getUserImageStats()            │             │   │   
│   │                  └────────────────────────────────────┘             │   │
│   └──────────┼───────────────────┼──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
               │                   │
    ┌──────────┘                   │
    │                              │
    ▼                              ▼
┌──────────────────────┐   ┌─────────────────────────────────────────────────┐
│   BETTER-AUTH        │   │              MODAL INFERENCE SERVICE            │
│                      │   │                                                 │
│  • Email/Password    │   │   ┌──────────────────────────────────────────┐  │
│  • OAuth providers   │   │   │  ZImageServer (@app.cls)                 │  │
│  • Session mgmt      │   │   │                                          │  │
│  • Polar plugin      │   │   │  GPU: NVIDIA L40S                        │  │
│  • Credits system    │   │   │  Model: Z-Image-Turbo (bfloat16)         │  │
└──────────┬───────────┘   │   │                                          │  │
           │               │   │  @modal.enter()  → load pipeline         │  │
           ▼               │   │  POST /generate  → run inference         │  │
┌──────────────────────┐   │   └──────────────┬───────────────────────────┘  │
│   POSTGRESQL         │   │                  │                              │
│   (via Prisma)       │   │   ┌──────────────┘                              │
│                      │   │   │  Model weights cached on                    │
│  • user              │   │   │  Modal Volume (/models)                     │
│  • session           │   │   │  pulled once from HuggingFace Hub           │
│  • account           │   └───┼─────────────────────────────────────────────┘
│  • verification      │       │
│  • image_project     │       │  PNG output
└──────────────────────┘       │
                               ▼
                    ┌─────────────────────┐
                    │    AWS S3 BUCKET    │
                    │    (private)        │
                    │                     │
                    │  images/<uuid>.png  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┘
              │  Presigned URL (60s expiry)
              │  via GET /api/images/[...key]
              ▼
        User Browser
        (image rendered)
```

---

## Request Flow: Image Generation

```text
 Client                  Next.js Server              Modal              AWS S3
   │                          │                         │                  │
   │  click "Generate"        │                         │                  │
   ├─────────────────────────►│                         │                  │
   │                          │  1. validate session    │                  │
   │                          │  2. check credits > 0   │                  │
   │                          │  3. decrement credits   │                  │
   │                          │                         │                  │
   │                          │  POST /generate         │                  │
   │                          ├────────────────────────►│                  │
   │                          │  {prompt, width,        │                  │
   │                          │   height, steps, seed}  │                  │
   │                          │                         │                  │
   │                          │                         │  run inference   │
   │                          │                         │  (~5-15s on L40S)│
   │                          │                         │                  │
   │                          │                         │  img.save() →    │
   │                          │                         ├─────────────────►│
   │                          │                         │  PutObject       │
   │                          │                         │  images/<uuid>   │
   │                          │                         │                  │
   │                          │◄────────────────────────┤                  │
   │                          │  {image_s3_key, seed,   │                  │
   │                          │   model_id}             │                  │
   │                          │                         │                  │
   │                          │  save ImageProject      │                  │
   │                          │  to PostgreSQL          │                  │
   │                          │                         │                  │
   │◄─────────────────────────┤                         │                  │
   │  {success, s3_key, seed} │                         │                  │
   │                          │                         │                  │
   │  render image via        │                         │                  │
   │  /api/images/<s3_key>    │                         │                  │
   ├─────────────────────────►│                         │                  │
   │                          │  verify ownership       │                  │
   │                          │  GetObject presigned    │                  │
   │                          ├──────────────────────────────────────────► │
   │                          │                          presigned URL     │
   │◄─────────────────────────┤◄───────────────────────────────────────────┤
   │  302 → presigned URL     │                         │                  │
   │  (browser fetches image) │                         │                  │
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
     │  (subscription event)  │                           │               │
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
│Session │ │Account  │  (better-auth managed)
└────────┘ └─────────┘
```

---

## Infrastructure Map

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
       └── Polar subscription event
                │
                ▼
           better-auth Polar plugin
                │
                ▼
           UPDATE user SET credits += plan_credits
```