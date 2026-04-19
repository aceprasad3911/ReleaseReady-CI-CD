# Secret Management Strategy

## Layer 1 — Local Development

Copy `.env.example` to `.env` and fill in values.
`.env` is gitignored and is NEVER committed.

## Layer 2 — GitHub Actions Secrets

Secrets are stored per-environment in GitHub (Settings → Environments):

| Secret | Used by | Purpose |
|--------|---------|---------|
| AZURE_CREDENTIALS | cd.yml | Service principal for Azure CLI |
| AZURE_CLIENT_ID | terraform.yml | Terraform ARM auth |
| AZURE_CLIENT_SECRET | terraform.yml | Terraform ARM auth |
| AZURE_TENANT_ID | terraform.yml | Terraform ARM auth |
| AZURE_SUBSCRIPTION_ID | terraform.yml | Terraform ARM auth |
| TF_STATE_STORAGE_ACCOUNT | terraform.yml | Terraform remote state |

Secrets are scoped: staging env cannot access production secrets.
GitHub masks all secret values in logs automatically — they appear as ***.

## Layer 3 — Google Secret Manager

For team access and compliance, secrets live in GCP Secret Manager.
The pipeline retrieves them at runtime with:

    DB_PASSWORD=$(gcloud secrets versions access latest --secret="release-ready-db-password-$ENVIRONMENT")
    echo "::add-mask::$DB_PASSWORD"
    echo "DB_PASSWORD=$DB_PASSWORD" >> $GITHUB_ENV

The ::add-mask:: instruction ensures the value never appears in any log line.

## Access Control

| Role | Staging | Production |
|------|---------|-----------|
| Developer | Read-only | No access |
| CI/CD pipeline | Read secrets | Read secrets |
| Infra admin | Full CRUD | Full CRUD (MFA required) |

## Staging vs Production difference

Staging and production secrets live in SEPARATE GCP projects.
A compromised staging credential cannot access any production secrets.
Production enforces 30-day rotation; staging allows 90 days.
