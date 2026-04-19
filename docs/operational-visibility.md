# Operational Visibility

## Health check — /api/healthz

Returns: status, version, environment, uptime (seconds), memory (MB), timestamp.
Used by: Docker HEALTHCHECK, Azure liveness probe, CD smoke tests.

## Structured logging

All logs are JSON to stdout via Pino. Sensitive fields are redacted before output:
- req.headers.authorization
- req.headers.cookie
- *.password, *.secret, *.token

Log levels by environment:
- development: debug (full verbosity)
- staging: debug (catch integration issues)
- production: warn (errors and warnings only — reduces cost)

## Key metrics to measure

| Metric | Alert threshold | Tool |
|--------|----------------|------|
| Error rate (5xx) | > 1% of requests | Azure Monitor |
| P99 latency | > 2 seconds | Azure Monitor |
| Container restarts | > 2/hour | Azure Container Apps |
| Health check failures | Any | Azure + CD smoke test |

## Azure Log Analytics — useful queries

Error rate:
    ContainerAppConsoleLogs_CL
    | where TimeGenerated > ago(1h)
    | where Log_s contains '"level":50'
    | project TimeGenerated, ContainerAppName_s, Log_s

## How signals support safe releases

1. Pre-merge: CI enforces zero failing tests
2. Post-staging: smoke test validates /api/healthz before production gate
3. Post-production: 5-minute observation window before declaring release stable
4. Rollback trigger: error rate > 1% within 10 min of deploy → use Option 1
