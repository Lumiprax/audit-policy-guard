'use strict';
const ResolverModule=require('@forge/resolver');
const Resolver=ResolverModule.default||ResolverModule;
const {assertJiraAdmin,runAuditScan,getDashboard}=require('./audit-service');

const resolver=new Resolver();

resolver.define('getDashboard',async({context})=>{
  await assertJiraAdmin(context?.accountId);
  return getDashboard();
});

resolver.define('runScan',async({context})=>{
  await assertJiraAdmin(context?.accountId);
  try { return await runAuditScan({initiatedBy:'ADMIN'}); }
  catch(error) { return {status:'FAIL',errorCode:error.code||'AUDIT_SCAN_FAILED'}; }
});

exports.handler=resolver.getDefinitions();
exports.auditMonitor=async()=>{
  try {
    const result=await runAuditScan({initiatedBy:'SCHEDULED'});
    console.info('APG_AUDIT_MONITOR',JSON.stringify({status:result.status,processed:result.processed,findings:result.findings,pages:result.pages,partial:result.status==='PARTIAL'}));
    return result;
  } catch(error) {
    console.error('APG_AUDIT_MONITOR_FAIL',JSON.stringify({errorCode:error.code||'AUDIT_SCAN_FAILED'}));
    throw error;
  }
};
