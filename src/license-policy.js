'use strict';

function evaluateLicense(appContext={}) {
  const environmentType=String(appContext?.environmentType||'UNKNOWN').toUpperCase();
  if(environmentType!=='PRODUCTION') {
    return {active:true,enforced:false,environmentType,isEvaluation:false};
  }
  const license=appContext?.license||null;
  return {
    active:license?.active===true,
    enforced:true,
    environmentType,
    isEvaluation:license?.isEvaluation===true,
    trialEndDate:license?.trialEndDate||null,
    subscriptionEndDate:license?.subscriptionEndDate||null,
  };
}

module.exports={evaluateLicense};
