# Marketplace Privacy & Security Submission Evidence

This file maps Audit Policy Guard's implemented behavior to information commonly requested in the Atlassian Marketplace Privacy & Security tab. It is evidence for form completion, not a legal attestation.

## Data residency and subprocessors

Audit Policy Guard is Forge-native. App compute and persisted app data remain on Atlassian Forge. The app declares no external egress and uses no external database, analytics provider, advertising SDK, or external AI provider.

## Data processed

The app reads Jira audit records to identify security-relevant administrative and configuration events. Processing is transient. The full audit record is not retained after classification.

## Data stored

Only generic policy evidence is retained for matching records: source audit record ID, event timestamp, generic policy label, matched policy IDs, and severity. Raw audit payloads and direct actor/user details are not intentionally retained.

## Retention

- Policy findings: up to 365 days.
- Scan-status metadata: up to 30 days.
- Storage: Atlassian Forge KVS with application-managed TTLs.

## Customer access and deletion

Only Jira administrators can access the app. Backend resolvers re-check Jira administrator permission. Authorized administrators can delete stored findings from within the app even when the Marketplace license is inactive.

## Security controls implemented in the app

- Least-privilege read-only Jira scopes.
- No external network egress.
- No Jira mutation scopes.
- Backend permission verification independent of UI display conditions.
- Data minimization before persistence.
- No intentional logging of audit payloads or user content.

## Public resources

- Privacy policy: https://lumiprax.com/privacy
- Support: https://lumiprax.com/support
- Security contact: security@lumiprax.com
- Privacy contact: privacy@lumiprax.com

## Items requiring owner/legal confirmation

The repository does not determine the legal contracting entity, DPA requirements, corporate data-protection roles, insurance, certifications, or other organization-level attestations. Those fields must be completed by the Marketplace owner using real business information and, where appropriate, legal advice.
