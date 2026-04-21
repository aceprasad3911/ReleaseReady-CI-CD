## Appendix A — Repository Layout

The following tree shows the top three levels of the `ReleaseReady-CI-CD` repository, generated via:

```bash
tree -a -I 'node_modules|dist|coverage|.git' --dirsfirst -L 3
```

Build artefacts (`dist/`, `coverage/`), dependencies (`node_modules/`), and version-control internals (`.git/`) are excluded for clarity.

```text
.
├── .github
│   ├── workflows
│   │   ├── cd.yml
│   │   ├── ci.yml
│   │   ├── security-scan.yml
│   │   └── terraform.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── ansible
│   ├── playbooks
│   │   └── configure-container-app.yml
│   └── inventory.ini
├── docs
│   ├── diagrams
│   ├── REPORT.md
│   ├── branch-protection.md
│   ├── operational-visibility.md
│   ├── optimisation-walkthrough.md
│   ├── pipeline-overview.md
│   ├── repo-tree.txt
│   ├── rollback-strategy.md
│   └── secret-management.md
├── observability
│   ├── grafana
│   │   └── provisioning
│   └── prometheus.yml
├── src
│   ├── lib
│   │   ├── logger.ts
│   │   └── metrics.ts
│   ├── models
│   │   └── update.ts
│   ├── routes
│   │   ├── health.ts
│   │   ├── index.ts
│   │   ├── metrics.ts
│   │   └── updates.ts
│   └── index.ts
├── terraform
│   ├── main.tf
│   ├── production.tfvars
│   ├── staging.tfvars
│   └── terraform.tfvars.example
├── tests
│   ├── health.test.ts
│   ├── metrics.test.ts
│   └── updates.test.ts
├── .dockerignore
├── .env.example
├── .env.production
├── .env.staging
├── .gitignore
├── Dockerfile
├── README.md
├── SECURITY.md
├── build.mjs
├── docker-compose.observability.yml
├── docker-compose.yml
├── package-lock.json
├── package.json
├── setup-git-history.sh
├── tsconfig.json
└── vitest.config.ts
```

**Top-level layout — purpose of each directory and notable files**

| Path                                | Purpose                                                                                                               |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `.github/workflows/`                | Four GitHub Actions workflows orchestrating delivery: `ci.yml` (build, type-check, test, coverage), `cd.yml` (build/push image, deploy staging→production, manual rollback), `security-scan.yml` (Gitleaks, npm audit, Trivy, Hadolint, CodeQL), `terraform.yml` (validate/plan IaC). |
| `.github/CODEOWNERS`                | Defines required reviewers; combined with branch protection enforces code review on every change to `main`.            |
| `.github/pull_request_template.md`  | Standardises PR descriptions to include test/risk/rollback notes — supports the review-on-PR workflow.                 |
| `src/`                              | Application source — Express entry point (`index.ts`), routes, the Prometheus metrics middleware (`lib/metrics.ts`), and the structured pino logger (`lib/logger.ts`). |
| `tests/`                            | Vitest suites covering the three production routes (`health`, `metrics`, `updates`); coverage thresholds enforced by `vitest.config.ts`. |
| `terraform/`                        | Infrastructure-as-Code definitions for the Azure target environment (resource group, Container App, GHCR pull credentials), with separate `.tfvars` files per environment. |
| `ansible/`                          | Configuration-management layer that applies post-deploy settings to the Container App (env vars, scaling rules) without coupling them to image rebuilds. |
| `observability/`                    | Self-contained Prometheus + Grafana stack with checked-in datasource and dashboard provisioning — runs locally via `docker-compose.observability.yml`. |
| `docs/`                             | This report and supporting documents covering branch protection, rollback strategy, secret management, and operational visibility. |
| `Dockerfile`                        | Multi-stage build producing a small, non-root runtime image used identically in CI, locally, and in Azure.             |
| `docker-compose.yml`                | One-command local app stack for development.                                                                          |
| `docker-compose.observability.yml`  | One-command local observability stack (app + Prometheus + Grafana on host port 3030).                                 |
| `.env.example`                      | Documented environment-variable contract; the real `.env` is gitignored and absence of secrets in the repo is enforced by Gitleaks in CI. |
| `.env.production` / `.env.staging`  | Per-environment **non-sensitive** runtime configuration (NODE_ENV, PORT, LOG_LEVEL, APP_VERSION). All true secrets (Azure credentials, GHCR tokens) are injected exclusively via GitHub Actions secrets and are never committed. |
| `SECURITY.md`                       | Vulnerability-reporting policy — required artefact for the security workflow line of the brief.                       |
| `vitest.config.ts`                  | Coverage thresholds (lines 80, branches 70, functions 80, statements 80) — enforced in CI; any regression below threshold fails the build. |
| `setup-git-history.sh`              | Reproducible commit-history bootstrap used to demonstrate the branching model evidenced in §3.2.                      |