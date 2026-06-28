import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const requiredFiles = [
  'package.json',
  'project.config.json',
  'src/main.wx.ts',
  'src/scenes/RacerScene.ts',
  'src/racer/RacerAssetManifest.ts',
  'src/racer/RacerAssets.ts',
  'src/racer/RacerServices.ts',
  'src/racer/RacerSettings.ts',
  'src/racer/RacerState.ts',
  'src/racer/RacerTuning.ts',
  'src/racer/RacerUiLayout.ts',
  'src/platforms/wechat/startup.ts',
  'src/platforms/wechat/game.json',
  'scripts/build-wechat.mjs',
  'scripts/validate-assets.mjs',
  'docs/asset-replacement-guide.md',
  'docs/agent-workstreams.md',
  'docs/production-completion-plan.md'
];

async function exists(path) {
  try {
    await access(resolve(path));
    return true;
  } catch {
    return false;
  }
}

async function read(path) {
  return readFile(resolve(path), 'utf8');
}

const missing = [];
for (const file of requiredFiles) {
  if (!(await exists(file))) missing.push(file);
}

const manifest = await read('src/racer/RacerAssetManifest.ts');
const services = await read('src/racer/RacerServices.ts');
const scene = await read('src/scenes/RacerScene.ts');
const renderer = await read('src/racer/Pseudo3DRenderer.ts');
const startup = await read('src/platforms/wechat/startup.ts');

const warnings = [];
if (manifest.includes('ACTIVE_RACER_ASSET_PACK = LEGACY_RACER_ASSET_PACK')) {
  warnings.push('Runtime still uses legacy asset pack. This is acceptable for migration testing but not final commercial release.');
}
if (services.includes('placeholder')) {
  warnings.push('RacerServices still uses placeholder implementations for ads/share/leaderboard. Replace with a WeChat adapter before launch.');
}
if (!scene.includes('TARGET_LAPS')) {
  missing.push('RacerScene TARGET_LAPS race completion flow');
}
if (!scene.includes('toggleAudio')) {
  missing.push('RacerScene audio toggle flow');
}
if (!scene.includes('handleAppHidden') || !scene.includes('handleAppShown')) {
  missing.push('RacerScene app lifecycle pause hooks');
}
if (!scene.includes('buildRacerUiLayout') || !renderer.includes('buildRacerUiLayout')) {
  missing.push('shared RacerUiLayout usage in scene and renderer');
}
if (!startup.includes('startWeChatRacerGame') || !startup.includes('new WxPlatform')) {
  missing.push('WeChat startup module must create Engine + WxPlatform');
}
if (!startup.includes('onHide') || !startup.includes('onShow')) {
  missing.push('WeChat startup module lifecycle binding');
}

if (warnings.length) {
  console.warn('Production warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (missing.length) {
  console.error('Production validation failed. Missing or incomplete:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Production structure validation passed. Review warnings before release.');
