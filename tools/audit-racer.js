#!/usr/bin/env node

/*
 * Lightweight project audit for JavaScript Racer.
 *
 * Default mode reports findings and exits 0 so it can be used during planning.
 * Use --strict to fail on high-severity findings before release/refactor gates.
 */

var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '..');
var strict = process.argv.indexOf('--strict') >= 0;
var findings = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function add(severity, pathName, message) {
  findings.push({ severity: severity, path: pathName, message: message });
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    add('HIGH', relativePath, 'Required project file is missing.');
  }
}

[
  'README.md',
  'index.html',
  'common.js',
  'common.css',
  'stats.js',
  'v1.straight.html',
  'v2.curves.html',
  'v3.hills.html',
  'v4.final.html',
  '.claude/skills/claude-code-game-studios/SKILL.md'
].forEach(requireFile);

if (exists('v4.final.html')) {
  var finalHtml = read('v4.final.html');

  if (/[^\w$]index\s*=\s*oldSegment\.cars\.indexOf\(car\)/.test(finalHtml)) {
    add('HIGH', 'v4.final.html', 'updateCars assigns to index without declaring it; declare index locally to avoid leaking a global variable.');
  }

  if (finalHtml.indexOf('Game.run({') < 0) {
    add('HIGH', 'v4.final.html', 'Final playable page does not appear to start the Game.run loop.');
  }

  if (finalHtml.indexOf('updateCars(dt, playerSegment, playerW);') < 0) {
    add('MEDIUM', 'v4.final.html', 'Traffic update hook was not found in the main update loop.');
  }
}

if (exists('common.js')) {
  var common = read('common.js');

  if (common.indexOf('preventDefault') < 0) {
    add('MEDIUM', 'common.js', 'Keyboard handlers do not prevent default arrow-key page scrolling.');
  }

  if (common.indexOf('playAttempt.catch') < 0) {
    add('MEDIUM', 'common.js', 'Audio autoplay promise rejection is not handled.');
  }

  if (common.indexOf('try {') < 0 || common.indexOf('window.localStorage') < 0) {
    add('LOW', 'common.js', 'localStorage access is not guarded with a fallback.');
  }
}

if (exists('README.md')) {
  var readme = read('README.md');

  if (readme.indexOf('licensed ONLY for use in this') < 0) {
    add('HIGH', 'README.md', 'Music license restriction note was not found; commercial readiness may be unsafe.');
  }

  if (readme.indexOf('sprite graphics are placeholder') < 0) {
    add('HIGH', 'README.md', 'Placeholder sprite license warning was not found; commercial readiness may be unsafe.');
  }
}

if (!exists('production/qa/smoke-checklist.md')) {
  add('MEDIUM', 'production/qa/smoke-checklist.md', 'Smoke checklist is missing; create it before refactoring gameplay/runtime behavior.');
}

console.log('JavaScript Racer Audit');
console.log('=======================');

if (!findings.length) {
  console.log('PASS: no findings.');
  process.exit(0);
}

findings.forEach(function(finding) {
  console.log('[' + finding.severity + '] ' + finding.path + ' — ' + finding.message);
});

var highCount = findings.filter(function(finding) { return finding.severity === 'HIGH'; }).length;
console.log('\nSummary: ' + findings.length + ' finding(s), ' + highCount + ' high severity.');

if (strict && highCount > 0) {
  process.exit(1);
}
