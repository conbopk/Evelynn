# Security Policy

## Supported Versions

| Version         | Supported |
|-----------------|-----------|
| `main` (latest) | ✅         |
| Older tags      | ❌         |

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a security issue, email us at **nguyennhuthanh0104@gmail.com**:

1. A clear description of the vulnerability
2. Steps to reproduce it
3. Potential impact
4. Any suggested mitigations (optional)

We aim to acknowledge your report within **48 hours** and will provide a more detailed response within **5 business days**.

---

## Disclosure Policy

- We will confirm the issue and work on a fix in a private branch
- We will credit you in the release notes (unless you prefer to remain anonymous)
- We ask that you give us a reasonable amount of time to fix the issue before public disclosure

---

## Security Considerations for Self-Hosters

If you are self-hosting Evelynn, please ensure:

- **`BETTER_AUTH_SECRET`** is a cryptographically random string of at least 32 characters
- **S3 bucket** is **private** — never grant public read access
- **Modal endpoint** uses proxy auth (`requires_proxy_auth=true`) — do not expose the raw Modal URL
- **Database** is not publicly accessible; use connection pooling with SSL
- **Environment variables** are never committed to source control
- **Polar webhook secret** is validated on every webhook call
- Presigned S3 URLs are short-lived (60 seconds in this codebase) — do not increase this significantly