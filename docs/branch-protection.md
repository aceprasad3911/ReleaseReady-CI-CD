# Branch Protection Setup

## GitHub Settings → Branches → Add rule → main

| Setting | Value |
|---------|-------|
| Require pull request before merging | ✅ |
| Required approvals | 1 |
| Dismiss stale reviews on new push | ✅ |
| Require status checks to pass | ✅ |
| — Build, Type-check & Test | Required |
| — Lint Dockerfile | Required |
| — CodeQL Security Analysis | Required |
| Require branches to be up to date | ✅ |
| Restrict direct pushes | ✅ |

## GitHub Environments

staging:
- No required reviewers (auto-deploys)
- Deployment branches: main only
- Secrets: staging Azure credentials only

production:
- Required reviewers: 1 (team lead)
- Deployment branches: main only
- Secrets: production Azure credentials only

## Demonstration

This PR exists to evidence that the branch-protection ruleset fires on every change, even in a solo-developer project.
