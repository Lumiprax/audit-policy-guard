'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

function read(file){return fs.readFileSync(path.join(root,file),'utf8');}

test('manifest is read-only, admin-gated and Atlassian-hosted',()=>{
  const manifest=read('manifest.template.yml');
  for(const scope of ['read:audit-log:jira','read:user:jira','read:permission:jira','storage:app']) assert.match(manifest,new RegExp(scope.replace(':','\\:')));
  assert.match(manifest,/hasGlobalPermission: ADMINISTER/);
  assert.match(manifest,/interval: fiveMinute/);
  assert.match(manifest,/appIsLicensed: true/);
  assert.doesNotMatch(manifest,/write:|delete:|manage:|external:/);
});

test('audit service stores findings for at most one year and never persists remote addresses',()=>{
  const source=read('src/audit-service.js');
  const policy=read('src/policy-engine.js');
  assert.match(source,/FINDING_RETENTION_DAYS=365/);
  assert.match(source,/api\.asApp\(\)\.requestJira/);
  assert.match(source,/api\.asUser\(\)\.requestJira/);
  assert.doesNotMatch(source,/api\.asUser\(accountId\)/);
  assert.doesNotMatch(policy,/authorAccountId\s*:/);
  assert.doesNotMatch(policy,/remoteAddress\s*:/);
  assert.doesNotMatch(policy,/changedFrom\s*:/);
  assert.doesNotMatch(policy,/changedTo\s*:/);
  assert.match(source,/DATA_SCHEMA_VERSION=2/);
  assert.match(source,/clearStoredData/);
});
