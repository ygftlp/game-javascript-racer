import { build, context } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const outdir = resolve('dist/wechat');
const outfile = resolve(outdir, 'game.js');
const gameJsonSource = resolve('src/platforms/wechat/game.json');
const gameJsonTarget = resolve(outdir, 'game.json');

async function copyWechatManifest() {
  await mkdir(dirname(gameJsonTarget), { recursive: true });
  await copyFile(gameJsonSource, gameJsonTarget);
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

await copyWechatManifest();

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching WeChat mini game build...');
} else {
  await build(options);
}
