'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=path.resolve(__dirname,'..');
function run(args=[]) {
  const result=spawnSync(process.execPath,['scripts/release-readiness.js',...args],{cwd:root,encoding:'utf8'});
  return {...result,report:JSON.parse(result.stdout)};
}

test('technical release gate passes only after validated development staging and production deployment',()=>{
  const result=run();
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.report.technicalReady,true);
  assert.deepEqual(result.report.technicalBlockers,[]);
});

test('Marketplace gate remains blocked by explicit account and publishing prerequisites',()=>{
  const result=run(['--marketplace']);
  assert.equal(result.status,3);
  assert.equal(result.report.marketplaceReady,false);
  assert.ok(result.report.accountBlockers.includes('PARTNER_AGREEMENT_REQUIRED'));
  assert.ok(result.report.accountBlockers.includes('BUSINESS_DOMAIN_EMAIL_REQUIRED'));
  assert.ok(result.report.accountBlockers.includes('LISTING_ASSETS_REQUIRED'));
});
