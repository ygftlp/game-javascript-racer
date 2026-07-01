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
  'src/racer/config.ts',
  'src/racer/Pseudo3DRenderer.ts',
  'src/racer/RacerAssetManifest.ts',
  'src/racer/RacerAssets.ts',
  'src/racer/RacerControlSensitivity.ts',
  'src/racer/RacerJoystick.ts',
  'src/racer/RacerMiniMap.ts',
  'src/racer/RacerRoadTheme.ts',
  'src/racer/RacerServices.ts',
  'src/racer/RacerSettings.ts',
  'src/racer/RacerState.ts',
  'src/racer/RacerStorage.ts',
  'src/racer/RacerTrackDefinition.ts',
  'src/racer/RacerTuning.ts',
  'src/racer/RacerUiFlags.ts',
  'src/racer/RacerUiIconAtlas.ts',
  'src/racer/RacerUiIcons.ts',
  'src/racer/RacerUiLogo.ts',
  'src/racer/RacerUiLayout.ts',
  'src/racer/RacerUiRenderer.ts',
  'src/racer/RacerUiTheme.ts',
  'src/racer/RacerWechatConfig.ts',
  'src/racer/RacerWechatServices.ts',
  'src/platforms/wechat/startup.ts',
  'src/platforms/wechat/game.json',
  'scripts/build-wechat.mjs',
  'scripts/use-engine-mode.mjs',
  'scripts/use-commercial-assets.mjs',
  'scripts/validate-assets.mjs',
  'docs/asset-replacement-guide.md',
  'docs/agent-workstreams.md',
  'docs/commercial-ui-ux-plan.md',
  'docs/local-setup-wechat.md',
  'docs/production-completion-plan.md',
  'docs/road-replacement-guide.md',
  'docs/ui-polish-agent-sync.md',
  'docs/wechat-deployment-guide.md'
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

function requireTokens(content, tokens, message, missing) {
  for (const token of tokens) {
    if (!content.includes(token)) missing.push(`${message}: missing ${token}`);
  }
}

const missing = [];
for (const file of requiredFiles) {
  if (!(await exists(file))) missing.push(file);
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(async (file) => [file, await read(file)])));
const packageJson = files['package.json'];
const manifest = files['src/racer/RacerAssetManifest.ts'];
const assets = files['src/racer/RacerAssets.ts'];
const services = files['src/racer/RacerServices.ts'];
const wechatConfig = files['src/racer/RacerWechatConfig.ts'];
const wechatServices = files['src/racer/RacerWechatServices.ts'];
const scene = files['src/scenes/RacerScene.ts'];
const renderer = files['src/racer/Pseudo3DRenderer.ts'];
const roadTheme = files['src/racer/RacerRoadTheme.ts'];
const trackDefinition = files['src/racer/RacerTrackDefinition.ts'];
const controlSensitivity = files['src/racer/RacerControlSensitivity.ts'];
const config = files['src/racer/config.ts'];
const uiIconAtlas = files['src/racer/RacerUiIconAtlas.ts'];
const uiIcons = files['src/racer/RacerUiIcons.ts'];
const uiLogo = files['src/racer/RacerUiLogo.ts'];
const uiRenderer = files['src/racer/RacerUiRenderer.ts'];
const uiTheme = files['src/racer/RacerUiTheme.ts'];
const miniMap = files['src/racer/RacerMiniMap.ts'];
const settings = files['src/racer/RacerSettings.ts'];
const state = files['src/racer/RacerState.ts'];
const storage = files['src/racer/RacerStorage.ts'];
const startup = files['src/platforms/wechat/startup.ts'];
const engineBoundary = files['src/engine/index.ts'];
const localEngine = files['src/engine/local-lite-game-engine.ts'];
const engineModeScript = files['scripts/use-engine-mode.mjs'];
const commercialAssetScript = files['scripts/use-commercial-assets.mjs'];
const liteEngineTypes = files['src/types/lite-game-engine.d.ts'];
const uiFlags = files['src/racer/RacerUiFlags.ts'];
const uiLayout = files['src/racer/RacerUiLayout.ts'];
const joystick = files['src/racer/RacerJoystick.ts'];
const localSetupGuide = files['docs/local-setup-wechat.md'];
const roadGuide = files['docs/road-replacement-guide.md'];
const assetGuide = files['docs/asset-replacement-guide.md'];
const productionPlan = files['docs/production-completion-plan.md'];
const uiAgentSync = files['docs/ui-polish-agent-sync.md'];
const deploymentGuide = files['docs/wechat-deployment-guide.md'];

