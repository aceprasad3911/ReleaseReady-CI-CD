# ReleaseReady

> A web application used by organisations to publish short service updates to their users.

[![CI](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/ci.yml)
[![CD](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/cd.yml/badge.svg)](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/cd.yml)
[![Security Scan](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/security-scan.yml/badge.svg)](https://github.com/OWNER/ReleaseReady-CI-CD/actions/workflows/security-scan.yml)

---

## Quick start (local development)

```bash
npm install
cp .env.example .env
npm run dev
# API available at http://localhost:3000
```

## Quick start (Docker staging)

```bash
docker-compose up
curl http://localhost:3001/api/healthz
```

## Quick start (Docker staging + production)

```bash
docker-compose --profile prod up
curl http://localhost:3001/api/healthz   # staging
curl http://localhost:3002/api/healthz   # production
```

## Running tests

```bash
npm test                # all tests, verbose
npm run test:coverage   # with HTML + lcov coverage report
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check — uptime, memory, environment |
| GET | `/api/updates` | List all service updates |
| POST | `/api/updates` | Create a service update (title, body, author) |
| GET | `/api/updates/:id` | Get a specific update |
| DELETE | `/api/updates/:id` | Delete an update |

## Rollback (fastest — image tag redeploy)

```bash
gh workflow run cd.yml -f action=rollback -f image_tag=ghcr.io/OWNER/release-ready:sha-COMMIT
```

See [docs/rollback-strategy.md](docs/rollback-strategy.md) for all options.
