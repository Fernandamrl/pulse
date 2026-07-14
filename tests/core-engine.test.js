'use strict';

var assert = require('node:assert/strict');
var core = require('../src/core');

function candidate(queueId, backlog, latencyMinutes, targetMinutes) {
  return {
    queueId: queueId,
    backlog: backlog,
    sla: core.sla.calculateSlaMetrics({
      latencyMinutes: latencyMinutes,
      targetMinutes: targetMinutes
    })
  };
}

var ok = candidate('ok', 10, 79, 100);
var alert = candidate('alert', 20, 80, 100);
var breached = candidate('breached', 5, 125, 100);
var unknown = candidate('unknown', 100, null, 100);

assert.equal(ok.sla.state, 'OK');
assert.equal(ok.sla.remainingMinutes, 21);
assert.equal(alert.sla.state, 'ALERT');
assert.equal(alert.sla.remainingMinutes, 20);
assert.equal(breached.sla.state, 'BREACHED');
assert.equal(breached.sla.remainingMinutes, 0);
assert.equal(breached.sla.breachAgeMinutes, 25);
assert.equal(unknown.sla.state, 'UNKNOWN');
assert.equal(unknown.sla.usagePct, null);

var ranked = core.priority.rankQueues(
  [unknown, ok, alert, breached],
  { reportBacklog: 135 }
);

assert.deepEqual(
  ranked.map(function(item) { return item.queueId; }),
  ['breached', 'alert', 'ok', 'unknown']
);
assert.deepEqual(
  ranked.map(function(item) { return item.priority.rank; }),
  [1, 2, 3, 4]
);

var recommendation = core.recommendation.buildRecommendation(breached);
assert.equal(recommendation.action, 'PRIORITIZE_NOW');
assert.equal(recommendation.reasons[0].code, 'SLA_BREACHED');
assert.equal(recommendation.eta.status, 'NOT_IMPLEMENTED');
assert.equal(recommendation.eta.message, 'não implementado');
assert.equal(recommendation.staffing.status, 'NOT_IMPLEMENTED');
assert.equal(recommendation.staffing.message, 'não implementado');

assert.throws(function() {
  core.sla.calculateSlaMetrics(
    { latencyMinutes: 1, targetMinutes: 2 },
    { thresholds: { alertUsageRatio: 1, breachUsageRatio: 0.8 } }
  );
}, /Invalid SLA thresholds/);

console.log('Core Engine tests passed.');
