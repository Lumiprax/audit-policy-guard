'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

test('Forge entry module loads and exports both handlers',()=>{
  const entry=require('../src/index.js');
  assert.ok(entry.handler);
  assert.equal(typeof entry.auditMonitor,'function');
});
