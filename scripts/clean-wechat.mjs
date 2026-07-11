import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const outdir = resolve('dist/wechat');
await rm(outdir, { recursive: true, force: true });
console.log(`[racer] cleaned ${outdir}`);
