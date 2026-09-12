# Audit Policy Guard — Marketplace Listing

## Discovery metadata

**Name:** Audit Policy Guard

**Primary category:** Security and compliance

**Tagline:** Monitor security-relevant Jira admin changes every five minutes with focused policy findings and Forge-hosted evidence.

**Summary:** Audit Policy Guard scans Jira audit records every five minutes, classifies security-relevant administration and configuration changes, and retains generic policy findings in Forge storage without external egress or Jira write access.

**Keywords:** audit monitoring, compliance, admin changes, permissions, configuration, Jira security

## Customer problem

Jira administrators can miss sensitive permission, access, workflow, integration, or configuration changes when audit review depends on periodic manual inspection or incident investigation.

## Customer outcome

Audit Policy Guard continuously evaluates Jira audit records and turns matching administrative changes into a focused policy-evidence queue for authorized Jira administrators.

## Core capabilities

- Five-minute scheduled monitoring plus an admin-triggered scan.
- Deterministic HIGH/MEDIUM policy classification.
- Admin-only dashboard with scan health and recent findings.
- Generic policy metadata retained in Forge KVS for up to 365 days.
- No external egress, external AI, third-party account, or Jira write scopes.
- Runs on Atlassian eligible Forge architecture.

## Marketplace highlights

### 1. Catch high-risk admin changes
**Summary:** Surface policy-relevant permission, user-administration, destructive configuration, workflow, and integration changes without repeatedly reading the full Jira audit log.

**Caption:** Audit Policy Guard shows recent HIGH and MEDIUM policy findings alongside scan health so Jira administrators can review relevant changes first.

### 2. Keep focused policy evidence
**Summary:** Retain generic policy metadata in Atlassian-hosted Forge storage for up to 365 days while raw audit payloads, actor identifiers, IP addresses, object names, and before/after values are not persisted.

**Caption:** The findings view keeps policy type, severity, source record ID, and event time while deliberately minimizing retained audit data.

### 3. Stay inside Atlassian Forge
**Summary:** Run monitoring, authorization, licensing, scheduled execution, and storage on Forge with no external service, analytics endpoint, advertising SDK, or external AI provider.

**Caption:** Policy coverage and limitations clearly explain what the app monitors and that customer audit data is not sent outside Atlassian Forge.

## Publisher and support

**Publisher:** Lumiprax Technologies  
**Website:** https://lumiprax.com  
**Support:** support@lumiprax.com  
**Support URL:** https://lumiprax.com/support  
**Privacy:** https://lumiprax.com/privacy  
**Security contact:** security@lumiprax.com  
**Documentation:** https://lumiprax.com/support/audit-policy-guard

## Pricing and evaluation

Payment model: Paid via Atlassian. Billing model: Standard all-user billing. Launch edition: Standard only. Evidence-backed reference price: USD $0.75/user/month around the 100-user tier. Marketplace evaluations are managed by Atlassian and run for at least 30 days.

## Scope explanations

- `read:audit-log:jira`: read Jira audit records for policy evaluation.
- `read:user:jira`: required by Atlassian as part of the granular audit-record endpoint scope set; actor/user fields are processed transiently and not persisted.
- `read:permission:jira`: verify Jira administrator permission before returning findings, starting a manual scan, or deleting stored findings.
- `storage:app`: retain generic findings, scan state, migration state, and short-lived scan status in Forge KVS.

## External services

None. No remote hosts, external databases, analytics services, advertising SDKs, or external AI services are used.

## Customer account requirements

No separate third-party account is required.

## Limitations

Coverage is limited to events exposed by Jira's audit records API. Audit Policy Guard cannot reconstruct events Jira does not record or expose. Production functionality requires an active Marketplace license; data deletion remains available to an authorized administrator even after licensing becomes inactive.


## Release details

**Release summary:** Initial release of Audit Policy Guard for Jira Cloud.

**Documentation URL:** https://lumiprax.com/support/audit-policy-guard

**Support status:** Supported by Lumiprax Technologies.
