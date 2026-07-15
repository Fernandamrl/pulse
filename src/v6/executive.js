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
