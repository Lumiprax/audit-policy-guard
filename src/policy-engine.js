'use strict';
const crypto=require('node:crypto');

const POLICY_RULES=Object.freeze([
  {id:'permission-access-change',label:'Permission or access-control change',severity:'HIGH',rx:/\b(permission|security level|role|group access|global permission)\b/i},
  {id:'user-admin-change',label:'User or group administration change',severity:'HIGH',rx:/\b(user (created|deleted|deactivated|activated)|added to group|removed from group|group management)\b/i},
  {id:'destructive-config-change',label:'Destructive configuration change',severity:'HIGH',rx:/\b(deleted|removed|disabled)\b/i},
  {id:'workflow-config-change',label:'Workflow or Jira configuration change',severity:'MEDIUM',rx:/\b(workflow|scheme|custom field|screen|notification|configuration)\b/i},
  {id:'integration-change',label:'Integration configuration change',severity:'MEDIUM',rx:/\b(webhook|integration|connected app|app configuration)\b/i},
]);

function clean(value,max=300) {
  return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
}
function searchable(record={}) {
  const changed=Array.isArray(record.changedValues)?record.changedValues:[];
  return [record.summary,record.category,record.eventSource,record.objectItem?.name,record.objectItem?.typeName,
    ...changed.flatMap(item=>[item.fieldName,item.changedFrom,item.changedTo])].map(value=>clean(value)).join(' ');
}
function classifyAuditRecord(record={}) {
  const text=searchable(record);
  const matched=POLICY_RULES.filter(rule=>rule.rx.test(text));
  if(!matched.length) return null;
  const high=matched.some(rule=>rule.severity==='HIGH');
  const primary=matched.find(rule=>rule.severity==='HIGH')||matched[0];
  return {policyIds:matched.map(rule=>rule.id),severity:high?'HIGH':'MEDIUM',label:primary.label};
}
function normalizeAuditRecord(record={},classification={}) {
  return {
    sourceRecordId:record.id??null,
    created:clean(record.created,80),
    summary:clean(classification.label||'Audit policy finding',160),
    policyIds:Array.isArray(classification.policyIds)?classification.policyIds.slice(0,8):[],
    severity:classification.severity==='HIGH'?'HIGH':'MEDIUM',
  };
}
function findingKey(record={}) {
  const when=Number.isFinite(Date.parse(record.created))?Date.parse(record.created):Date.now();
  const inverse=String(9999999999999-when).padStart(13,'0');
  const id=crypto.createHash('sha256').update(`${record.id??''}|${record.created??''}`).digest('hex').slice(0,18);
  return `apg:finding:${inverse}:${id}`;
}
function maxCreated(records=[],fallback=null) {
  let best=Number.isFinite(Date.parse(fallback))?Date.parse(fallback):0;
  for(const record of records) {
    const time=Date.parse(record?.created);
    if(Number.isFinite(time)&&time>best) best=time;
  }
  return best?new Date(best).toISOString():fallback;
}

module.exports={POLICY_RULES,clean,searchable,classifyAuditRecord,normalizeAuditRecord,findingKey,maxCreated};
