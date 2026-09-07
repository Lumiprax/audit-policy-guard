'use strict';
const ResolverModule=require('@forge/resolver');
const Resolver=ResolverModule.default||ResolverModule;
const api=require('@forge/api');
const {assertJiraAdmin,runAuditScan,getDashboard,clearStoredData}=require('./audit-service');
const {evaluateLicense}=require('./license-policy');

const resolver=new Resolver();
function currentLicense(){ return evaluateLicense(api.getAppContext()); }

resolver.define('getDashboard',async({context})=>{
  await assertJiraAdmin(context?.accountId);
  const license=currentLicense();
  if(!license.active) {
    return {licensed:false,license,status:{status:'LICENSE_REQUIRED'},findings:[],limitations:['An active Audit Policy Guard Marketplace license is required.']};
  }
  return {...await getDashboard(),licensed:true,license};
});

resolver.define('runScan',async({context})=>{
  await assertJiraAdmin(context?.accountId);
  if(!currentLicense().active) return {status:'LICENSE_REQUIRED'};
  try { return await runAuditScan({initiatedBy:'ADMIN'}); }
  catch(error) { return {status:'FAIL',errorCode:error.code||'AUDIT_SCAN_FAILED'}; }
});

resolver.define('clearData',async({context})=>{
  await assertJiraAdmin(context?.accountId);
  return clearStoredData();
});

exports.handler=resolver.getDefinitions();
exports.auditMonitor=async()=>{
  const license=currentLicense();
  if(!license.active) {
    console.info('APG_AUDIT_MONITOR_SKIP',JSON.stringify({status:'LICENSE_REQUIRED'}));
    return {status:'LICENSE_REQUIRED'};
  }
  try {
    const result=await runAuditScan({initiatedBy:'SCHEDULED'});
    console.info('APG_AUDIT_MONITOR',JSON.stringify({status:result.status,processed:result.processed,findings:result.findings,pages:result.pages,partial:result.status==='PARTIAL',purgedLegacyFindings:result.purgedLegacyFindings||0}));
    return result;
  } catch(error) {
    console.error('APG_AUDIT_MONITOR_FAIL',JSON.stringify({errorCode:error.code||'AUDIT_SCAN_FAILED'}));
    throw error;
  }
};
