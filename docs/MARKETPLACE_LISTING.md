# Marketplace Listing Draft

## Name
Audit Policy Guard

## Tagline
Continuous Jira audit monitoring with policy-focused security findings.

## Problem
Jira administrators often discover sensitive permission, access, workflow, integration, or configuration changes only when manually reviewing audit logs or investigating an incident.

## Value
Audit Policy Guard continuously evaluates Jira audit records, highlights policy-relevant changes, and keeps a focused evidence queue for administrators without sending audit data to an external service.

## Key features
- Five-minute scheduled monitoring of Jira audit records.
- Deterministic HIGH/MEDIUM policy classification.
- Admin-only dashboard and manual scan.
- Up to 365-day Forge-hosted finding retention.
- No external egress and no Jira write scopes.
- Runs on Atlassian eligible Forge architecture.

## Primary use cases
Security reviews, admin change oversight, permission-change monitoring, audit evidence retention, and operational compliance review.

## Pricing position

Payment model: Paid via Atlassian. Initial research-backed target is approximately USD $0.75/user/month around the 100-user tier, with lower effective per-user pricing at larger tiers. Final tier amounts must be entered and validated in the Marketplace Partner Console.

## Scope explanations

- `read:audit-log:jira`: required to read Jira audit records for policy evaluation.
- `read:user:jira`: required by Atlassian as part of the granular scope set for the audit-record endpoint; Audit Policy Guard does not persist actor/user fields.
- `read:permission:jira`: required to verify that the current user has Jira administration permission before returning findings or starting a manual scan.
- `storage:app`: required to retain app-owned findings and scan state in Atlassian Forge KVS.

## External services

None. No remote hosts, external databases, analytics services, advertising SDKs, or external AI services are used by the app.

## Customer account requirements

No separate third-party account is required.

## Limitations

Coverage is limited to events exposed by Jira's audit records API. Audit Policy Guard cannot reconstruct events Jira does not record or expose through that API.
