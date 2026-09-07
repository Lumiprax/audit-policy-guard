'use strict';
const crypto=require('node:crypto');

const POLICY_RULES=Object.freeze([
  {id:'permission-access-change',label:'Permission and access changes',description:'Permission, role, security level, group access, and global permission changes.',severity:'HIGH',rx:/\b(permission|security level|role|group access|global permission)\b/i},
  {id:'user-admin-change',label:'User administration changes',description:'User lifecycle and group-membership administration events.',severity:'HIGH',rx:/\b(user (created|deleted|deactivated|activated)|added to group|removed from group|group management)\b/i},
  {id:'destructive-config-change',label:'Destructive configuration changes',description:'Deletion, removal, and disablement events affecting Jira configuration.',severity:'HIGH',rx:/\b(deleted|removed|disabled)\b/i},
  {id:'workflow-config-change',label:'Workflow and configuration changes',description:'Workflow, scheme, field, screen, notification, and configuration changes.',severity:'MEDIUM',rx:/\b(workflow|scheme|custom field|screen|notification|configuration)\b/i},
  {id:'integration-change',label:'Integration changes',description:'Webhook, connected-app, integration, and app-configuration events.',severity:'MEDIUM',rx:/\b(webhook|integration|connected app|app configuration)\b/i},
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
  return {policyIds:matched.map(rule=>rule.id),severity:matched.some(rule=>rule.severity==='HIGH')?'HIGH':'MEDIUM'};
}
function normalizedChanges(values=[]) {
  return (Array.isArray(values)?values:[]).slice(0,8).map(item=>({
    fieldName:clean(item?.fieldName,120),
    changedFrom:clean(item?.changedFrom,300),
    changedTo:clean(item?.changedTo,300),
  }));
}
function normalizeAuditRecord(record={},classification={}) {
  return {
    sourceRecordId:record.id??null,
    created:clean(record.created,80),
    summary:clean(record.summary,300),
    category:clean(record.category,160),
    eventSource:clean(record.eventSource,160),
    authorAccountId:clean(record.authorAccountId,160),
    objectItem:record.objectItem?{
      id:clean(record.objectItem.id,160),name:clean(record.objectItem.name,240),
      typeName:clean(record.objectItem.typeName,120),parentName:clean(record.objectItem.parentName,240),
    }:null,
    changedValues:normalizedChanges(record.changedValues),
    policyIds:Array.isArray(classification.policyIds)?classification.policyIds:[],
    severity:classification.severity||'MEDIUM',
  };
}
function findingKey(record={}) {
  const when=Number.isFinite(Date.parse(record.created))?Date.parse(record.created):Date.now();
  const inverse=String(9999999999999-when).padStart(13,'0');
  const id=crypto.createHash('sha256').update(`${record.id??''}|${record.created??''}|${record.summary??''}`).digest('hex').slice(0,18);
  return `apg:finding:${inverse}:${id}`;
}
function maxCreated(records=[],fallback=null) {
  let best=Number.isFinite(Date.parse(fallback))?Date.parse(fallback):0;
  for(const record of records) { const time=Date.parse(record?.created); if(Number.isFinite(time)&&time>best) best=time; }
  return best?new Date(best).toISOString():fallback;
}

module.exports={POLICY_RULES,clean,searchable,classifyAuditRecord,normalizeAuditRecord,findingKey,maxCreated};
