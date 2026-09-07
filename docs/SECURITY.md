# Audit Policy Guard Security Overview

## Architecture

Audit Policy Guard is a Forge-native Jira app. Compute and persisted app data remain on Atlassian Forge. The manifest declares no external egress.

## Authorization

The admin page is visible only when Jira global permission `ADMINISTER` is present. Backend resolver operations independently verify the current user with Jira's `mypermissions` endpoint before returning findings or starting a manual scan.

Scheduled scans run `asApp()` because no user session exists. They perform read-only Jira audit API calls and write only app-owned Forge KVS records.

## Scopes

- `read:audit-log:jira` — read Jira audit events.
- `read:user:jira` — support audit actor/user context where exposed.
- `read:permission:jira` — verify Jira administrator authorization.
- `storage:app` — retain findings and scan state in Forge KVS.

The app requests no Jira write, delete, manage, or external network permissions.

## Data protection

Matched findings use Forge KVS TTLs; remote addresses are not retained. Application logs contain only scan status/counts and error codes, never audit payloads or user content.
