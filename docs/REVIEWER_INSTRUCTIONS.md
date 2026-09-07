# Atlassian Reviewer Instructions

## Install target

Jira Cloud. No external service or third-party account is required.

## Access

Install the app as a Jira administrator. Open Jira settings, then Apps, then Audit Policy Guard. The module is hidden from users without Jira `ADMINISTER` permission and backend resolvers independently re-check that permission.

## Functional test

1. Open Audit Policy Guard and confirm the dashboard loads.
2. Select **Run scan now**.
3. Confirm scan status becomes `PASS` or `PARTIAL` without a permission error.
4. Make a test administrative/configuration change that Jira records in its audit log, then run another scan or allow the five-minute scheduled monitor to run.
5. Confirm any matching policy event appears in Recent findings with severity and policy IDs.

## Security checks

The app has no Jira write scopes and no external egress. Findings are stored only in Forge KVS. Remote-address fields are intentionally not retained.

## Known limitation

The app can evaluate only records Jira exposes through its audit records API; it cannot report events absent from Jira's audit log.
