// GENERATED FILE — DO NOT EDIT DIRECTLY.
// Run: npm run build
// Standalone n8n Code node artifact for PULSE TNS v6.
// The bundled Core Engine is intentionally dormant until integration is approved.
var PULSE_CORE = (function() {
  'use strict';
  var factories = {
  "./sla": function(module, exports, require) {
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
    
  },
  "./priority": function(module, exports, require) {
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
    
  },
  "./eta": function(module, exports, require) {
    'use strict';
    
    function estimateEta() {
      return {
        status: 'NOT_IMPLEMENTED',
        message: 'não implementado',
        etaMinutes: null,
        confidence: null
      };
    }
    
    module.exports = {
      estimateEta: estimateEta
    };
    
  },
  "./staffing": function(module, exports, require) {
    'use strict';
    
    function suggestAgents() {
      return {
        status: 'NOT_IMPLEMENTED',
        message: 'não implementado',
        suggestedCount: null,
        agents: []
      };
    }
    
    module.exports = {
      suggestAgents: suggestAgents
    };
    
  },
  "./recommendation": function(module, exports, require) {
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
    
  },
  "./index": function(module, exports, require) {
    'use strict';
    
    module.exports = {
      sla: require('./sla'),
      priority: require('./priority'),
      recommendation: require('./recommendation'),
      eta: require('./eta'),
      staffing: require('./staffing')
    };
    
  },
  "./executive": function(module, exports, require) {
    'use strict';
    
    function number(value) {
      var parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    
    function resolveAhtMinutes(queue) {
      var direct = [queue.ahtMinutes, queue.aht_min, queue.averageHandlingTimeMinutes, queue.aht];
      for (var i = 0; i < direct.length; i++) {
        var value = number(direct[i]);
        if (value !== null && value > 0) return value;
      }
      var milliseconds = number(queue.ahtMs || queue.averageHandlingTimeMs);
      return milliseconds !== null && milliseconds > 0 ? milliseconds / 60000 : null;
    }
    
    function formatMinutes(value) {
      value = Math.max(0, Math.round(value));
      if (value < 60) return value + ' min';
      var hours = Math.floor(value / 60);
      var minutes = value % 60;
      return hours + 'h' + (minutes ? String(minutes).padStart(2, '0') + 'min' : '');
    }
    
    function buildDecision(item, rawQueue, options) {
      var usage = item.target_usage_pct;
      var state = usage === null ? 'UNKNOWN' : usage >= 100 ? 'BREACHED' : usage >= 80 ? 'ALERT' : 'OK';
      var remaining = item.target_min === null ? null : Math.max(0, item.target_min - item.lat_min);
      var breachAge = item.target_min === null ? null : Math.max(0, item.lat_min - item.target_min);
      var aht = resolveAhtMinutes(rawQueue || {});
      var horizon = state === 'BREACHED' ? options.recoveryHorizonMinutes : remaining;
      var capacity = aht && horizon && horizon > 0
        ? Math.ceil((item.backlog * aht) / horizon / options.occupancyFactor)
        : null;
      var reasons = [];
      if (state === 'BREACHED') reasons.push('SLA ultrapassado');
      if (state === 'ALERT') reasons.push('Fila próxima do SLA');
      if (item.delta > 0) reasons.push('Tendência de crescimento');
      if (item.backlog > 0) reasons.push('Backlog atual de ' + item.backlog.toLocaleString('pt-BR') + ' tickets');
      if (aht) reasons.push('AHT de ' + formatMinutes(aht));
      return {
        queueId: item.id,
        name: item.name,
        backlog: item.backlog,
        delta: item.delta,
        state: state,
        slaUsagePct: usage,
        remainingMinutes: state === 'BREACHED' ? null : remaining,
        breachAgeMinutes: state === 'BREACHED' ? breachAge : null,
        ahtMinutes: aht,
        minimumCapacityAgents: capacity,
        reasons: reasons
      };
    }
    
    function icon(state) {
      return state === 'BREACHED' ? '🔴' : state === 'ALERT' ? '🟠' : state === 'OK' ? '🟢' : '⚪';
    }
    
    function decisionLines(decision, index) {
      var lines = [(index + 1) + '️⃣ ' + decision.name, '', icon(decision.state) + ' ' +
        (decision.slaUsagePct === null ? 'SLA indisponível' : decision.slaUsagePct + '% da meta')];
      if (decision.breachAgeMinutes !== null) lines.push('⏱ SLA ultrapassado há ' + formatMinutes(decision.breachAgeMinutes));
      if (decision.remainingMinutes !== null) lines.push('⏱ ETA até SLA: ' + formatMinutes(decision.remainingMinutes));
      lines.push('');
      lines.push(decision.minimumCapacityAgents === null
        ? '💡 Capacidade estimada indisponível'
        : '💡 Capacidade mínima estimada: ' + decision.minimumCapacityAgents + ' agente(s) simultâneo(s)');
      if (decision.reasons.length) {
        lines.push('', 'Motivo');
        decision.reasons.forEach(function(reason) { lines.push('• ' + reason); });
      }
      return lines;
    }
    
    function enhance(legacyResult, rawInput, reportConfig) {
      var output = legacyResult[0].json;
      var raw = Array.isArray(rawInput) ? rawInput[0] : rawInput;
      var rawQueues = raw && raw.tables && Array.isArray(raw.tables.reportQueues) ? raw.tables.reportQueues : [];
      var byId = {};
      rawQueues.forEach(function(queue) { byId[String(queue.queueId || '')] = queue; });
      var options = { recoveryHorizonMinutes: 60, occupancyFactor: 0.85 };
      var decisions = output.activeQueues.map(function(item) { return buildDecision(item, byId[item.id], options); });
      decisions.sort(function(a, b) {
        var order = { BREACHED: 0, ALERT: 1, OK: 2, UNKNOWN: 3 };
        return order[a.state] - order[b.state] || (b.slaUsagePct || 0) - (a.slaUsagePct || 0) || b.backlog - a.backlog;
      });
      var breached = decisions.filter(function(d) { return d.state === 'BREACHED'; });
      var alerts = decisions.filter(function(d) { return d.state === 'ALERT'; });
      var normal = decisions.filter(function(d) { return d.state === 'OK'; });
      var status = breached.length ? '🔴 STATUS: CRÍTICO' : alerts.length ? '🟠 STATUS: ATENÇÃO' : '🟢 STATUS: CONTROLADO';
      var lines = ['*📡 PULSE | EAST RIVER ' + output.reportCode + '*', '', output.importedAtLabel + ' | Ciclo ' + output.currentLabel, '',
        '*' + status + '*', output.totalDrain < 0 ? '↘ Recuperando' : output.totalDrain > 0 ? '↗ Backlog crescendo' : '→ Estável', '',
        '📦 Backlog: *' + output.backlogTotal.toLocaleString('pt-BR') + '*', '📈 Movimento: *' + (output.totalDrain > 0 ? '+' : '') + output.totalDrain + '*', '',
        '🏔 Peak: *' + output.peakBacklog.toLocaleString('pt-BR') + '*', '📉 Recuperação: *' + output.pctResolvido + '%*', '',
        '📊 Filas: *' + decisions.length + '*', '🔴 ' + breached.length + ' | 🟠 ' + alerts.length + ' | 🟢 ' + normal.length, '', '*🎯 AÇÕES RECOMENDADAS*', ''];
      decisions.slice(0, 3).forEach(function(d, i) { lines.push.apply(lines, decisionLines(d, i)); lines.push(''); });
      lines.push('*🚨 EXCEÇÕES DE SLA*', '');
      breached.concat(alerts).forEach(function(d) {
        lines.push(icon(d.state) + ' ' + d.name + ' | ' + d.slaUsagePct + '% | ' +
          (d.state === 'BREACHED' ? formatMinutes(d.breachAgeMinutes) + ' após SLA' : formatMinutes(d.remainingMinutes) + ' até SLA'));
      });
      if (!breached.length && !alerts.length) lines.push('🟢 Nenhuma exceção de SLA.');
      lines.push('', reportConfig.reportCode === 'ADS' ? '*📊 FILAS COM BACKLOG*' : '*📊 MAIOR VOLUME*', '');
      var displayed = reportConfig.reportCode === 'ADS' ? decisions : normal.slice(0, 5);
      displayed.forEach(function(d) { lines.push(icon(d.state) + ' ' + d.name + ' | ' + d.backlog.toLocaleString('pt-BR') + ' | ' + (d.slaUsagePct === null ? 'n/d' : d.slaUsagePct + '%')); });
      lines.push('', '⏰ Próxima atualização: em 30 minutos', '', '💡 Sugestões operacionais baseadas em dados.', '', '_PULSE v6_');
      output.whatsappText = lines.join('\n');
      output.decisionsV6 = decisions;
      var chart = JSON.parse(output.quickchartBody);
      chart.width = 720;
      chart.height = 320;
      output.quickchartBody = JSON.stringify(chart);
      return legacyResult;
    }
    
    module.exports = { enhance: enhance, buildDecision: buildDecision, resolveAhtMinutes: resolveAhtMinutes };
    
  }
  };
  var cache = {};
  function localRequire(id) {
    if (!factories[id]) throw new Error('Unknown PULSE Core module: ' + id);
    if (!cache[id]) {
      var module = { exports: {} };
      cache[id] = module;
      factories[id](module, module.exports, localRequire);
    }
    return cache[id].exports;
  }
  var core = localRequire('./index');
  core.executive = localRequire('./executive');
  return core;
}());

function __pulseRunLegacy() {
  // ============================================================================
  // PROCESSAR SNAPSHOT TNS — PULSE V5
  // East River Monitor — classificação por meta_latency_formatada
  //
  // Monitora todas as filas do report TNS com backlog > 0.
  // Status por fila:
  //   🟢 OK        = latência < 80% da meta
  //   🟠 Alerta    = latência entre 80% e 99% da meta
  //   🔴 Estourado = latência >= 100% da meta
  //
  // Se meta_latency_formatada estiver ausente ou inválida,
  // usa latencyAdherence da API como fallback.
  // ============================================================================
  
  var REPORT_CODE = 'TNS';
  var REPORT_LABEL = 'TNS';
  var HISTORY_LIMIT = 49;
  
  var raw = $input.first().json;
  var data = Array.isArray(raw) ? raw[0] : raw;
  
  if (!data || !data.metadata) {
    throw new Error(
      'Estrutura inválida. Keys: ' +
      JSON.stringify(Object.keys(data || {}))
    );
  }
  
  var metadata = data.metadata || {};
  var summary = data.summary || {};
  var tables = data.tables || {};
  
  // ============================================================================
  // CICLO
  // ============================================================================
  
  var selectedCycle = metadata.selectedCycle || '';
  var previousCycle = metadata.previousCycle || '';
  var importedAtLabel = metadata.importedAtLabel || selectedCycle;
  
  function cycleTime(value) {
    if (!value) return '';
    var parts = String(value).split(' ');
    return parts[1] || value;
  }
  
  var currentLabel = cycleTime(selectedCycle);
  var previousLabel = cycleTime(previousCycle);
  
  // ============================================================================
  // HELPERS GERAIS
  // ============================================================================
  
  function normalize(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  function fmtLat(minutes) {
    minutes = Math.max(0, Math.round(Number(minutes || 0)));
  
    if (minutes < 60) {
      return minutes + 'min';
    }
  
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
  
    return hours + 'h' +
      (mins > 0 ? String(mins).padStart(2, '0') + 'min' : '');
  }
  
  function fmtDelta(value) {
    value = Number(value || 0);
    return value > 0 ? '+' + value : String(value);
  }
  
  function trendIcon(value) {
    value = Number(value || 0);
  
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  }
  
  function statusIcon(status) {
    if (status === 'Estourado') return '🔴';
    if (status === 'Alerta') return '🟠';
    return '🟢';
  }
  
  function compactNumber(value) {
    return Number(value || 0).toLocaleString('pt-BR');
  }
  
  function compactQueueLine(item) {
    var currentLatency = fmtLat(item.lat_min);
    var targetLatency = item.target_min !== null
      ? fmtLat(item.target_min)
      : (item.target_raw || '?');
  
    var usage = item.target_usage_pct !== null
      ? item.target_usage_pct + '%'
      : 'n/d';
  
    return statusIcon(item.status) + ' ' +
      item.name + ' | ' +
      compactNumber(item.backlog) + ' | ' +
      currentLatency + '/' + targetLatency + ' | ' +
      usage + ' | ' +
      fmtDelta(item.delta) + trendIcon(item.delta);
  }
  
  function movementLabel(drain) {
    drain = Number(drain || 0);
  
    if (drain <= -100) return 'Recuperação forte';
    if (drain < 0) return 'Recuperando';
    if (drain >= 100) return 'Crescimento forte';
    if (drain > 0) return 'Backlog crescendo';
    return 'Estável';
  }
  
  // ============================================================================
  // META DE LATÊNCIA
  // Aceita, por exemplo:
  //   120
  //   "120"
  //   "120 min"
  //   "2h"
  //   "2h30min"
  //   "02:30"
  //   "02:30:00"
  //   "1.5h"
  // ============================================================================
  
  function parseLatencyTarget(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }
  
    if (typeof value === 'number' && isFinite(value)) {
      return value > 0 ? Math.round(value) : null;
    }
  
    var rawTarget = normalize(value)
      .replace(/\s+/g, '')
      .replace(/,/g, '.');
  
    if (!rawTarget) return null;
  
    if (/^\d{1,3}:\d{2}(:\d{2})?$/.test(rawTarget)) {
      var timeParts = rawTarget.split(':');
      var hours = Number(timeParts[0] || 0);
      var minutes = Number(timeParts[1] || 0);
      var seconds = Number(timeParts[2] || 0);
  
      var totalFromClock =
        hours * 60 +
        minutes +
        Math.round(seconds / 60);
  
      return totalFromClock > 0 ? totalFromClock : null;
    }
  
    var total = 0;
    var found = false;
  
    var hourMatch = rawTarget.match(
      /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hora|horas)/
    );
  
    var minuteMatch = rawTarget.match(
      /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minuto|minutos)/
    );
  
    if (hourMatch) {
      total += Number(hourMatch[1]) * 60;
      found = true;
    }
  
    if (minuteMatch) {
      total += Number(minuteMatch[1]);
      found = true;
    }
  
    if (found) {
      total = Math.round(total);
      return total > 0 ? total : null;
    }
  
    if (/^\d+(?:\.\d+)?$/.test(rawTarget)) {
      var numericTarget = Math.round(Number(rawTarget));
      return numericTarget > 0 ? numericTarget : null;
    }
  
    return null;
  }
  
  function normalizeApiStatus(value) {
    var status = normalize(value);
  
    if (
      status === 'estourado' ||
      status === 'burst' ||
      status === 'critical' ||
      status === 'critico'
    ) {
      return 'Estourado';
    }
  
    if (
      status === 'alerta' ||
      status === 'alert' ||
      status === 'warning' ||
      status === 'atencao'
    ) {
      return 'Alerta';
    }
  
    return 'OK';
  }
  
  function latencyUsagePct(latencyMin, targetMin) {
    latencyMin = Number(latencyMin || 0);
    targetMin = Number(targetMin || 0);
  
    if (!targetMin || targetMin <= 0) {
      return null;
    }
  
    return Math.round((latencyMin / targetMin) * 100);
  }
  
  function latencyStatus(latencyMin, targetMin, apiStatus) {
    latencyMin = Number(latencyMin || 0);
    targetMin = Number(targetMin || 0);
  
    if (!targetMin || targetMin <= 0) {
      return normalizeApiStatus(apiStatus);
    }
  
    var usage = latencyMin / targetMin;
  
    if (usage >= 1) return 'Estourado';
    if (usage >= 0.8) return 'Alerta';
    return 'OK';
  }
  
  // ============================================================================
  // BACKLOG TOTAL DO REPORT
  // ============================================================================
  
  var reportBacklog = 0;
  var reportInput = 0;
  var reportOutput = 0;
  
  if (summary && Array.isArray(summary.reports)) {
    for (var reportIndex = 0; reportIndex < summary.reports.length; reportIndex++) {
      var reportRow = summary.reports[reportIndex];
  
      if (String(reportRow.report || '').toUpperCase() === REPORT_CODE) {
        reportBacklog = Number(reportRow.backlog || 0);
        reportInput = Number(reportRow.input || 0);
        reportOutput = Number(reportRow.output || 0);
        break;
      }
    }
  }
  
  // ============================================================================
  // NOMES AMIGÁVEIS
  // ============================================================================
  
  var FRIENDLY_NAMES = {
    '600001300': 'Comment Review BR (600001300)',
    '600001306': 'Comment Review QA (600001306)',
    '600001312': 'Comment Review Appeal (600001312)',
    '5486': 'Text & Pics (5486)',
    '600002377': 'Private Letter Pic (600002377)',
    '600000970': 'Private Letter (600000970)',
    '600000615': 'Private Letter BR (600000615)',
    '600000968': 'Private Letter Appeal (600000968)',
    '600001260': 'User Report BR (600001260)',
    '600001199': 'Report BR (600001199)',
    '5121': 'Family Audit BR (5121)',
    '5130': 'Family Audit BR 2 (5130)',
    '5860': 'Safety L2 (5860)',
    '11364': 'Video L2 (11364)',
    '9551': 'Video Report (9551)',
    '9553': 'Video Appeal (9553)',
    '7338': 'Video Appeal L1 (7338)'
  };
  
  function queueLabel(queue) {
    var id = String(queue.queueId || '');
  
    if (FRIENDLY_NAMES[id]) {
      return FRIENDLY_NAMES[id];
    }
  
    var name = String(queue.queueName || queue.name || 'Fila')
      .replace(/^Commercialization\s+/i, '')
      .replace(/^Commercial\s+/i, '')
      .trim();
  
    if (name.length > 26) {
      name = name.substring(0, 26).trim() + '..';
    }
  
    return name + ' (' + id + ')';
  }
  
  // ============================================================================
  // PROCESSAMENTO DAS FILAS
  // ============================================================================
  
  var reportQueues = [];
  var activeQueues = [];
  var totalDrain = 0;
  var estourados = [];
  var alertas = [];
  
  if (tables && Array.isArray(tables.reportQueues)) {
    for (var queueIndex = 0; queueIndex < tables.reportQueues.length; queueIndex++) {
      var queue = tables.reportQueues[queueIndex];
  
      if (String(queue.report || '').toUpperCase() !== REPORT_CODE) {
        continue;
      }
  
      var queueDrain = Number(
        queue.deltas && queue.deltas.backlog
          ? queue.deltas.backlog
          : 0
      );
  
      totalDrain += queueDrain;
  
      if (Number(queue.backlog || 0) > 0) {
        reportQueues.push(queue);
      }
    }
  }
  
  reportQueues.sort(function(a, b) {
    return Number(b.backlog || 0) - Number(a.backlog || 0);
  });
  
  for (var activeIndex = 0; activeIndex < reportQueues.length; activeIndex++) {
    var sourceQueue = reportQueues[activeIndex];
  
    var latencyMin = Math.round(
      Number(sourceQueue.maxLatencyMs || 0) / 60000
    );
  
    var targetRaw =
      sourceQueue.meta_latency_formatada !== undefined
        ? sourceQueue.meta_latency_formatada
        : sourceQueue.metaLatencyFormatada;
  
    var targetMin = parseLatencyTarget(targetRaw);
  
    var calculatedStatus = latencyStatus(
      latencyMin,
      targetMin,
      sourceQueue.latencyAdherence
    );
  
    var usagePct = latencyUsagePct(
      latencyMin,
      targetMin
    );
  
    var item = {
      id: String(sourceQueue.queueId || ''),
      name: queueLabel(sourceQueue),
      backlog: Number(sourceQueue.backlog || 0),
      lat_min: latencyMin,
      delta: Number(
        sourceQueue.deltas && sourceQueue.deltas.backlog
          ? sourceQueue.deltas.backlog
          : 0
      ),
      status: calculatedStatus,
      target_raw:
        targetRaw !== null && targetRaw !== undefined
          ? String(targetRaw)
          : '',
      target_min: targetMin,
      target_usage_pct: usagePct,
      api_status:
        sourceQueue.latencyAdherence || ''
    };
  
    activeQueues.push(item);
  
    if (item.status === 'Estourado') {
      estourados.push(item);
    } else if (item.status === 'Alerta') {
      alertas.push(item);
    }
  }
  
  // ============================================================================
  // HISTÓRICO
  // ============================================================================
  
  var store = $getWorkflowStaticData('global');
  var historyKey = 'cycles_' + REPORT_CODE;
  
  if (!Array.isArray(store[historyKey])) {
    store[historyKey] = [];
  }
  
  var historyStore = store[historyKey];
  
  var lastCycle =
    historyStore.length > 0
      ? historyStore[historyStore.length - 1].ciclo
      : '';
  
  if (lastCycle !== selectedCycle) {
    historyStore.push({
      ciclo: selectedCycle,
      label: currentLabel,
      backlog: reportBacklog,
      drain: totalDrain
    });
  }
  
  if (historyStore.length > HISTORY_LIMIT) {
    historyStore = historyStore.slice(
      historyStore.length - HISTORY_LIMIT
    );
  }
  
  store[historyKey] = historyStore;
  var historico = historyStore;
  
  // ============================================================================
  // PEAK E RECUPERAÇÃO
  // ============================================================================
  
  var peakBacklog = 0;
  var peakLabel = '';
  
  for (var peakIndex = 0; peakIndex < historico.length; peakIndex++) {
    if (Number(historico[peakIndex].backlog || 0) > peakBacklog) {
      peakBacklog = Number(historico[peakIndex].backlog || 0);
      peakLabel = historico[peakIndex].label || '';
    }
  }
  
  var pctResolvido =
    peakBacklog > 0
      ? Math.round((1 - reportBacklog / peakBacklog) * 100)
      : 0;
  
  if (pctResolvido < 0) pctResolvido = 0;
  
  // ============================================================================
  // PRIORIDADES
  // ============================================================================
  
  var priorityVolume =
    activeQueues.length > 0
      ? activeQueues[0]
      : null;
  
  var priorityVolumeShare =
    priorityVolume && reportBacklog > 0
      ? Math.round(
          (priorityVolume.backlog / reportBacklog) * 100
        )
      : 0;
  
  var queuesWithTarget = activeQueues.filter(function(item) {
    return item.target_usage_pct !== null;
  });
  
  var prioritySla = null;
  
  if (queuesWithTarget.length > 0) {
    prioritySla = queuesWithTarget
      .slice()
      .sort(function(a, b) {
        if (b.target_usage_pct !== a.target_usage_pct) {
          return b.target_usage_pct - a.target_usage_pct;
        }
  
        return b.lat_min - a.lat_min;
      })[0];
  } else if (activeQueues.length > 0) {
    prioritySla = activeQueues
      .slice()
      .sort(function(a, b) {
        return b.lat_min - a.lat_min;
      })[0];
  }
  
  // ============================================================================
  // STATUS GERAL
  // ============================================================================
  
  function operationStatus() {
    if (estourados.length > 0) {
      return {
        icon: '🔴',
        label: 'CRÍTICO'
      };
    }
  
    if (alertas.length > 0) {
      return {
        icon: '🟠',
        label: 'ATENÇÃO'
      };
    }
  
    return {
      icon: '🟢',
      label: 'CONTROLADO'
    };
  }
  
  var opStatus = operationStatus();
  
  // ============================================================================
  // TEXTO WHATSAPP — PULSE TNS V5
  // Exibe todas as estouradas, todas em alerta e Top 5 normais.
  // ============================================================================
  
  var TOP_NORMAL = 5;
  
  var filasEstouradas = activeQueues.filter(function(item) {
    return item.status === 'Estourado';
  });
  
  var filasAlerta = activeQueues.filter(function(item) {
    return item.status === 'Alerta';
  });
  
  var filasNormais = activeQueues
    .filter(function(item) {
      return item.status === 'OK';
    })
    .sort(function(a, b) {
      return b.backlog - a.backlog;
    });
  
  var filasNormaisExibidas = filasNormais.slice(0, TOP_NORMAL);
  var normaisOcultadas = Math.max(0, filasNormais.length - filasNormaisExibidas.length);
  
  var lines = [];
  
  lines.push('*📡 PULSE | EAST RIVER TNS*');
  lines.push('*' + opStatus.icon + ' STATUS: ' + opStatus.label + ' | ' + movementLabel(totalDrain) + '*');
  lines.push('_' + importedAtLabel + ' | ciclo ' + currentLabel + '_');
  lines.push('');
  lines.push('Backlog: *' + compactNumber(reportBacklog) + '* | Movimento: *' + fmtDelta(totalDrain) + '* ' + trendIcon(totalDrain));
  
  if (peakBacklog > 0) {
    lines.push('Peak: *' + compactNumber(peakBacklog) + '* | Recuperação: *' + pctResolvido + '%*');
  }
  
  lines.push('Filas ativas: *' + activeQueues.length + '* | 🔴 ' + filasEstouradas.length + ' | 🟠 ' + filasAlerta.length + ' | 🟢 ' + filasNormais.length);
  lines.push('');
  lines.push('*EXCEÇÕES DE SLA*');
  
  if (filasEstouradas.length > 0) {
    lines.push('*🔴 ESTOURADAS: ' + filasEstouradas.length + '*');
    for (var i = 0; i < filasEstouradas.length; i++) {
      lines.push(compactQueueLine(filasEstouradas[i]));
    }
  }
  
  if (filasAlerta.length > 0) {
    lines.push('*🟠 EM ALERTA: ' + filasAlerta.length + '*');
    for (var j = 0; j < filasAlerta.length; j++) {
      lines.push(compactQueueLine(filasAlerta[j]));
    }
  }
  
  if (filasEstouradas.length === 0 && filasAlerta.length === 0) {
    lines.push('🟢 Nenhuma exceção de SLA.');
  }
  
  lines.push('');
  lines.push('*TOP 5 — MAIOR VOLUME NORMAL*');
  
  if (filasNormaisExibidas.length > 0) {
    for (var k = 0; k < filasNormaisExibidas.length; k++) {
      lines.push(compactQueueLine(filasNormaisExibidas[k]));
    }
  } else {
    lines.push('Nenhuma fila normal com backlog.');
  }
  
  if (normaisOcultadas > 0) {
    lines.push('_' + normaisOcultadas + ' fila(s) normal(is) ocultada(s)._');
  }
  
  lines.push('');
  lines.push('*PRIORIDADES*');
  
  if (priorityVolume) {
    lines.push('📦 Volume: ' + priorityVolume.name + ' | ' + compactNumber(priorityVolume.backlog) + ' tkts | ' + priorityVolumeShare + '% do backlog');
  }
  
  if (prioritySla) {
    lines.push(
      '⏱ SLA: ' + prioritySla.name +
      ' | ' + (prioritySla.target_usage_pct !== null ? prioritySla.target_usage_pct + '% da meta' : 'meta indisponível') +
      ' | ' + fmtLat(prioritySla.lat_min) + '/' +
      (prioritySla.target_min !== null ? fmtLat(prioritySla.target_min) : (prioritySla.target_raw || '?'))
    );
  }
  
  lines.push('');
  lines.push('Próxima atualização: *em 30 minutos*');
  lines.push('_PULSE v5_');
  
  var whatsappText = lines.join('\n');
  
  // ============================================================================
  // QUICKCHART
  // ============================================================================
  
  var lineLabels = [];
  var lineData = [];
  
  for (var historyIndex = 0; historyIndex < historico.length; historyIndex++) {
    lineLabels.push(historico[historyIndex].label);
    lineData.push(historico[historyIndex].backlog);
  }
  
  var barLabels = [];
  var barData = [];
  var barColors = [];
  
  for (var chartQueueIndex = 0; chartQueueIndex < activeQueues.length; chartQueueIndex++) {
    var chartQueue = activeQueues[chartQueueIndex];
  
    barLabels.push(chartQueue.name);
    barData.push(chartQueue.backlog);
  
    barColors.push(
      chartQueue.status === 'Estourado'
        ? '#e34948'
        : chartQueue.status === 'Alerta'
          ? '#eda100'
          : '#1baf7a'
    );
  }
  
  var chartTitle =
    'East River ' +
    REPORT_LABEL +
    ' | ' +
    importedAtLabel;
  
  if (peakBacklog > 0 && pctResolvido > 0) {
    chartTitle +=
      ' | Peak ' +
      peakBacklog.toLocaleString('pt-BR') +
      ' | -' +
      pctResolvido +
      '%';
  }
  
  var useHistorico = historico.length >= 2;
  var chartConfig;
  
  if (useHistorico) {
    chartConfig = {
      type: 'line',
      data: {
        labels: lineLabels,
        datasets: [{
          label: 'Backlog ' + REPORT_LABEL,
          data: lineData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.15)',
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 12
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 9
              },
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 12
            }
          },
          y: {
            beginAtZero: false,
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    };
  } else {
    chartConfig = {
      type: 'horizontalBar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'Backlog (tkts)',
          data: barData,
          backgroundColor: barColors,
          borderWidth: 0
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 12
            }
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    };
  }
  
  var quickchartBody = JSON.stringify({
    chart: chartConfig,
    width: 900,
    height: 420,
    format: 'png',
    backgroundColor: 'white'
  });
  
  // ============================================================================
  // SAÍDA
  // ============================================================================
  
  var output = {
    quickchartBody: quickchartBody,
    whatsappText: whatsappText,
    reportCode: REPORT_CODE,
    reportLabel: REPORT_LABEL,
    backlogTotal: reportBacklog,
    reportInput: reportInput,
    reportOutput: reportOutput,
    totalDrain: totalDrain,
    peakBacklog: peakBacklog,
    peakLabel: peakLabel,
    pctResolvido: pctResolvido,
    currentLabel: currentLabel,
    previousLabel: previousLabel,
    importedAtLabel: importedAtLabel,
    estouradoCount: estourados.length,
    alertaCount: alertas.length,
    filasAtivas: activeQueues.length,
    ciclosAcumulados: historico.length,
    priorityVolume: priorityVolume,
    prioritySla: prioritySla,
    activeQueues: activeQueues
  };
  
  if (REPORT_CODE === 'ADS') {
    output.adsBacklog = reportBacklog;
  }
  
  if (REPORT_CODE === 'TNS') {
    output.tnsBacklog = reportBacklog;
  }
  
  return [{
    json: output
  }];
  
  
}

var __pulseLegacyResult = __pulseRunLegacy();
return PULSE_CORE.executive.enhance(__pulseLegacyResult, $input.first().json, { reportCode: "TNS" });