import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outfile = resolve('dist/wechat/game.js');
const infofile = resolve('dist/wechat/build-info.json');

function currentCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function decodeUnicodeEscapes(value) {
  return value.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_match, braced, fixed) => {
    const codePoint = Number.parseInt(braced || fixed, 16);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _match;
  });
}

function bundleContainsMarker(bundle, marker) {
  return bundle.includes(marker) || decodeUnicodeEscapes(bundle).includes(marker);
}

const bundle = await readFile(outfile, 'utf8');
const requiredMarkers = [
  ['frontend runtime marker', 'RUNTIME V2 FRONTEND'],
  ['frontend scene boundary', 'RacerV2FrontendScene'],
  ['manual nitro tutorial', '拾取蓝色 N 后按住氮气'],
  ['nitro control label', '氮气'],
  ['sprint validation marker', 'RacerFeedbackController']
];

const missing = requiredMarkers
  .filter(([, marker]) => !bundleContainsMarker(bundle, marker))
  .map(([label, marker]) => `${label}: ${marker}`);

if (missing.length) {
  console.error('[racer] WeChat bundle verification failed. Missing current runtime markers:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

const fileStats = await stat(outfile);
const info = {
  commit: currentCommit(),
  builtAt: new Date().toISOString(),
  entry: 'src/main.wx.ts',
  output: 'dist/wechat/game.js',
  bytes: fileStats.size,
  markers: requiredMarkers.map(([label, marker]) => ({ label, marker }))
};

await writeFile(infofile, `${JSON.stringify(info, null, 2)}\n`, 'utf8');
console.log(`[racer] verified WeChat bundle ${info.commit} (${info.bytes} bytes)`);
console.log(`[racer] build metadata: ${infofile}`);
