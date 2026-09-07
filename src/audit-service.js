'use strict';
const api=require('@forge/api');
const {route}=api;
const {kvs,WhereConditions}=require('@forge/kvs');
const {POLICY_RULES,classifyAuditRecord,normalizeAuditRecord,findingKey,maxCreated}=require('./policy-engine');

const STATE_KEY='apg:scan-state';
const STATUS_KEY='apg:scan-status';
const DATA_SCHEMA_KEY='apg:data-schema';
const DATA_SCHEMA_VERSION=2;
const FINDING_PREFIX='apg:finding:';
const FINDING_RETENTION_DAYS=365;
const STATUS_RETENTION_DAYS=30;
const PAGE_SIZE=1000;
const MAX_PAGES_PER_INVOCATION=5;
const INITIAL_LOOKBACK_MINUTES=30;

function initialWindow() {
  return new Date(Date.now()-INITIAL_LOOKBACK_MINUTES*60*1000).toISOString();
}
function nextInstant(value) {
  const time=Date.parse(value);
  return Number.isFinite(time)?new Date(time+1).toISOString():new Date().toISOString();
}
function safeErrorCode(error) {
  const message=String(error?.message||'');
  return message.match(/AUDIT_(?:API|ADMIN_CHECK)_\d{3}/)?.[0]||'AUDIT_SCAN_FAILED';
}
async function saveStatus(status) {
  await kvs.set(STATUS_KEY,{...status,updatedAt:new Date().toISOString()},{ttl:{unit:'DAYS',value:STATUS_RETENTION_DAYS}});
}
async function assertJiraAdmin(accountId) {
  if(!accountId) throw new Error('AUDIT_ADMIN_CONTEXT_REQUIRED');
  const response=await api.asUser().requestJira(route`/rest/api/3/mypermissions?permissions=ADMINISTER`,{
    headers:{Accept:'application/json'},
  });
  if(!response.ok) throw new Error(`AUDIT_ADMIN_CHECK_${response.status}`);
  const body=await response.json();
  if(body?.permissions?.ADMINISTER?.havePermission!==true) throw new Error('AUDIT_ADMIN_REQUIRED');
  return true;
}

async function fetchAuditPage(from,offset) {
  const response=await api.asApp().requestJira(
    route`/rest/api/3/auditing/record?offset=${offset}&limit=${PAGE_SIZE}&from=${from}`,
    {headers:{Accept:'application/json'}},
  );
  if(!response.ok) throw new Error(`AUDIT_API_${response.status}`);
  const body=await response.json();
  return {
    records:Array.isArray(body?.records)?body.records:[],
    total:Number.isFinite(Number(body?.total))?Number(body.total):null,
    limit:Number.isFinite(Number(body?.limit))&&Number(body.limit)>0?Number(body.limit):PAGE_SIZE,
    offset:Number.isFinite(Number(body?.offset))?Number(body.offset):offset,
  };
}


function pageHasMore(page,nextOffset) {
  if(!Array.isArray(page?.records)||page.records.length===0) return false;
  const limit=Number.isFinite(Number(page?.limit))&&Number(page.limit)>0?Number(page.limit):PAGE_SIZE;
  if(page.records.length<limit) return false;
  return Number.isFinite(Number(page?.total))?nextOffset<Number(page.total):true;
}

async function purgeFindings(maxPages=50) {
  let deleted=0;
  for(let page=0;page<maxPages;page+=1) {
    const result=await kvs.query().where('key',WhereConditions.beginsWith(FINDING_PREFIX)).limit(100).getMany();
    const rows=Array.isArray(result?.results)?result.results:[];
    for(const item of rows) { if(item?.key) { await kvs.delete(item.key); deleted+=1; } }
    if(rows.length<100) break;
  }
  return deleted;
}
async function ensureDataSchema() {
  const current=Number(await kvs.get(DATA_SCHEMA_KEY)||0);
  if(current>=DATA_SCHEMA_VERSION) return {migrated:false,deleted:0};
  const deleted=await purgeFindings();
  await kvs.set(DATA_SCHEMA_KEY,DATA_SCHEMA_VERSION);
  return {migrated:true,deleted};
}
async function clearStoredData() {
  const deleted=await purgeFindings();
  await kvs.delete(STATE_KEY);
  await kvs.delete(STATUS_KEY);
  await kvs.set(DATA_SCHEMA_KEY,DATA_SCHEMA_VERSION);
  return {status:'PASS',deleted};
}

