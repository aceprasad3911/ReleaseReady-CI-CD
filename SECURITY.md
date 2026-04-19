# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately by opening a GitHub Security Advisory
on this repository (`Security` tab → `Advisories` → `Report a vulnerability`).
Do not open a public issue.

We will acknowledge within 72 hours and aim to release a fix within 14 days
for high/critical severity issues.

---

## Threat model summary

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Source code | Supply-chain compromise via dependency | `npm audit` (weekly + per-PR), Dependabot updates, lockfile committed |
| Source code | Static vulnerabilities (injection, XSS) | CodeQL scan on every push and PR |
| Source code | Hardcoded secrets accidentally committed | `gitleaks` scan on every push and PR; pre-commit education in `docs/secret-management.md` |
| Container image | Vulnerable base layers / OS packages | Trivy scan against every CI build (CRITICAL/HIGH gated) |
| Container image | Unsafe Dockerfile patterns | Hadolint lint with `failure-threshold: error` |
| Container image | Untrusted provenance | Multi-stage build, non-root `releaseready` user, `dumb-init` PID-1, SBOM published per release |
| Runtime | Privileged container escape | Container runs as UID 1001, no `CAP_*` granted, read-only filesystem possible (compose-level) |
| Runtime | Sensitive data in logs | `pino` configured to redact `authorization`, `cookie`, `*.password`, `*.secret`, `*.token` |
| Pipeline | Token leakage via logs | All secrets are GitHub Actions Secrets; `GITHUB_TOKEN` permissions scoped per-job (`contents: read`, `packages: write` only where needed) |
| Pipeline | Unauthorised deploys | Deploy jobs gated on `environment:` rules; production requires manual approval |
| Infrastructure | Drift from declared state | Terraform plan posted on PR; apply only on `main` |
| Infrastructure | State file leakage | Remote state in Azure Blob with RBAC, no local `.tfstate` committed (enforced via `.gitignore`) |
| Secrets at rest | Hardcoded API keys | Application reads only env-vars; Azure Container App env-vars sourced from Key Vault references in production |

---

## Defence-in-depth checklist

Pipeline-stage controls applied to every change before it reaches production:

1. **Pre-commit** — `.gitignore` excludes `.env`, `*.tfvars`, state files, coverage
2. **Pull request** — CI runs lint, type-check, unit tests with coverage gate (80/80/70/80), CodeQL, gitleaks, hadolint, npm audit, Trivy image scan
3. **Merge to `main`** — Image built with provenance, signed by `GITHUB_TOKEN`, SBOM (SPDX) attached, pushed to GHCR
4. **Staging deploy** — Auto-deploy if Azure credentials present; smoke-tested against `/api/healthz`
5. **Production deploy** — Gated behind GitHub Environment approval; same image artefact promoted (no rebuild)
6. **Runtime** — Container runs as non-root, exposes liveness + readiness + Prometheus metrics, structured logs shipped to Log Analytics

---

## Known accepted risks

| Risk | Justification | Compensating control |
|------|---------------|----------------------|
| In-memory data store (no DB) | Assessment scope only | Documented future work: PostgreSQL + Drizzle migrations behind a repository interface |
| Trivy `exit-code: 0` (non-blocking) | Avoid CI breakage from upstream CVE churn during assessment window | Findings reviewed in workflow summary; would be tightened to `exit-code: 1` for CRITICAL in production |
| GitHub Actions pinned by major version (`@v4`) rather than full SHA | Readability for assessment | Production policy would pin by SHA + Dependabot for action updates |
