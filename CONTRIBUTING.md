# Contributing to Evelynn

Thank you for your interest in contributing! This guide will get you set up quickly.

## Table of Contents
    
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Workflow](#workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork:
    ```bash
   git clone https://github.com/conbopk/Evelynn.git
   cd Evelynn
   ```
3.  **Add upstream** remote:
    ```bash
    git remote add upstream https://github.com/conbopk/Evelynn.git
    ```
    
---

## Frontend Development

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in the required env vars (at minimum DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_BETTER_AUTH_URL)

npm run db:push   # apply schema to dev DB
npm run dev       # start dev server on :3000
```

**Quality checks before committing:**
```bash
npm run check         # eslint + tsc
npm run format:write  # prettier
```

---

### Backend Development

**Choose one of the following 2 approaches to get started with backend**

1. Modal - build backend with Modal serverless (current production)

    ```bash
    cd backend/text-to-image
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    modal setup
    ```

2. Self-hosted FastAPI

    #### Setup (Python 3.12 required)
    
    ```bash
    cd backend/services/inference
   
    python -m venv .venv
   
    # Windows
    .venv\Scripts\Activate.ps1
    # macOS /Linux
    source .venv/bin/activate 
   
    pip install --upgrade pip
    pip install -r requirements/dev.txt   # base + test/lint tools, no Pytorch
   
    cp .env.example .env
    # Set ENV=development, PRELOAD_MODEL=false — model won't load, safe for dev
    ```
    
    #### Run locally
    
    ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   # → http://localhost:8000/docs
   ```
   
    #### Run with Docker
    ```bash
   docker compose up --build
   ```
   
    #### Quality checks before committing

    ```bash
   ruff check app/ tests/           # lint
   ruff format --check app/ tests/  # format check
   ruff format app/ tests/          # auto-fix
   mypy app/                        # type check
   ```
   
    Or use the Makefile from the backend root:
    ```bash
   cd backend
   make lint      # ruff check + format check
   make format    # ruff auto-fix
   make typecheck
   ```
    
    #### Run tests

    ```bash
   pytest                           # all tests
   pytest tests/test_health.py -v   # single file
   pytest -k "test_generate" -v     # by name pattern
   ```
   
    Tests run without GPU or AWS credentials — everything is mocked in `conftest.py`.

---

## Workflow

```text
main           ← stable, always deployable
  └── feat/xyz ← your feature branch
  └── fix/abc  ← your bug-fix branch
```

1. **Sync** with upstream before starting:
    ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```
   
2. **Create a branch** off `main`:
    ```bash
   git checkout -b feat/my-feature
   ```

3. **Make your changes**, then run quality checks:
    ```bash
   cd frontend
   npm run check          # eslint + tsc
   npm run format:write   # prettier
   ```

4. **Commit** following the convention below.

5. **Push** and open a PR against `main`.

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(optional scope): <short description>

[optional body]

[optional footer]
```

| Type       | When to use                      |
|------------|----------------------------------|
| `feat`     | New feature                      |
| `fix`      | Bug fix                          |
| `docs`     | Documentation only               |
| `style`    | Formatting, no logic change      |
| `refactor` | Code restructure, no feature/fix |
| `perf`     | Performance improvement          |
| `test`     | Adding/fixing tests              |
| `chore`    | Build process, deps, tooling     |

**Examples:**
```text
feat(create): add negative prompt support in UI
fix(api): handle S3 key with spaces in presigned URL
docs: update self-hosting guide in README
chore(deps): bump next to 16.1.6
test(generate): add seed determinism test
```

---

## Pull Request Guidelines

- **One concern per PR** — don't mix unrelated changes
- **Fill in the PR template** — describe what changed and why 
- **Reference issues** — use `Closes #123` if applicable 
- **Keep it small** — large PRs are hard to review; prefer a series of small PRs
- **Screenshots** for any UI change
- All CI checks must pass before merge

---

## Reporting Issues

When filing a bug report, please include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Environment** — OS, Node version, browser
5. **Logs / screenshots** if applicable

Use the GitHub issue templates for bugs and feature requests.

---

## Questions?

Open a [Discussion](https://github.com/conbopk/Evelynn/discussions) rather than an issue for general questions.