'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluateLicense}=require('../src/license-policy');

test('development and staging remain usable for controlled validation',()=>{
  assert.equal(evaluateLicense({environmentType:'DEVELOPMENT'}).active,true);
  assert.equal(evaluateLicense({environmentType:'STAGING'}).active,true);
  assert.equal(evaluateLicense({environmentType:'STAGING'}).enforced,false);
});

test('production requires an active Atlassian Marketplace license',()=>{
  assert.equal(evaluateLicense({environmentType:'PRODUCTION'}).active,false);
  assert.equal(evaluateLicense({environmentType:'PRODUCTION',license:{active:false}}).active,false);
  const trial=evaluateLicense({environmentType:'PRODUCTION',license:{active:true,isEvaluation:true}});
  assert.equal(trial.active,true);
  assert.equal(trial.isEvaluation,true);
});
