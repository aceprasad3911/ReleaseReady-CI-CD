# CI/CD Pipeline Overview

## Pipeline flow

    Developer → Feature Branch → Pull Request → CI checks (must pass) → Merge to main
                                                                              ↓
                                                                    CD: build image
                                                                    push to GHCR
                                                                              ↓
                                                                    Deploy to staging
                                                                    Smoke test
                                                                              ↓
                                                                    Manual approval
                                                                    (production env)
                                                                              ↓
                                                                    Deploy to production
                                                                    Smoke test

## Workflow files

| File | Trigger | Purpose |
|------|---------|---------|
| ci.yml | Push/PR to main | Build, type-check, test, Trivy, CodeQL |
| cd.yml | Push to main | Build image, deploy staging → prod |
| terraform.yml | Push/PR (terraform/**) | IaC validate, plan, apply |
| security-scan.yml | Weekly + push | Dependency audit, Gitleaks |

## Environment comparison

| Aspect | Staging | Production |
|--------|---------|-----------|
| Auto-deploy | Yes | After manual approval |
| LOG_LEVEL | debug | warn |
| Container replicas | 1-3 | 2-10 |
| Log retention | 30 days | 90 days |
| Terraform state key | staging.terraform.tfstate | production.terraform.tfstate |
| GitHub env secrets | staging credentials | production credentials |

## Branch protection on main

Required before merge:
- Pull request with ≥ 1 approval
- CI: Build, Type-check & Test (must pass)
- CI: Lint Dockerfile (must pass)
- CI: CodeQL Security Analysis (must pass)
- No direct pushes allowed
