import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const requiredFiles = [
  'package.json',
  'project.config.json',
  'src/main.wx.ts',
  'src/engine/index.ts',
  'src/engine/local-lite-game-engine.ts',
  'src/types/lite-game-engine.d.ts',
  'src/scenes/RacerScene.ts',
  'src/racer/RacerAssetManifest.ts',
  'src/racer/RacerAssets.ts',
  'src/racer/RacerJoystick.ts',
  'src/racer/RacerMiniMap.ts',
  'src/racer/RacerServices.ts',
  'src/racer/RacerSettings.ts',
  'src/racer/RacerState.ts',
  'src/racer/RacerTuning.ts',
  'src/racer/RacerUiFlags.ts',
  'src/racer/RacerUiLayout.ts',
  'src/racer/RacerUiRenderer.ts',
  'src/platforms/wechat/startup.ts',
  'src/platforms/wechat/game.json',
  'scripts/build-wechat.mjs',
  'scripts/use-engine-mode.mjs',
  'scripts/validate-assets.mjs',
  'docs/asset-replacement-guide.md',
  'docs/agent-workstreams.md',
  'docs/commercial-ui-ux-plan.md',
  'docs/production-completion-plan.md'
];

const sourceFilesToCheck = [
  'src/platforms/wechat/startup.ts',
  'src/racer/Pseudo3DRenderer.ts',
  'src/racer/RacerAssets.ts',
  'src/racer/RacerSettings.ts',
  'src/racer/RacerStorage.ts',
  'src/racer/RacerUiRenderer.ts',
  'src/racer/RacerMiniMap.ts',
  'src/scenes/RacerScene.ts'
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
const uiRenderer = await read('src/racer/RacerUiRenderer.ts');
const miniMap = await read('src/racer/RacerMiniMap.ts');
const settings = await read('src/racer/RacerSettings.ts');
const state = await read('src/racer/RacerState.ts');
const startup = await read('src/platforms/wechat/startup.ts');
const engineBoundary = await read('src/engine/index.ts');
const localEngine = await read('src/engine/local-lite-game-engine.ts');
const engineModeScript = await read('scripts/use-engine-mode.mjs');
const liteEngineTypes = await read('src/types/lite-game-engine.d.ts');
const uiFlags = await read('src/racer/RacerUiFlags.ts');
const uiLayout = await read('src/racer/RacerUiLayout.ts');
const joystick = await read('src/racer/RacerJoystick.ts');

const warnings = [];
if (manifest.includes('ACTIVE_RACER_ASSET_PACK = LEGACY_RACER_ASSET_PACK')) {
  warnings.push('Runtime still uses legacy asset pack. This is acceptable for migration testing but not final commercial release.');
}
if (services.includes('placeholder')) {
  warnings.push('RacerServices still uses placeholder implementations for ads/share/leaderboard. Replace with a WeChat adapter before launch.');
}
if (engineBoundary.includes('local-lite-game-engine')) {
  warnings.push('Engine boundary currently uses local compatibility mode. Run npm run engine:local to consume ../game-engine.');
}
if (!engineModeScript.includes('file:../game-engine')) {
  missing.push('engine mode script must support local ../game-engine dependency');
}
if (!liteEngineTypes.includes("declare module 'lite-game-engine'") || !liteEngineTypes.includes('export class Engine')) {
  missing.push('local lite-game-engine type fallback declaration');
}
if (!localEngine.includes('this.screen.width * pixelRatio') || !localEngine.includes('ctx.scale(pixelRatio, pixelRatio)')) {
  missing.push('high-DPI local engine canvas scaling');
}
if (!uiFlags.includes('releaseMode: true') || !uiFlags.includes('showAssetStatus: false') || !uiFlags.includes('showControlLabels: false')) {
  missing.push('commercial release UI flags must hide debug and control labels by default');
}
if (!uiFlags.includes('showMiniMap: true') || !uiFlags.includes('showFirstRaceCoach: true')) {
  missing.push('commercial release UI flags must expose minimap and first-race coach toggles');
}
if (!uiLayout.includes('joystickBase') || !uiLayout.includes('brakeButton') || !uiLayout.includes('pauseButton: RacerCircle')) {
  missing.push('publish UI layout must include joystick, brake, and circle pause controls');
}
if (!uiLayout.includes('RacerMiniMapLayout') || !uiLayout.includes('miniMapPreviewBar') || !uiLayout.includes('miniMapProgressBar')) {
  missing.push('independent minimap layout region');
}
if (!uiLayout.includes('helpButton') || !uiLayout.includes('RacerHelpLayout') || !uiLayout.includes('menuButton')) {
  missing.push('commercial onboarding help screen and pause return-menu layout');
}
if (!uiLayout.includes('Math.max(76') || !uiLayout.includes('joystickTouchArea')) {
  missing.push('enlarged joystick layout and touch area');
}
if (!joystick.includes('class RacerJoystick') || !joystick.includes('deadZone = 0.06') || !joystick.includes('* 1.45')) {
  missing.push('sensitive virtual joystick model with reduced dead zone');
}
if (!state.includes('steer: number') || !state.includes('steerDelta = dt * 2.35')) {
  missing.push('analog steering state sensitivity');
}
if (!renderer.includes('RacerUiRenderer') || !renderer.includes('this.ui.render(ctx, state, assets, layout, options)')) {
  missing.push('Pseudo3DRenderer must delegate commercial UI drawing to RacerUiRenderer');
}
if (!uiRenderer.includes('RacerMiniMap') || !uiRenderer.includes('RACER_UI_FLAGS.showMiniMap') || !uiRenderer.includes('this.miniMap.render(ctx, state, layout)')) {
  missing.push('RacerUiRenderer must delegate track radar to independent RacerMiniMap component behind a release flag');
}
if (!miniMap.includes('class RacerMiniMap') || !miniMap.includes('drawCurvePreview') || !miniMap.includes('drawTrafficDots') || !miniMap.includes('赛道雷达')) {
  missing.push('independent minimap component with curve preview and traffic dots');
}
if (!uiRenderer.includes('RACER_UI_FLAGS') || !uiRenderer.includes('showAssetStatus') || !uiRenderer.includes('极速公路')) {
  missing.push('RacerUiRenderer must use release UI flags and commercial menu copy');
}
if (!uiRenderer.includes('RacerUiPressedTarget') || !uiRenderer.includes('pressedTarget ===') || !scene.includes('executePressedTarget')) {
  missing.push('polished UI press-state confirmation flow');
}
if (!uiRenderer.includes('drawControlCoach') || !uiRenderer.includes('操作说明') || !scene.includes('CONTROL_COACH_SECONDS')) {
  missing.push('first-race control coach and help overlay flow');
}
if (!settings.includes('hasShownFirstRaceCoach') || !settings.includes('FIRST_RACE_COACH_SHOWN_KEY') || !scene.includes('setFirstRaceCoachShown(true)')) {
  missing.push('persistent first-race control coach state');
}
if (!scene.includes('returnToMenu') || !scene.includes('paused-menu') || !uiRenderer.includes('返回菜单')) {
  missing.push('pause return-to-menu interaction');
}
if (!uiRenderer.includes('drawVignette') || !uiRenderer.includes('raceGrade') || !uiRenderer.includes('rgba(255, 207, 74, 0.12)')) {
  missing.push('polished modal hierarchy, primary button glow, and result rating');
}
if (!renderer.includes('ctx.imageSmoothingEnabled = false') || !renderer.includes('drawImage(image')) {
  missing.push('crisp pixel-art rendering with smoothing disabled');
}
if (!uiRenderer.includes('drawModalPanel') || !uiRenderer.includes('primary = false')) {
  missing.push('polished modal panel and primary button styling');
}
if (!renderer.includes('drawPlayerFallback') || !renderer.includes('drawPlayerVisibilityMarker') || !renderer.includes('state.height - carH - 24')) {
  missing.push('always-visible player car fallback and visibility marker');
}
if (!renderer.includes('this.drawPlayer(ctx, state, assets?.sprites ?? null, playerSegment, playerPercent)')) {
  missing.push('stable player car drawing outside segment projection clipping');
}
if (!scene.includes('TARGET_LAPS')) {
  missing.push('RacerScene TARGET_LAPS race completion flow');
}
if (!scene.includes('toggleAudio')) {
  missing.push('RacerScene audio toggle flow');
}
if (!scene.includes('RacerJoystick') || !scene.includes('findJoystickTouch') || !scene.includes('brakeActive')) {
  missing.push('RacerScene joystick and brake input flow');
}
if (!uiRenderer.includes('drawJoystick') || !uiRenderer.includes('drawBrakeButton') || !uiRenderer.includes('drawPauseButton')) {
  missing.push('RacerUiRenderer publish controls: joystick, brake, pause');
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

for (const file of sourceFilesToCheck) {
  const content = await read(file);
  if (content.includes("from 'lite-game-engine'") || content.includes('from "lite-game-engine"')) {
    missing.push(`${file} still imports lite-game-engine directly; use src/engine boundary instead`);
  }
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