const warnings = [];
if (manifest.includes('ACTIVE_RACER_ASSET_PACK = LEGACY_RACER_ASSET_PACK')) {
  warnings.push('Runtime still uses legacy asset pack. This is acceptable for migration testing but not final commercial release.');
}
if (services.includes('fallback')) {
  warnings.push('RacerServices can fall back to noop services outside WeChat. Verify real WeChat share, leaderboard, and ads before release.');
}
if (engineBoundary.includes('local-lite-game-engine')) {
  warnings.push('Engine boundary currently uses local compatibility mode. Run npm run engine:local to consume ../game-engine.');
}

requireTokens(packageJson, ['assets:commercial', 'assets:commercial:apply', 'assets:legacy:apply'], 'package.json safe commercial asset scripts', missing);
requireTokens(commercialAssetScript, ['requiredCommercialFiles', 'optionalCommercialFiles', 'COMMERCIAL_TEMPLATE_ASSET_PACK', 'LEGACY_RACER_ASSET_PACK', 'Commercial asset switch blocked', 'Dry run only', 'process.exit(1)'], 'safe commercial asset switch script', missing);
requireTokens(engineModeScript, ['file:../game-engine'], 'engine mode script must support local ../game-engine dependency', missing);
requireTokens(liteEngineTypes, ["declare module 'lite-game-engine'", 'export class Engine'], 'local lite-game-engine type fallback declaration', missing);
requireTokens(localEngine, ['this.screen.width * pixelRatio', 'ctx.scale(pixelRatio, pixelRatio)'], 'high-DPI local engine canvas scaling', missing);
requireTokens(uiFlags, ['releaseMode: true', 'showAssetStatus: false', 'showControlLabels: false', 'showMiniMap: true', 'showFirstRaceCoach: true'], 'commercial release UI flags', missing);

requireTokens(services, [
  'RACER_WECHAT_SERVICES_CONFIG',
  'RacerLeaderboardViewContext',
  'showLeaderboard(context?: RacerLeaderboardViewContext)',
  'createWechatRacerServices(config) ?? createNoopRacerServices()'
], 'RacerServices WeChat adapter with isolated config and noop fallback', missing);

requireTokens(wechatConfig, [
  'RACER_WECHAT_SERVICES_CONFIG',
  'titlePrefix',
  'openDataContextCommand',
  'cloudFunctionName',
  'interstitialAdUnitId',
  'rewardedAdUnitId',
  'enableConsoleAnalytics',
  'Do not commit production-only secrets'
], 'isolated WeChat services configuration template', missing);

requireTokens(wechatServices, [
  'RACER_WECHAT_SERVICES_CONFIG',
  'createWechatRacerServices',
  'resolveWechatApi',
  'globalThis',
  'WechatSocialService',
  'shareAppMessage',
  'WechatLeaderboardService',
  'getOpenDataContext',
  'postMessage',
  'submitRacerScore',
  'showRacerLeaderboard',
  'cloudFunctionName',
  'callFunction',
  'WechatAdsService',
  'createInterstitialAd',
  'createRewardedVideoAd',
  'showInterstitial',
  'showRewarded',
  'reportAnalytics',
  'enableConsoleAnalytics',
  'context'
], 'WeChat services adapter skeleton', missing);

