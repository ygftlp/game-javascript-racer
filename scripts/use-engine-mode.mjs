import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const mode = process.argv[2];
const engineIndexPath = resolve('src/engine/index.ts');
const packagePath = resolve('package.json');

const MODES = new Set(['compat', 'local-sdk']);

if (!MODES.has(mode)) {
  console.error('Usage: node scripts/use-engine-mode.mjs <compat|local-sdk>');
  process.exit(1);
}

function dependencyForMode(nextMode) {
  if (nextMode === 'local-sdk') return { 'lite-game-engine': 'file:../game-engine' };
  return {};
}

function engineIndexForMode(nextMode) {
  if (nextMode === 'local-sdk') {
    return "export * from 'lite-game-engine';\n";
  }
  return "export * from './local-lite-game-engine';\n";
}

const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
packageJson.dependencies = dependencyForMode(mode);

await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
await writeFile(engineIndexPath, engineIndexForMode(mode), 'utf8');

console.log(`Engine mode switched to ${mode}.`);
if (mode === 'local-sdk') {
  console.log('Before installing/building this project, build the local engine at ../game-engine.');
}
