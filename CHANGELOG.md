# Changelog

All notable changes to Evelynn are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Image-to-image (img2img) support
- Batch generation
- Public gallery / community showcase
- Prompt history & favourites
- Webhook notifications on generation complete

---

## [1.0.0] - 2026-03-17

### Added
- **Text-to-Image generation** via Z-Image-Turbo on Modal (L40S GPU)
- **Dashboard** with stats cards (total images, this month, this week, member since)
- **Create page** with full parameter control (width, height, steps, guidance scale, seed, negative prompt)
- **Projects page** with search, sort, pagination, and per-image delete
- **Image lightbox** for full-screen preview
- **Image download** via short-lived S3 presigned URLs
- **Credit system** — new users receive 10 free credits
- **Authentication** via better-auth (email/password, session management)
- **Billing** via Polar with webhook-based credit top-up
- **Secure image serving** — `/api/images/[...key]` verifies ownership before issuing presigned URL
- **Sidebar settings** and security settings pages
- **Customer portal** redirect to Polar
- AWS S3 storage for all generated images
- Prisma schema with User, Session, Account, Verification, ImageProject models
- Modal inference service with model weight caching via Modal Volume
- T3 Stack (Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma)

---

[Unreleased]: https://github.com/conbopk/Evelynn/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/conbopk/Evelynn/releases/tag/v1.0.0