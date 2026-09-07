'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pageHasMore}=require('../src/audit-service');

test('short Jira audit page is complete even when total is larger',()=>{
  assert.equal(pageHasMore({records:new Array(8).fill({}),limit:1000,total:42},8),false);
});

test('full Jira audit page continues when total indicates more',()=>{
  assert.equal(pageHasMore({records:new Array(2).fill({}),limit:2,total:5},2),true);
});

test('empty Jira audit page is always complete',()=>{
  assert.equal(pageHasMore({records:[],limit:1000,total:99},8),false);
});
