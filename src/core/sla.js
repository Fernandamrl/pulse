'use strict';

var SLA_STATES = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  OK: 'OK',
  ALERT: 'ALERT',
  BREACHED: 'BREACHED'
});

var DEFAULT_THRESHOLDS = Object.freeze({
  alertUsageRatio: 0.8,
  breachUsageRatio: 1
});

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  var number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validThresholds(thresholds) {
  var alertRatio = finiteNumber(thresholds.alertUsageRatio);
  var breachRatio = finiteNumber(thresholds.breachUsageRatio);

  if (
    alertRatio === null ||
    breachRatio === null ||
    alertRatio < 0 ||
    breachRatio <= alertRatio
  ) {
    throw new Error('Invalid SLA thresholds.');
  }

  return {
    alertUsageRatio: alertRatio,
    breachUsageRatio: breachRatio
  };
}

function calculateSlaMetrics(queue, options) {
  queue = queue || {};
  options = options || {};

  var thresholds = validThresholds(
    Object.assign({}, DEFAULT_THRESHOLDS, options.thresholds || {})
  );
  var latencyMinutes = finiteNumber(queue.latencyMinutes);
  var targetMinutes = finiteNumber(queue.targetMinutes);

  if (
    latencyMinutes === null ||
    targetMinutes === null ||
    latencyMinutes < 0 ||
    targetMinutes <= 0
  ) {
    return {
      state: SLA_STATES.UNKNOWN,
      usageRatio: null,
      usagePct: null,
      remainingMinutes: null,
      breachAgeMinutes: null,
      dataQuality: ['INVALID_OR_MISSING_SLA_DATA']
    };
  }

  var usageRatio = latencyMinutes / targetMinutes;
  var state = SLA_STATES.OK;

  if (usageRatio >= thresholds.breachUsageRatio) {
    state = SLA_STATES.BREACHED;
  } else if (usageRatio >= thresholds.alertUsageRatio) {
    state = SLA_STATES.ALERT;
  }

  return {
    state: state,
    usageRatio: usageRatio,
    usagePct: usageRatio * 100,
    remainingMinutes: state === SLA_STATES.BREACHED
      ? 0
      : Math.max(0, targetMinutes - latencyMinutes),
    breachAgeMinutes: state === SLA_STATES.BREACHED
      ? Math.max(0, latencyMinutes - targetMinutes)
      : null,
    dataQuality: []
  };
}

module.exports = {
  SLA_STATES: SLA_STATES,
  DEFAULT_THRESHOLDS: DEFAULT_THRESHOLDS,
  calculateSlaMetrics: calculateSlaMetrics
};
