import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packId = process.argv[2] || 'default';
const packRoot = resolve('assets/packs', packId);
const manifestPath = resolve(packRoot, 'manifest.json');

function normalizeAssetPath(path) {
  return path.startsWith('assets/packs/') ? resolve(path) : resolve(path);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readManifest() {
  const raw = await readFile(manifestPath, 'utf8');
  return JSON.parse(raw);
}

function collectRequiredAssets(manifest) {
  const assets = [];

  if (manifest.images?.backgroundAtlas) assets.push({ type: 'image', key: 'backgroundAtlas', path: manifest.images.backgroundAtlas, required: true });
  if (manifest.images?.spriteAtlas) assets.push({ type: 'image', key: 'spriteAtlas', path: manifest.images.spriteAtlas, required: true });
  if (manifest.audio?.music) assets.push({ type: 'audio', key: 'music', path: manifest.audio.music, required: false });
  if (manifest.audio?.engineLoop) assets.push({ type: 'audio', key: 'engineLoop', path: manifest.audio.engineLoop, required: false });
  if (manifest.audio?.crash) assets.push({ type: 'audio', key: 'crash', path: manifest.audio.crash, required: false });
  if (manifest.audio?.menuConfirm) assets.push({ type: 'audio', key: 'menuConfirm', path: manifest.audio.menuConfirm, required: false });

  return assets;
}

const manifest = await readManifest();
const assets = collectRequiredAssets(manifest);
const missingRequired = [];
const missingOptional = [];

for (const asset of assets) {
  const assetPath = normalizeAssetPath(asset.path);
  if (!(await exists(assetPath))) {
    if (asset.required) missingRequired.push(asset);
    else missingOptional.push(asset);
  }
}

console.log(`Asset pack: ${manifest.id || packId} (${manifest.label || 'unnamed'})`);
console.log(`Commercial safe: ${Boolean(manifest.commercialSafe)}`);
console.log(`Checked ${assets.length} asset path(s).`);

if (missingOptional.length) {
  console.warn('Optional assets missing:');
  for (const asset of missingOptional) {
    console.warn(`- ${asset.type}.${asset.key}: ${asset.path}`);
  }
}

if (missingRequired.length) {
  console.error('Required assets missing:');
  for (const asset of missingRequired) {
    console.error(`- ${asset.type}.${asset.key}: ${asset.path}`);
  }
  process.exit(1);
}

console.log('Asset validation passed.');
