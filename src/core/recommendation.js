'use strict';

var SLA_STATES = require('./sla').SLA_STATES;
var estimateEta = require('./eta').estimateEta;
var suggestAgents = require('./staffing').suggestAgents;

var ACTIONS = Object.freeze({
  PRIORITIZE_NOW: 'PRIORITIZE_NOW',
  MONITOR_CLOSELY: 'MONITOR_CLOSELY',
  MONITOR: 'MONITOR',
  CHECK_DATA: 'CHECK_DATA'
});

function recommendationForState(state) {
  if (state === SLA_STATES.BREACHED) {
    return {
      action: ACTIONS.PRIORITIZE_NOW,
      reasonCode: 'SLA_BREACHED',
      reason: 'A fila ultrapassou a meta de SLA.'
    };
  }

  if (state === SLA_STATES.ALERT) {
    return {
      action: ACTIONS.MONITOR_CLOSELY,
      reasonCode: 'SLA_NEAR_BREACH',
      reason: 'A fila está próxima da meta de SLA.'
    };
  }

  if (state === SLA_STATES.OK) {
    return {
      action: ACTIONS.MONITOR,
      reasonCode: 'SLA_WITHIN_TARGET',
      reason: 'A fila está dentro da meta de SLA.'
    };
  }

  return {
    action: ACTIONS.CHECK_DATA,
    reasonCode: 'SLA_DATA_UNAVAILABLE',
    reason: 'Não há dados suficientes para avaliar o SLA.'
  };
}

function buildRecommendation(candidate) {
  candidate = candidate || {};
  var state = candidate.sla && candidate.sla.state
    ? candidate.sla.state
    : SLA_STATES.UNKNOWN;
  var base = recommendationForState(state);

  return {
    action: base.action,
    reasons: [{
      code: base.reasonCode,
      message: base.reason,
      evidence: {
        slaState: state,
        usagePct: candidate.sla ? candidate.sla.usagePct : null,
        remainingMinutes: candidate.sla
          ? candidate.sla.remainingMinutes
          : null,
        breachAgeMinutes: candidate.sla
          ? candidate.sla.breachAgeMinutes
          : null
      }
    }],
    eta: estimateEta(candidate),
    staffing: suggestAgents(candidate)
  };
}

module.exports = {
  ACTIONS: ACTIONS,
  buildRecommendation: buildRecommendation
};
