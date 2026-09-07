# Audit Policy Guard Privacy Notice

Audit Policy Guard runs entirely on Atlassian Forge and does not send Jira audit data to external services.

## Data processed

The app reads Jira audit records transiently to classify security-relevant administrative and configuration events. Raw audit payloads are not retained after classification.

## Data retained

A matched finding retains only generic policy evidence: the source audit record ID, event timestamp, generic policy label, matched policy IDs, and severity. The app does not intentionally persist actor account IDs, names, email addresses, IP addresses, object names, free-text descriptions, or before/after field values.

## Purpose

Retained findings are used only to provide authorized Jira administrators with a longer-lived policy-monitoring view.

## Storage and retention

Findings are stored in Atlassian-hosted Forge Key-Value Store for up to 365 days. Scan-status metadata is retained for up to 30 days. No external database or remote backend is used.

## Access and deletion

Only Jira administrators can access the app. An administrator can delete stored findings from within the app even when the commercial license is inactive. Forge also applies its own hosted-storage lifecycle after uninstall.

## Data minimization

Audit records that do not match a policy are never stored. Raw content used for classification exists only for the duration of the Forge invocation.

A legal/privacy review, including whether a separate customer DPA is required for transient processing, must be completed before Marketplace submission.