requireTokens(manifest, ['brandLogo?: string', 'uiIconAtlas?: string', "id: 'ui.brand-logo'", "id: 'ui.icons'", 'assets/packs/default/images/ui/logo.png', 'assets/packs/default/images/ui/icons.png', 'ACTIVE_RACER_ASSET_PACK'], 'optional logo and UI icon asset manifest', missing);
requireTokens(assets, ['import { RacerUiIcons }', 'brandLogo: Texture | null = null', 'uiIcons: Texture | null = null', 'loadOptionalBrandLogo(engine)', 'loadOptionalUiIconAtlas(engine)', 'RacerUiIcons.setIconAtlasTexture(texture)', 'using procedural logo fallback', 'using procedural icon fallback'], 'optional logo and UI icon atlas asset loading', missing);
requireTokens(uiIconAtlas, ['RACER_UI_ICON_ATLAS_CELL_SIZE', 'RACER_UI_ICON_ATLAS', 'play: { x: 0, y: 0', 'track: { x: 64, y: 0', 'share: { x: 192, y: 128'], 'UI icon atlas grid mapping', missing);
requireTokens(uiIcons, ['private static iconAtlasTexture', 'setIconAtlasTexture(texture: Texture | null)', 'drawTextureIcon', 'RACER_UI_ICON_ATLAS', 'ctx.drawImage(image', 'using procedural icon fallback', "| 'play'", "| 'share'", 'roundedRectPath'], 'commercial UI icon atlas renderer with programmatic fallback', missing);
requireTokens(uiLogo, ['texture?: Texture | null', 'drawTextureLogo', 'texture?.loaded', 'ctx.drawImage(image', 'using procedural fallback', 'RACER_UI_THEME.brandLogo', 'roundedRectPath'], 'programmatic brand logo renderer with texture fallback', missing);
if (uiIcons.includes('roundRect(') || uiIcons.includes('.roundRect')) missing.push('RacerUiIcons must avoid Canvas roundRect dependency for WeChat compatibility');
if (uiLogo.includes('roundRect(') || uiLogo.includes('.roundRect')) missing.push('RacerUiLogo must avoid Canvas roundRect dependency for WeChat compatibility');

