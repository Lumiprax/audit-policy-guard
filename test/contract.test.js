'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const contract=require('../config/build-contract.json');
test('generated Forge build contract preserves release boundaries',()=>{ assert.equal(contract.buildEligibility,'READY_FOR_BUILD'); assert.equal(contract.boundaries.deployment,false); assert.equal(contract.boundaries.marketplaceSubmission,false); assert.equal(contract.boundaries.externalEgress,false); });
