'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyAuditRecord,normalizeAuditRecord,findingKey,maxCreated}=require('../src/policy-engine');

test('permission changes are high severity findings',()=>{
  const result=classifyAuditRecord({summary:'Permission added to scheme',category:'permission changes'});
  assert.equal(result.severity,'HIGH');
  assert.ok(result.policyIds.includes('permission-access-change'));
});

test('ordinary non-policy records are ignored',()=>{
  assert.equal(classifyAuditRecord({summary:'Sprint started',category:'sprint changes'}),null);
});

test('stored findings retain generic policy metadata only',()=>{
  const finding=normalizeAuditRecord({
    id:4,created:'2026-09-01T00:00:00Z',summary:'Workflow deleted by Jane',authorAccountId:'user-123',
    remoteAddress:'192.0.2.1',objectItem:{id:'user-123',name:'Jane Doe'},
    changedValues:[{fieldName:'Owner',changedFrom:'Jane',changedTo:'John'}],description:'secret detail'
  },{severity:'HIGH',policyIds:['destructive-config-change'],label:'Destructive configuration change'});
  assert.deepEqual(Object.keys(finding).sort(),['created','policyIds','severity','sourceRecordId','summary'].sort());
  assert.equal(finding.summary,'Destructive configuration change');
  assert.equal(JSON.stringify(finding).includes('Jane'),false);
  assert.equal(JSON.stringify(finding).includes('user-123'),false);
});
test('finding keys are deterministic and newest timestamp calculation is stable',()=>{
  const record={id:7,created:'2026-09-02T10:00:00Z',summary:'Group access changed'};
  assert.equal(findingKey(record),findingKey(record));
  assert.equal(maxCreated([
    {created:'2026-09-01T00:00:00Z'},
    {created:'2026-09-03T00:00:00Z'},
    {created:'bad'},
  ],'2026-08-01T00:00:00Z'),'2026-09-03T00:00:00.000Z');
});

test('finding key does not hash raw summary or changed values',()=>{
  const a={id:9,created:'2026-09-01T00:00:00Z',summary:'Jane changed secret',changedValues:[{changedTo:'secret'}]};
  const b={id:9,created:'2026-09-01T00:00:00Z',summary:'Different personal content',changedValues:[{changedTo:'other'}]};
  assert.equal(findingKey(a),findingKey(b));
});
