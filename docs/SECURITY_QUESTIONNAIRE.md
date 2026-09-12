# Marketplace Security Questionnaire Evidence

This document is a factual answer bank for the Atlassian Marketplace security questionnaire. Final answers must be copied into the current Marketplace form and confirmed against the form wording at submission time.

## Architecture and hosting

- Hosting model: Atlassian Forge only.
- External backend: None.
- External database: None.
- External network egress: None declared in the Forge manifest.
- Third-party analytics, advertising SDKs, or external AI services: None.
- Runtime: Forge Node.js 24, ARM64, 256 MB.

## Authorization and access

- UI exposure is restricted to users with Jira global `ADMINISTER` permission.
- Backend resolver operations independently check Jira administration permission through Jira's permissions API.
- Scheduled scans run as the app and have no user session.
- No separate customer account or third-party credential is required.

## Jira permissions

Declared scopes are limited to:

- `read:audit-log:jira`
- `read:user:jira`
- `read:permission:jira`
- `storage:app`

The app declares no Jira write, delete, or manage scopes.

## Data handling

- Jira audit records are processed transiently for deterministic policy classification.
- Raw audit payloads are not persisted.
- Actor names, account IDs, email addresses, IP addresses, object names, free-text descriptions, and before/after values are not intentionally persisted.
- Stored findings contain generic policy metadata only: source audit record ID, event timestamp, policy label, matched policy IDs, and severity.
- Findings are retained for up to 365 days using Forge KVS TTLs.
- Scan-status metadata is retained for up to 30 days.
- An authorized Jira administrator can delete stored findings from the app, including when the commercial license is inactive.

## Logging and secrets

- Runtime telemetry is limited to scan status, counts, timestamps, and error codes.
- Audit payloads and user content are not intentionally written to application logs.
- No app-owned external API credentials are required for normal operation.

## Security verification evidence

- Recorded npm audit result: 0 vulnerabilities.
- Recorded Forge lint result: PASS with 0 issues.
- Security audit status: PASS.
- External egress detected: false.
- Jira mutation scopes detected: false.
- Credential leakage detected: false.

## Owner-confirmation items

The Marketplace owner must answer any questionnaire items about organizational controls that are not properties of the source code, including employee access processes, corporate incident response, insurance, certifications, penetration-testing programs, and legal/compliance attestations. Do not infer or mark those answers complete from this repository.
