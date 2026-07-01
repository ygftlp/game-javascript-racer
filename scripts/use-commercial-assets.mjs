import { access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const apply = process.argv.includes('--apply');
const revert = process.argv.includes('--legacy');
const manifestPath = resolve('src/racer/RacerAssetManifest.ts');

const requiredCommercialFiles = [
  'assets/packs/default/images/background.png',
  'assets/packs/default/images/sprites.png',
  'assets/packs/default/audio/music/racer.mp3'
];

const optionalCommercialFiles = [
  'assets/packs/default/images/ui/logo.png',
  'assets/packs/default/images/ui/icons.png',
  'assets/packs/default/audio/sfx/engine-loop.mp3',
  'assets/packs/default/audio/sfx/crash.mp3',
  'assets/packs/default/audio/sfx/menu-confirm.mp3'
];

async function exists(path) {
  try {
    await access(resolve(path), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectMissing(paths) {
  const missing = [];
  for (const path of paths) {
    if (!(await exists(path))) missing.push(path);
  }
  return missing;
}

function switchActivePack(source, target) {
  const legacyLine = 'export const ACTIVE_RACER_ASSET_PACK = LEGACY_RACER_ASSET_PACK;';
  const commercialLine = 'export const ACTIVE_RACER_ASSET_PACK = COMMERCIAL_TEMPLATE_ASSET_PACK;';

  if (target === 'legacy') {
    if (source.includes(legacyLine)) return source;
    if (!source.includes(commercialLine)) {
      throw new Error('Cannot find ACTIVE_RACER_ASSET_PACK assignment to switch back to legacy.');
    }
    return source.replace(commercialLine, legacyLine);
  }

  if (source.includes(commercialLine)) return source;
  if (!source.includes(legacyLine)) {
    throw new Error('Cannot find ACTIVE_RACER_ASSET_PACK assignment to switch to commercial-template.');
  }
  return source.replace(legacyLine, commercialLine);
}

function printList(title, paths) {
  console.log(title);
  if (!paths.length) {
    console.log('  - none');
    return;
  }
  for (const path of paths) console.log(`  - ${path}`);
}

async function main() {
  const requiredMissing = await collectMissing(requiredCommercialFiles);
  const optionalMissing = await collectMissing(optionalCommercialFiles);

  printList('Required commercial files:', requiredCommercialFiles);
  printList('Optional commercial files:', optionalCommercialFiles);

  if (revert) {
    if (!apply) {
      console.log('\nDry run only. Add --apply to switch ACTIVE_RACER_ASSET_PACK back to legacy.');
      return;
    }
    const source = await readFile(manifestPath, 'utf8');
    await writeFile(manifestPath, switchActivePack(source, 'legacy'));
    console.log('\nSwitched ACTIVE_RACER_ASSET_PACK back to LEGACY_RACER_ASSET_PACK.');
    return;
  }

  if (requiredMissing.length) {
    console.error('\nCommercial asset switch blocked. Missing required files:');
    for (const path of requiredMissing) console.error(`  - ${path}`);
    console.error('\nAdd the required files first, then rerun: npm run assets:commercial:apply');
    process.exit(1);
  }

  if (optionalMissing.length) {
    console.warn('\nOptional commercial files are missing. Runtime fallbacks will be used:');
    for (const path of optionalMissing) console.warn(`  - ${path}`);
  }

  if (!apply) {
    console.log('\nCommercial asset prerequisites passed. Dry run only.');
    console.log('Run npm run assets:commercial:apply to switch ACTIVE_RACER_ASSET_PACK to COMMERCIAL_TEMPLATE_ASSET_PACK.');
    return;
  }

  const source = await readFile(manifestPath, 'utf8');
  await writeFile(manifestPath, switchActivePack(source, 'commercial-template'));
  console.log('\nSwitched ACTIVE_RACER_ASSET_PACK to COMMERCIAL_TEMPLATE_ASSET_PACK.');
  console.log('Next: npm run validate:production && npm run build:wx');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
