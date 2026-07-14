'use strict';

var SLA_STATES = require('./sla').SLA_STATES;

var BUCKET_ORDER = Object.freeze({
  BREACHED: 0,
  ALERT: 1,
  OK: 2,
  UNKNOWN: 3
});

var DEFAULT_WEIGHTS = Object.freeze({
  slaPressure: 0.7,
  backlogImpact: 0.3
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteOrZero(value) {
  var number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function calculatePriorityScore(candidate, options) {
  candidate = candidate || {};
  options = options || {};

  var weights = Object.assign({}, DEFAULT_WEIGHTS, options.weights || {});
  var usageRatio = finiteOrZero(candidate.sla && candidate.sla.usageRatio);
  var backlog = Math.max(0, finiteOrZero(candidate.backlog));
  var reportBacklog = Math.max(0, finiteOrZero(options.reportBacklog));
  var backlogShare = reportBacklog > 0 ? backlog / reportBacklog : 0;

  var slaPressure = clamp(usageRatio, 0, 2) / 2;
  var backlogImpact = clamp(backlogShare, 0, 1);

  return (
    slaPressure * finiteOrZero(weights.slaPressure) +
    backlogImpact * finiteOrZero(weights.backlogImpact)
  ) * 100;
}

function rankQueues(candidates, options) {
  candidates = Array.isArray(candidates) ? candidates : [];
  options = options || {};

  return candidates
    .map(function(candidate) {
      return Object.assign({}, candidate, {
        priority: {
          bucket: candidate.sla && candidate.sla.state
            ? candidate.sla.state
            : SLA_STATES.UNKNOWN,
          score: calculatePriorityScore(candidate, options),
          rank: null
        }
      });
    })
    .sort(function(a, b) {
      var bucketA = BUCKET_ORDER[a.priority.bucket];
      var bucketB = BUCKET_ORDER[b.priority.bucket];
      bucketA = bucketA === undefined ? BUCKET_ORDER.UNKNOWN : bucketA;
      bucketB = bucketB === undefined ? BUCKET_ORDER.UNKNOWN : bucketB;

      if (bucketA !== bucketB) return bucketA - bucketB;
      if (b.priority.score !== a.priority.score) {
        return b.priority.score - a.priority.score;
      }

      return String(a.queueId || '').localeCompare(String(b.queueId || ''));
    })
    .map(function(candidate, index) {
      candidate.priority.rank = index + 1;
      return candidate;
    });
}

module.exports = {
  BUCKET_ORDER: BUCKET_ORDER,
  DEFAULT_WEIGHTS: DEFAULT_WEIGHTS,
  calculatePriorityScore: calculatePriorityScore,
  rankQueues: rankQueues
};
