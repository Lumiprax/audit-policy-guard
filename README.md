# Audit Policy Guard

A Forge-native Jira security/compliance app admitted by the isolated SAGE Atlassian opportunity engine at 90/100.

## Development state

- Developer Space: `SAGE Money Factory`
- Forge app ID: `ari:cloud:ecosystem::app/2d86526b-807d-40bd-b424-b758b88c1a36`
- Development site: `sage-atlassian-dev.atlassian.net`
- Environment: `development` (Forge app version 2.2.0)
- Forge lint: PASS
- Product tests: 9/9 PASS
- Full Factory regression: 808/808 PASS
- Runs on Atlassian eligibility: confirmed by Forge deployment

## Product boundary

The app reads Jira audit records, evaluates deterministic policy rules, and stores only matched findings in Forge KVS with a maximum 365-day TTL. It has no external egress and no Jira write scopes.

Marketplace pricing publication, production deployment, Marketplace listing, and submission remain separate governed release stages.