if (!config.includes("from './RacerTrackDefinition'") || config.includes('const TRACK_SECTIONS: TrackSection[] = [')) {
  missing.push('config.ts must re-export track definitions without owning track section data');
}
requireTokens(roadTheme, ['COMMERCIAL_ASPHALT_ROAD_THEME', 'LEGACY_GREEN_ROAD_THEME', 'roadColorForSegment'], 'commercial road theme', missing);
requireTokens(trackDefinition, ['RacerTrackDefinition', 'DEFAULT_OUTRUN_TRACK', 'COAST_SPRINT_TRACK', 'CITY_NIGHT_TRACK', 'RACER_TRACKS', 'findRacerTrackById', 'getNextRacerTrack', 'racerTrackIndex'], 'multi-track registry', missing);
requireTokens(controlSensitivity, ['RacerControlSensitivityId', 'RACER_CONTROL_SENSITIVITY_PROFILES', "id: 'comfort'", "id: 'standard'", "id: 'sensitive'", 'joystickGain', 'steerInputLimit', 'steerResponse', 'findRacerControlSensitivity', 'nextRacerControlSensitivity'], 'control sensitivity profiles', missing);
requireTokens(state, ['private track: RacerTrackDefinition', 'setTrack(track: RacerTrackDefinition', 'for (const section of this.track.sections)', 'roadColorForSegment(index, this.track.roadTheme)', 'steer: number', 'private controlSensitivity', 'setControlSensitivity(profile: RacerControlSensitivityProfile)'], 'RacerState track/runtime/control sensitivity state', missing);
requireTokens(settings, ['SELECTED_TRACK_ID_KEY', 'getSelectedTrackId', 'setSelectedTrackId', 'MINI_MAP_ENABLED_KEY', 'CONTROL_COACH_ENABLED_KEY', 'CONTROL_SENSITIVITY_KEY', 'getControlSensitivityId', 'setControlSensitivityId'], 'RacerSettings persisted settings', missing);
requireTokens(storage, ['bestLapKey(trackId', 'getBestLapTime(trackId', 'setBestLapTime(seconds: number, trackId'], 'RacerStorage per-track best lap', missing);
requireTokens(scene, ['tracks: RACER_TRACKS', 'selectedTrackId: this.activeTrack.id', 'trackName: this.activeTrack.name', 'this.state.completedLaps >= this.targetLaps', 'targetLaps: this.targetLaps', '(touches: TouchPoint[] = [])', 'controlSensitivityLabel: this.controlSensitivity.label', "this.phase = 'trackSelect'", "this.phase = 'settings'", 'this.services.leaderboard.showLeaderboard(context)'], 'RacerScene selected track, settings, leaderboard context, and target-lap flow', missing);
if (scene.includes('const TARGET_LAPS')) missing.push('RacerScene must not hardcode TARGET_LAPS');
if (scene.includes('cycleTrack()')) missing.push('RacerScene should use dedicated track selection screen instead of cycleTrack');
requireTokens(renderer, ['RacerUiRenderer', 'this.ui.render(ctx, state, assets, layout, options)', 'state.activeTrack.roadTheme.fog', 'ctx.imageSmoothingEnabled = false', 'drawImage(image', 'drawPlayerFallback'], 'Pseudo3DRenderer world/UI integration', missing);
requireTokens(uiTheme, ['RACER_UI_THEME', 'brandLogo', 'imageMaxWidth', 'buttonIcon', 'trackCard', 'settingCard', 'statusPill', 'icon', 'accent', 'minimap', 'controls'], 'centralized UI theme tokens', missing);
requireTokens(uiLayout, ['RacerMiniMapLayout', 'RacerTrackSelectLayout', 'RacerSettingsLayout', 'miniMapButton', 'coachButton', 'sensitivityButton', 'resetCoachButton', 'joystickTouchArea'], 'RacerUiLayout publish layout, track select, and settings card layout', missing);
requireTokens(joystick, ['class RacerJoystick', 'deadZone = 0.06', 'profile.joystickGain', 'profile.steerInputLimit'], 'configurable virtual joystick model', missing);
requireTokens(uiRenderer, ['RacerMiniMap', 'RacerUiIcons', 'RacerUiLogo', 'this.logo.render(ctx', 'texture: assets?.brandLogo ?? null', 'RETRO RACER', 'drawTrackSelect', 'drawSettings', 'this.icons.render(ctx, icon', '选择赛道', '设置', '控制手感'], 'RacerUiRenderer commercial UI, optional logo asset, icon atlas fallback, track select, settings cards, and sensitivity display', missing);
requireTokens(miniMap, ['class RacerMiniMap', 'drawCurvePreview', 'drawTrafficDots', '赛道雷达', 'RACER_UI_THEME'], 'independent minimap component', missing);
requireTokens(startup, ['startWeChatRacerGame', 'new WxPlatform', 'onHide', 'onShow'], 'WeChat startup module lifecycle binding', missing);
requireTokens(roadGuide, ['RACER_TRACKS', '选择赛道', 'selected track id', 'per track id', 'Level 5: Add textured road support'], 'road replacement guide track registry and persistence docs', missing);
requireTokens(assetGuide, ['npm run assets:commercial', 'npm run assets:commercial:apply', 'npm run assets:legacy:apply', 'required files', 'assets/packs/default/images/ui/logo.png', 'assets/packs/default/images/ui/icons.png', 'programmatic icon'], 'asset replacement guide safe switch and optional UI asset docs', missing);
requireTokens(localSetupGuide, ['docs/wechat-deployment-guide.md', 'npm run assets:commercial', 'npm run assets:commercial:apply', 'npm run validate:production', 'npm run build:wx'], 'local setup guide deployment handoff', missing);
requireTokens(deploymentGuide, ['WeChat Deployment Guide', 'RacerWechatConfig.ts', 'npm run assets:commercial', 'npm run assets:commercial:apply', 'npm run validate:production', 'npm run build:wx', 'npm run assets:legacy:apply', 'COMMERCIAL_TEMPLATE_ASSET_PACK', 'dist/wechat/', 'wx.shareAppMessage', 'getOpenDataContext', 'createInterstitialAd', 'createRewardedVideoAd', 'Do not commit production-only secrets'], 'WeChat deployment guide release checklist and commercial asset switch flow', missing);
requireTokens(productionPlan, ['safe commercial asset pack switch script', 'WeChat services adapter skeleton', 'RacerWechatConfig.ts', 'wechat-deployment-guide.md', 'shareAppMessage', 'getOpenDataContext', 'createInterstitialAd', 'createRewardedVideoAd', 'assets:commercial:apply', 'optional commercial UI icon atlas', '舒适', '标准', '灵敏'], 'production completion plan WeChat services, safe switch, deployment guide, and UI docs', missing);
requireTokens(uiAgentSync, ['WeChat services adapter skeleton', 'RacerWechatConfig.ts', 'wechat-deployment-guide.md', 'shareAppMessage', 'getOpenDataContext', 'createInterstitialAd', 'createRewardedVideoAd', 'safe commercial asset pack switch flow', 'optional commercial UI icon atlas', '舒适', '标准', '灵敏'], 'UI polish multi-agent sync WeChat services, config, deployment guide, and UI docs', missing);

for (const file of sourceFilesToCheck) {
  const content = files[file];
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
