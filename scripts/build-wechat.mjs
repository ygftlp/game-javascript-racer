import { build, context } from 'esbuild';
import { access, copyFile, cp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const finalOutdir = resolve('dist/wechat');
const stagingOutdir = resolve('dist/.wechat-staging');
const gameJsonSource = resolve('src/platforms/wechat/game.json');

const REQUIRED_RUNTIME_MARKERS = [
  'RUNTIME S2',
  '拾取蓝色 N 后按住氮气',
  '氮气',
  'RacerFeedbackController'
];

function outputPaths(outdir) {
  return {
    outfile: resolve(outdir, 'game.js'),
    gameJsonTarget: resolve(outdir, 'game.json')
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyDirIfExists(from, to) {
  if (!(await exists(from))) return;
  await mkdir(dirname(to), { recursive: true });
  await cp(from, to, { recursive: true, force: true });
}

async function copyWechatFiles(outdir) {
  const { gameJsonTarget } = outputPaths(outdir);
  await mkdir(dirname(gameJsonTarget), { recursive: true });
  await copyFile(gameJsonSource, gameJsonTarget);
  await copyDirIfExists(resolve('images'), resolve(outdir, 'images'));
  await copyDirIfExists(resolve('music'), resolve(outdir, 'music'));
  await copyDirIfExists(resolve('assets'), resolve(outdir, 'assets'));
}

function buildOptions(outdir) {
  return {
    entryPoints: ['src/main.wx.ts'],
    bundle: true,
    format: 'iife',
    platform: 'neutral',
    target: 'es2019',
    charset: 'utf8',
    outfile: outputPaths(outdir).outfile,
    sourcemap: true,
    logLevel: 'info',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  };
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

async function verifyStagedBundle() {
  const { outfile } = outputPaths(stagingOutdir);
  const bundle = await readFile(outfile, 'utf8');
  const missing = REQUIRED_RUNTIME_MARKERS.filter((marker) => !bundleContainsMarker(bundle, marker));
  if (missing.length > 0) {
    throw new Error(`Staged WeChat bundle is missing current runtime markers: ${missing.join(', ')}`);
  }
}

async function publishStagedBuild() {
  await mkdir(finalOutdir, { recursive: true });
  const entries = await readdir(stagingOutdir, { withFileTypes: true });

  // Publish assets and metadata first. game.js is copied last so the runtime entry
  // only switches after every supporting file has been written successfully.
  const orderedNames = entries
    .map((entry) => entry.name)
    .sort((left, right) => {
      const priority = (name) => name === 'game.js' ? 2 : name === 'game.js.map' ? 1 : 0;
      return priority(left) - priority(right);
    });

  for (const name of orderedNames) {
    await cp(join(stagingOutdir, name), join(finalOutdir, name), {
      recursive: true,
      force: true
    });
  }

  console.log(`[racer] published verified WeChat build to ${finalOutdir}`);
}

if (watch) {
  await copyWechatFiles(finalOutdir);
  const ctx = await context(buildOptions(finalOutdir));
  await ctx.watch();
  console.log('Watching WeChat mini game build...');
} else {
  await rm(stagingOutdir, { recursive: true, force: true });

  try {
    await copyWechatFiles(stagingOutdir);
    await build(buildOptions(stagingOutdir));
    await verifyStagedBundle();
    await publishStagedBuild();
  } finally {
    await rm(stagingOutdir, { recursive: true, force: true }).catch(() => {});
  }
}