async function saveFinding(record,classification) {
  const finding=normalizeAuditRecord(record,classification);
  await kvs.set(findingKey(record),finding,{ttl:{unit:'DAYS',value:FINDING_RETENTION_DAYS}});
  return finding;
}
async function runAuditScan({initiatedBy='SCHEDULED'}={}) {
  const startedAt=new Date().toISOString();
  const migration=await ensureDataSchema();
  const previous=await kvs.get(STATE_KEY)||{};
  const windowStart=previous.windowStart||previous.lastSeen||initialWindow();
  let offset=Number.isFinite(Number(previous.pendingOffset))?Number(previous.pendingOffset):0;
  let newest=previous.maxCreated||previous.lastSeen||windowStart;
  let processed=0,findings=0,total=null,pages=0,hasMore=false;
  try {
    while(pages<MAX_PAGES_PER_INVOCATION) {
      const page=await fetchAuditPage(windowStart,offset);
      total=page.total;
      for(const record of page.records) {
        processed+=1;
        newest=maxCreated([record],newest);
        const classification=classifyAuditRecord(record);
        if(classification) { await saveFinding(record,classification); findings+=1; }
      }
      offset+=page.records.length;
      pages+=1;
      hasMore=pageHasMore(page,offset);
      if(!hasMore) break;
    }
    const partial=hasMore&&pages>=MAX_PAGES_PER_INVOCATION;
    const nextState=partial
      ?{windowStart,pendingOffset:offset,maxCreated:newest,lastSeen:previous.lastSeen||null}
      :{lastSeen:nextInstant(total?newest:startedAt),pendingOffset:0,windowStart:null,maxCreated:null};
    await kvs.set(STATE_KEY,nextState);
    const result={status:partial?'PARTIAL':'PASS',initiatedBy,processed,findings,total,pages,windowStart,nextOffset:partial?offset:0,purgedLegacyFindings:migration.deleted,completedAt:new Date().toISOString()};
    await saveStatus(result);
    return result;
  } catch(error) {
    const result={status:'FAIL',initiatedBy,errorCode:safeErrorCode(error),processed,findings,total,pages,windowStart,failedAt:new Date().toISOString()};
    await saveStatus(result);
    throw Object.assign(new Error(result.errorCode),{code:result.errorCode});
  }
}

async function getDashboard() {
  const [status,query]=await Promise.all([
    kvs.get(STATUS_KEY),
    kvs.query().where('key',WhereConditions.beginsWith(FINDING_PREFIX)).limit(20).getMany(),
  ]);
  const findings=(query?.results||[]).map(item=>item.value).filter(Boolean);
  return {
    status:status||{status:'NOT_SCANNED'},
    findings,
    retentionDays:FINDING_RETENTION_DAYS,
    policies:POLICY_RULES.map(({id,label,description,severity})=>({id,label,description,severity})),
    limitations:['Only events exposed by the Jira audit records API can be evaluated.','Stored findings contain generic policy metadata only; raw audit payloads and user identifiers are not retained.','Findings are retained in Atlassian-hosted Forge storage for up to 365 days.','No audit data is sent to an external service.'],
  };
}

module.exports={STATE_KEY,STATUS_KEY,DATA_SCHEMA_KEY,DATA_SCHEMA_VERSION,FINDING_PREFIX,FINDING_RETENTION_DAYS,PAGE_SIZE,MAX_PAGES_PER_INVOCATION,pageHasMore,assertJiraAdmin,fetchAuditPage,purgeFindings,ensureDataSchema,clearStoredData,runAuditScan,getDashboard};
