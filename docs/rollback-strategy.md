# Rollback Strategy

## Option 1 — Redeploy Previous Container Image (FASTEST: 1-3 min)

Every deployment uses an immutable sha- tag. To roll back:

    gh workflow run cd.yml -f action=rollback -f image_tag=ghcr.io/OWNER/release-ready:sha-abc1234

Or via GitHub UI: Actions → CD → Run workflow → enter previous image tag.

WHY FASTEST: No rebuild required. Azure Container Apps swaps the revision in place.
The smoke test confirms health before the job completes.

## Option 2 — Git Revert (5-8 min)

    git revert <broken-commit-sha>
    git push origin fix/revert-broken-change
    # Open PR → CI must pass → merge → CD deploys automatically

Use when the break is isolated to one commit and you want it in the audit trail.

## Option 3 — Feature Flag Off (< 1 min)

    az containerapp update --name release-ready-prod \
      --resource-group release-ready-rg \
      --set-env-vars FEATURE_NEW_UI=false

Triggers a revision update with zero downtime. Use for risky UI changes.

## Decision table

| Scenario | Option | ETA |
|----------|--------|-----|
| Production is down now | 1 (image tag) | 1-3 min |
| Bug isolated to one commit | 2 (revert) | 5-8 min |
| New feature broke UX | 3 (flag off) | < 1 min |
| Multiple interdependent commits broken | 1 (image tag) | 1-3 min |
