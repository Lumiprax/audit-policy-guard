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

test('stored findings deliberately omit remote address and description',()=>{
  const finding=normalizeAuditRecord({id:4,created:'2026-09-01T00:00:00Z',summary:'Workflow deleted',remoteAddress:'192.0.2.1',description:'secret detail'},
    {severity:'HIGH',policyIds:['destructive-config-change']});
  assert.equal(Object.hasOwn(finding,'remoteAddress'),false);
  assert.equal(Object.hasOwn(finding,'description'),false);
  assert.equal(finding.severity,'HIGH');
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

test('changed values are bounded before retention',()=>{
  const record={changedValues:Array.from({length:20},(_,i)=>({fieldName:`field-${i}`,changedFrom:'x'.repeat(500),changedTo:'y'.repeat(500)}))};
  const finding=normalizeAuditRecord(record,{severity:'MEDIUM',policyIds:['workflow-config-change']});
  assert.equal(finding.changedValues.length,8);
  assert.equal(finding.changedValues[0].changedFrom.length,300);
});
