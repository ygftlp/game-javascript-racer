import { mkdir, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const outdir = resolve('dist/wechat');
const RETRYABLE_CODES = new Set(['EBUSY', 'EPERM', 'ENOTEMPTY']);

function isRetryable(error) {
  return error && typeof error === 'object' && RETRYABLE_CODES.has(error.code);
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function removeEntry(path) {
  const attempts = 8;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rm(path, {
        recursive: true,
        force: true,
        maxRetries: 2,
        retryDelay: 120
      });
      return;
    } catch (error) {
      if (!isRetryable(error) || attempt === attempts) throw error;
      await delay(120 * attempt);
    }
  }
}

try {
  await rm(outdir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 150
  });
  console.log(`[racer] cleaned ${outdir}`);
} catch (error) {
  if (!isRetryable(error)) throw error;

  // WeChat Developer Tools may keep the output directory itself open on
  // Windows. Its contents can still be removed safely, so retain the root
  // directory and clear every generated entry instead of failing on rmdir.
  console.warn(`[racer] output directory is locked; clearing its contents instead (${error.code})`);
  await mkdir(outdir, { recursive: true });

  const entries = await readdir(outdir, { withFileTypes: true });
  for (const entry of entries) {
    await removeEntry(join(outdir, entry.name));
  }

  console.log(`[racer] cleaned contents of ${outdir}; directory retained because it is in use`);
}
