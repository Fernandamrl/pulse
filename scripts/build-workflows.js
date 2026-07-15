'use strict';

var fs = require('node:fs');
var path = require('node:path');

var ROOT = path.resolve(__dirname, '..');
var CORE_DIR = path.join(ROOT, 'src', 'core');
var DIST_DIR = path.join(ROOT, 'workflows', 'dist');

var MODULES = [
  { id: './sla', file: 'sla.js' },
  { id: './priority', file: 'priority.js' },
  { id: './eta', file: 'eta.js' },
  { id: './staffing', file: 'staffing.js' },
  { id: './recommendation', file: 'recommendation.js' },
  { id: './index', file: 'index.js' }
];

var TARGETS = [
  {
    source: 'workflows/01_PULSE_ADS_v5.js',
    output: 'workflows/dist/PULSE_ADS_v6.js',
    report: 'ADS'
  },
  {
    source: 'workflows/02_PULSE_TNS_v5.js',
    output: 'workflows/dist/PULSE_TNS_v6.js',
    report: 'TNS'
  }
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function indent(content, spaces) {
  var prefix = ' '.repeat(spaces);
  return content.split('\n').map(function(line) {
    return prefix + line;
  }).join('\n');
}

function buildCoreBundle() {
  var factories = MODULES.map(function(moduleDefinition) {
    var source = read(path.join('src', 'core', moduleDefinition.file));
    return JSON.stringify(moduleDefinition.id) + ': function(module, exports, require) {\n' +
      indent(source, 4) + '\n  }';
  }).join(',\n  ');

  return [
    'var PULSE_CORE = (function() {',
    "  'use strict';",
    '  var factories = {',
    '  ' + factories,
    '  };',
    '  var cache = {};',
    '  function localRequire(id) {',
    "    if (!factories[id]) throw new Error('Unknown PULSE Core module: ' + id);",
    '    if (!cache[id]) {',
    '      var module = { exports: {} };',
    '      cache[id] = module;',
    '      factories[id](module, module.exports, localRequire);',
    '    }',
    '    return cache[id].exports;',
    '  }',
    "  return localRequire('./index');",
    '}());'
  ].join('\n');
}

function buildTarget(target, bundle) {
  var workflow = read(target.source);
  var banner = [
    '// GENERATED FILE — DO NOT EDIT DIRECTLY.',
    '// Run: npm run build',
    '// Standalone n8n Code node artifact for PULSE ' + target.report + ' v6.',
    '// The bundled Core Engine is intentionally dormant until integration is approved.',
    ''
  ].join('\n');

  var generated = banner + bundle + '\n\n' + workflow;
  var outputPath = path.join(ROOT, target.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, generated, 'utf8');
  return outputPath;
}

var bundle = buildCoreBundle();
TARGETS.forEach(function(target) {
  console.log('Built ' + path.relative(ROOT, buildTarget(target, bundle)));
});
