'use strict';

var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');

var ROOT = path.resolve(__dirname, '..');
var pairs = [
  ['workflows/01_PULSE_ADS_v5.js', 'workflows/dist/PULSE_ADS_v6.js'],
  ['workflows/02_PULSE_TNS_v5.js', 'workflows/dist/PULSE_TNS_v6.js']
];

pairs.forEach(function(pair) {
  var source = fs.readFileSync(path.join(ROOT, pair[0]), 'utf8').replace(/\r\n/g, '\n');
  var generated = fs.readFileSync(path.join(ROOT, pair[1]), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(generated.includes(source.split('\n')[0]), true);
  assert.equal(generated.includes('function __pulseRunLegacy()'), true);
  assert.equal(generated.includes('PULSE_CORE.executive.enhance'), true);
  assert.equal(generated.includes("message: 'não implementado'"), true);
});

console.log('Generated workflow preservation tests passed.');
