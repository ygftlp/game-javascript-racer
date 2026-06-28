import { build, context } from 'esbuild';
import { mkdir, copyFile, cp, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const outdir = resolve('dist/wechat');
const outfile = resolve(outdir, 'game.js');
const gameJsonSource = resolve('src/platforms/wechat/game.json');
const gameJsonTarget = resolve(outdir, 'game.json');

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

async function copyWechatFiles() {
  await mkdir(dirname(gameJsonTarget), { recursive: true });
  await copyFile(gameJsonSource, gameJsonTarget);
  await copyDirIfExists(resolve('images'), resolve(outdir, 'images'));
  await copyDirIfExists(resolve('music'), resolve(outdir, 'music'));
  await copyDirIfExists(resolve('assets'), resolve(outdir, 'assets'));
}

const options = {
  entryPoints: ['src/main.wx.ts'],
  bundle: true,
  format: 'iife',
  platform: 'neutral',
  target: 'es2019',
  outfile,
  sourcemap: true,
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

await copyWechatFiles();

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching WeChat mini game build...');
} else {
  await build(options);
}
