'use strict';

var fs = require('node:fs');
var path = require('node:path');

var ROOT = path.resolve(__dirname, '..');
var TARGETS = [
  'workflows/dist/PULSE_ADS_v6.js',
  'workflows/dist/PULSE_TNS_v6.js'
];

TARGETS.forEach(function(relativePath) {
  var absolutePath = path.join(ROOT, relativePath);
  var source = fs.readFileSync(absolutePath, 'utf8');

  // n8n permits a top-level return in a Code node. Function compilation validates
  // that exact body without executing n8n globals such as $input.
  Function(source);

  if (!source.includes('var PULSE_CORE = (function()')) {
    throw new Error(relativePath + ' does not contain the standalone Core bundle.');
  }
  var bundleSource = source.split('// PROCESSAR SNAPSHOT')[0];
  var requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  var match;
  while ((match = requirePattern.exec(bundleSource)) !== null) {
    if (!match[1].startsWith('./')) {
      throw new Error(relativePath + ' contains an external require: ' + match[1]);
    }
  }
  console.log('Syntax valid: ' + relativePath);
});
