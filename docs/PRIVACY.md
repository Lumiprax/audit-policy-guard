# Audit Policy Guard Privacy Notice

Audit Policy Guard runs on Atlassian Forge and does not send Jira audit data to external services.

## Data processed

The app reads Jira audit records needed to identify security-relevant administrative and configuration changes. A matched finding may retain the audit record identifier, timestamp, summary, category, event source, actor account ID, affected object metadata, bounded changed-value evidence, matched policy IDs, and severity.

## Purpose

This data is used only to detect, display, and retain policy findings for authorized Jira administrators.

## Storage and retention

Matched findings are stored in Atlassian-hosted Forge Key-Value Store for up to 365 days. Scan status metadata is retained for up to 30 days. The app does not maintain an external database.

## Data minimization

The app does not retain remote IP/address fields and does not store audit records that do not match a policy rule.

## Access and deletion

Data is isolated by Atlassian installation. Uninstalling the app stops further collection. Any Marketplace privacy/reporting and deletion obligations will be handled according to Atlassian Forge privacy requirements and applicable law.
