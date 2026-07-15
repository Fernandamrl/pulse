'use strict';

var assert = require('node:assert/strict');
var executive = require('../src/v6/executive');

var decision = executive.buildDecision({ id: '1', name: 'Fila', backlog: 120, delta: 10, lat_min: 90, target_min: 100, target_usage_pct: 90 }, { ahtMinutes: 4 }, { recoveryHorizonMinutes: 60, occupancyFactor: 0.85 });
assert.equal(decision.state, 'ALERT');
assert.equal(decision.remainingMinutes, 10);
assert.equal(decision.minimumCapacityAgents, 57);
assert.equal(decision.reasons.includes('Tendência de crescimento'), true);

var breached = executive.buildDecision({ id: '2', name: 'Fila 2', backlog: 100, delta: -2, lat_min: 112, target_min: 100, target_usage_pct: 112 }, { aht: 3 }, { recoveryHorizonMinutes: 60, occupancyFactor: 0.85 });
assert.equal(breached.breachAgeMinutes, 12);
assert.equal(breached.remainingMinutes, null);
assert.equal(breached.minimumCapacityAgents, 6);

console.log('Executive v6 tests passed.');
