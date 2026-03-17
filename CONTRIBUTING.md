# Contributing to Evelynn

Thank you for your interest in contributing! This guide will get you set up quickly.

## Table of Contents
    
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Workflow](#workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Getting Started

1. **Fork** the repository on Github
2. **Clone** your fork:
    ```bash
   git clone https://github.com/conbopk/Evelynn.git
   cd evelynn
   ```
3.  **Add upstream** remote:
    ```bash
    git remote add upstream https://github.com/conbopk/Evelynn.git
    ```
    
---

## Development Setup

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in the required env vars (at minimum DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)

npm run db:push   # apply schema to dev DB
npm run dev       # start dev server on :3000
```

### Backend

```bash
cd backend/text-to-image
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
modal setup
```

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

3. **Make changes**, then run quality checks:
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

Use the Github issue templates for bugs and feature requests.

---

## Questions?

Open a [Discussion](https://github.com/conbopk/Evelynn.git/discussions) rather than an issue for general questions.