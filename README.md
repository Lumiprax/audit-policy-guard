# Audit Policy Guard

A Forge-native Jira security/compliance app admitted by the isolated SAGE Atlassian opportunity engine at 90/100.

## Current technical state

- Developer Space: `SAGE Money Factory`
- Forge app ID: `ari:cloud:ecosystem::app/2d86526b-807d-40bd-b424-b758b88c1a36`
- Development sites: `sage-atlassian-dev.atlassian.net` and fresh demo site `one-atlas-ugga.atlassian.net`
- Development Forge version: `2.5.0`
- Production Forge version: `2.1.0` (deployed, intentionally not installed)
- Forge lint: PASS
- Product tests: 16/16 PASS
- Atlassian Factory tests: 31/31 PASS
- Full Factory regression: 808/808 PASS
- Runs on Atlassian eligibility: confirmed in development, staging, and production
- Privacy schema v2 migration: PASS; 17 legacy richer staging findings purged

## Product boundary

The app reads Jira audit records, evaluates deterministic policy rules, and stores only generic matched-policy metadata in Forge KVS with a maximum 365-day TTL. Raw audit payloads and user identifiers are not persisted. It has no external egress and no Jira write scopes.

Marketplace submission remains blocked only by Partner/account, public policy URL, final pricing, and listing-asset prerequisites tracked by `npm run release:check:marketplace`.
