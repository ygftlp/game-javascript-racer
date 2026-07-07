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
  'docs/commercialization-agent-workstreams.md',
  'docs/commercialization-art-audio-brief.md',
  'docs/commercialization-asset-rights-register.md',
  'docs/commercialization-launch-checklist.md',
  'docs/commercialization-plan.md',
  'docs/commercialization-risk-register.md',
  'docs/commercialization-roadmap.md',
  'docs/local-setup-wechat.md',
  'docs/open-data-leaderboard-protocol.md',
  'docs/production-completion-plan.md',
  'docs/road-replacement-guide.md',
  'docs/samples/open-data-leaderboard-handler.js',
  'docs/samples/open-data-leaderboard-canvas.js',
  'docs/ui-polish-agent-sync.md',
  'docs/wechat-deployment-guide.md',
  'docs/agent-tasks/commercialization-director.md',
  'docs/agent-tasks/licensing-compliance.md',
  'docs/agent-tasks/monetization-strategy.md',
  'docs/agent-tasks/growth-publishing.md',
  'docs/agent-tasks/liveops-analytics.md'
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
const services = files['src/racer/RacerServices.ts'];
const wechatConfig = files['src/racer/RacerWechatConfig.ts'];
const wechatServices = files['src/racer/RacerWechatServices.ts'];
const scene = files['src/scenes/RacerScene.ts'];
const renderer = files['src/racer/Pseudo3DRenderer.ts'];
const trackDefinition = files['src/racer/RacerTrackDefinition.ts'];
const controlSensitivity = files['src/racer/RacerControlSensitivity.ts'];
const config = files['src/racer/config.ts'];
const assets = files['src/racer/RacerAssets.ts'];
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
const openDataProtocol = files['docs/open-data-leaderboard-protocol.md'];
const openDataHandler = files['docs/samples/open-data-leaderboard-handler.js'];
const openDataCanvas = files['docs/samples/open-data-leaderboard-canvas.js'];
const assetGuide = files['docs/asset-replacement-guide.md'];
const deploymentGuide = files['docs/wechat-deployment-guide.md'];
const productionPlan = files['docs/production-completion-plan.md'];
const commercialPlan = files['docs/commercialization-plan.md'];
const commercialWorkstreams = files['docs/commercialization-agent-workstreams.md'];
const commercialArtAudioBrief = files['docs/commercialization-art-audio-brief.md'];
const commercialAssetRights = files['docs/commercialization-asset-rights-register.md'];
const commercialRoadmap = files['docs/commercialization-roadmap.md'];
const commercialRisks = files['docs/commercialization-risk-register.md'];
const commercialChecklist = files['docs/commercialization-launch-checklist.md'];

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

requireTokens(packageJson, ['assets:commercial', 'assets:commercial:apply', 'assets:legacy:apply', 'validate:production', 'build:wx'], 'package.json release scripts', missing);
requireTokens(commercialAssetScript, ['requiredCommercialFiles', 'optionalCommercialFiles', 'COMMERCIAL_TEMPLATE_ASSET_PACK', 'LEGACY_RACER_ASSET_PACK', 'Commercial asset switch blocked', 'Dry run only', 'process.exit(1)'], 'safe commercial asset switch script', missing);
requireTokens(engineModeScript, ['file:../game-engine'], 'engine mode script must support local ../game-engine dependency', missing);
requireTokens(liteEngineTypes, ["declare module 'lite-game-engine'", 'export class Engine'], 'local lite-game-engine type fallback declaration', missing);
requireTokens(localEngine, ['this.screen.width * pixelRatio', 'ctx.scale(pixelRatio, pixelRatio)'], 'high-DPI local engine canvas scaling', missing);
requireTokens(uiFlags, ['releaseMode: true', 'showAssetStatus: false', 'showControlLabels: false', 'showMiniMap: true', 'showFirstRaceCoach: true'], 'commercial release UI flags', missing);

requireTokens(manifest, ['brandLogo?: string', 'uiIconAtlas?: string', "id: 'ui.brand-logo'", "id: 'ui.icons'", 'assets/packs/default/images/ui/logo.png', 'assets/packs/default/images/ui/icons.png', 'ACTIVE_RACER_ASSET_PACK'], 'optional logo and UI icon asset manifest', missing);
requireTokens(assets, ['brandLogo: Texture | null = null', 'uiIcons: Texture | null = null', 'loadOptionalBrandLogo(engine)', 'loadOptionalUiIconAtlas(engine)', 'RacerUiIcons.setIconAtlasTexture(texture)', 'using procedural logo fallback', 'using procedural icon fallback'], 'optional logo and UI icon atlas asset loading', missing);
requireTokens(uiIcons, ['setIconAtlasTexture(texture: Texture | null)', 'drawTextureIcon', 'RACER_UI_ICON_ATLAS', 'ctx.drawImage(image', 'using procedural icon fallback', 'roundedRectPath'], 'commercial UI icon atlas renderer with fallback', missing);
requireTokens(uiLogo, ['drawTextureLogo', 'texture?.loaded', 'ctx.drawImage(image', 'using procedural fallback', 'RACER_UI_THEME.brandLogo', 'roundedRectPath'], 'programmatic brand logo renderer with texture fallback', missing);
if (uiIcons.includes('roundRect(') || uiIcons.includes('.roundRect')) missing.push('RacerUiIcons must avoid Canvas roundRect dependency for WeChat compatibility');
if (uiLogo.includes('roundRect(') || uiLogo.includes('.roundRect')) missing.push('RacerUiLogo must avoid Canvas roundRect dependency for WeChat compatibility');

requireTokens(services, ['RACER_WECHAT_SERVICES_CONFIG', 'RacerLeaderboardViewContext', 'showLeaderboard(context?: RacerLeaderboardViewContext)', 'createWechatRacerServices(config) ?? createNoopRacerServices()'], 'RacerServices WeChat adapter with isolated config and noop fallback', missing);
requireTokens(wechatConfig, ['RACER_WECHAT_SERVICES_CONFIG', 'titlePrefix', 'openDataContextCommand', 'cloudFunctionName', 'interstitialAdUnitId', 'rewardedAdUnitId', 'enableConsoleAnalytics', 'Do not commit production-only secrets'], 'isolated WeChat services configuration template', missing);
requireTokens(wechatServices, ['createWechatRacerServices', 'globalThis', 'shareAppMessage', 'getOpenDataContext', 'postMessage', 'submitRacerScore', 'showRacerLeaderboard', 'callFunction', 'createInterstitialAd', 'createRewardedVideoAd', 'showInterstitial', 'showRewarded', 'reportAnalytics'], 'WeChat services adapter skeleton', missing);

requireTokens(openDataProtocol, ['Open Data Leaderboard Protocol', 'submitRacerScore', 'showRacerLeaderboard', 'trackId: string', 'trackName: string', 'totalRaceTime: number', 'bestLapTime: number', 'racer.score.${trackId}', 'wx.setUserCloudStorage', 'open-data-leaderboard-canvas.js', 'renderRacerLeaderboardCanvas', 'Canvas renderer behavior'], 'open data leaderboard protocol and canvas sample docs', missing);
requireTokens(openDataHandler, ['handleRacerOpenDataMessage', 'submitRacerScore', 'showRacerLeaderboard', 'SCORE_KEY_PREFIX', 'racer.score.', 'isValidScorePayload', 'wx.setUserCloudStorage', 'wx.getFriendCloudStorage', 'parseLeaderboardRows', 'renderRacerLeaderboardCanvas', 'renderEmptyRacerLeaderboardCanvas', 'wx.onMessage'], 'sample open data leaderboard handler with optional canvas renderer', missing);
requireTokens(openDataCanvas, ['RACER_LEADERBOARD_CANVAS_THEME', 'resolveOpenDataCanvas', 'sharedCanvas', 'renderRacerLeaderboardCanvas', 'renderEmptyRacerLeaderboardCanvas', 'drawHeader', 'drawLeaderboardRows', 'drawLeaderboardRow', 'drawRankBadge', 'drawAvatar', 'wx.createImage', 'drawEmptyState', 'formatSeconds', 'roundedRectPath'], 'sample open data canvas leaderboard renderer', missing);

if (!config.includes("from './RacerTrackDefinition'") || config.includes('const TRACK_SECTIONS: TrackSection[] = [')) {
  missing.push('config.ts must re-export track definitions without owning track section data');
}
requireTokens(trackDefinition, ['RacerTrackDefinition', 'DEFAULT_OUTRUN_TRACK', 'COAST_SPRINT_TRACK', 'CITY_NIGHT_TRACK', 'RACER_TRACKS', 'findRacerTrackById', 'racerTrackIndex'], 'multi-track registry', missing);
requireTokens(controlSensitivity, ['RacerControlSensitivityId', 'RACER_CONTROL_SENSITIVITY_PROFILES', "id: 'comfort'", "id: 'standard'", "id: 'sensitive'", 'joystickGain', 'steerInputLimit', 'steerResponse'], 'control sensitivity profiles', missing);
requireTokens(state, ['private track: RacerTrackDefinition', 'setTrack(track: RacerTrackDefinition', 'roadColorForSegment(index, this.track.roadTheme)', 'private controlSensitivity', 'setControlSensitivity(profile: RacerControlSensitivityProfile)'], 'RacerState track/runtime/control sensitivity state', missing);
requireTokens(settings, ['SELECTED_TRACK_ID_KEY', 'getSelectedTrackId', 'setSelectedTrackId', 'MINI_MAP_ENABLED_KEY', 'CONTROL_COACH_ENABLED_KEY', 'CONTROL_SENSITIVITY_KEY'], 'RacerSettings persisted settings', missing);
requireTokens(storage, ['bestLapKey(trackId', 'getBestLapTime(trackId', 'setBestLapTime(seconds: number, trackId'], 'RacerStorage per-track best lap', missing);
requireTokens(scene, ['tracks: RACER_TRACKS', 'selectedTrackId: this.activeTrack.id', 'trackName: this.activeTrack.name', 'this.state.completedLaps >= this.targetLaps', '(touches: TouchPoint[] = [])', 'this.services.leaderboard.showLeaderboard(context)'], 'RacerScene selected track, settings, leaderboard context, and target-lap flow', missing);
if (scene.includes('const TARGET_LAPS')) missing.push('RacerScene must not hardcode TARGET_LAPS');
if (scene.includes('cycleTrack()')) missing.push('RacerScene should use dedicated track selection screen instead of cycleTrack');
requireTokens(renderer, ['RacerUiRenderer', 'this.ui.render(ctx, state, assets, layout, options)', 'state.activeTrack.roadTheme.fog', 'ctx.imageSmoothingEnabled = false', 'drawPlayerFallback'], 'Pseudo3DRenderer world/UI integration', missing);
requireTokens(uiTheme, ['RACER_UI_THEME', 'brandLogo', 'buttonIcon', 'trackCard', 'settingCard', 'statusPill', 'minimap', 'controls'], 'centralized UI theme tokens', missing);
requireTokens(uiLayout, ['RacerMiniMapLayout', 'RacerTrackSelectLayout', 'RacerSettingsLayout', 'miniMapButton', 'sensitivityButton', 'joystickTouchArea'], 'RacerUiLayout publish layout, track select, and settings card layout', missing);
requireTokens(joystick, ['class RacerJoystick', 'deadZone = 0.06', 'profile.joystickGain', 'profile.steerInputLimit'], 'configurable virtual joystick model', missing);
requireTokens(uiRenderer, ['RacerMiniMap', 'RacerUiIcons', 'RacerUiLogo', 'drawTrackSelect', 'drawSettings', '选择赛道', '设置', '控制手感'], 'RacerUiRenderer commercial UI, track select, settings, and sensitivity display', missing);
requireTokens(miniMap, ['class RacerMiniMap', 'drawCurvePreview', 'drawTrafficDots', '赛道雷达', 'RACER_UI_THEME'], 'independent minimap component', missing);
requireTokens(startup, ['startWeChatRacerGame', 'new WxPlatform', 'onHide', 'onShow'], 'WeChat startup module lifecycle binding', missing);

requireTokens(assetGuide, ['npm run assets:commercial', 'npm run assets:commercial:apply', 'npm run assets:legacy:apply', 'required files', 'assets/packs/default/images/ui/logo.png', 'assets/packs/default/images/ui/icons.png'], 'asset replacement guide safe switch and optional UI asset docs', missing);
requireTokens(deploymentGuide, ['WeChat Deployment Guide', 'RacerWechatConfig.ts', 'docs/open-data-leaderboard-protocol.md', 'docs/samples/open-data-leaderboard-handler.js', 'docs/samples/open-data-leaderboard-canvas.js', 'npm run assets:commercial', 'npm run assets:commercial:apply', 'npm run validate:production', 'npm run build:wx', 'COMMERCIAL_TEMPLATE_ASSET_PACK', 'dist/wechat/', 'Do not commit production-only secrets'], 'WeChat deployment guide release checklist, open data samples, and commercial asset switch flow', missing);
requireTokens(productionPlan, ['Commercialization readiness', 'commercialization-plan.md', 'commercialization-agent-workstreams.md', 'commercialization-roadmap.md', 'commercialization-art-audio-brief.md', 'commercialization-asset-rights-register.md', 'commercialization-risk-register.md', 'commercialization-launch-checklist.md', 'Commercialization Director', 'Licensing & Compliance', 'go/no-go'], 'production completion plan commercialization gate', missing);

requireTokens(commercialPlan, ['Game Commercialization Plan', 'Commercial goal', 'Product positioning', 'Revenue model options', 'Key performance indicators', 'Commercial milestones', 'Go / no-go rules'], 'commercialization master plan', missing);
requireTokens(commercialWorkstreams, ['Commercialization Agent Workstreams', 'Commercialization Director', 'Licensing & Compliance Agent', 'Monetization Strategy Agent', 'Growth & Publishing Agent', 'LiveOps & Analytics Agent', 'Commercial QA Agent', 'Handoff map'], 'commercialization multi-agent workstreams', missing);
requireTokens(commercialRoadmap, ['Commercialization Roadmap', 'Phase 1: Commercial-safe content pack', 'Phase 3: WeChat platform integration', 'Phase 4: Soft launch', 'Phase 5: Monetization expansion', 'Release record template'], 'commercialization roadmap', missing);
requireTokens(commercialArtAudioBrief, ['Commercialization Art & Audio Brief', 'Deliverable summary', 'Background atlas brief', 'Sprite atlas brief', 'Brand logo brief', 'UI icon atlas brief', 'Background music brief', 'Sound effects brief', 'Share card image brief', 'Production handoff checklist', 'Integration checklist', 'RacerUiIconAtlas.ts', 'SpriteAtlas.ts'], 'commercial art and audio production brief', missing);
requireTokens(commercialAssetRights, ['Commercialization Asset Rights Register', 'commercialization-art-audio-brief.md', 'P0 release blockers', 'background.png', 'sprites.png', 'racer.mp3', 'logo.png', 'icons.png', 'engine-loop.mp3', 'crash.mp3', 'menu-confirm.mp3', 'share.card', 'owner / creator', 'License proof location', 'Commercial use allowed', 'Redistribution in WeChat package allowed', 'fallback-approved', 'Approval rule'], 'commercial asset rights register', missing);
requireTokens(commercialRisks, ['Commercialization Risk Register', 'P0 blocker', 'unlicensed legacy assets', 'commercialization-asset-rights-register.md', 'ads interrupt gameplay', 'leaderboard mixes tracks', 'WeChat service misconfiguration', 'scope creep'], 'commercialization risk register', missing);
requireTokens(commercialChecklist, ['Commercialization Launch Checklist', 'Commercial asset pack', 'commercialization-art-audio-brief.md', 'SpriteAtlas.ts', 'RacerUiIconAtlas.ts', 'commercialization-asset-rights-register.md', 'Required asset rows are marked `approved`', 'fallback-approved', 'License and compliance', 'WeChat services', 'Gameplay QA', 'UI / UX QA', 'Build validation', 'Device validation', 'Go / no-go signoff'], 'commercialization launch checklist with art/audio and asset rights gates', missing);

const agentTaskChecks = {
  'docs/agent-tasks/commercialization-director.md': ['Commercialization Director', 'go / no-go', 'Release scope'],
  'docs/agent-tasks/licensing-compliance.md': ['Licensing & Compliance', 'asset rights register', 'No unresolved P0 licensing blocker'],
  'docs/agent-tasks/monetization-strategy.md': ['Monetization Strategy', 'Ads never appear during active driving', 'Rewarded video'],
  'docs/agent-tasks/growth-publishing.md': ['Growth & Publishing', 'Share copy matrix', 'Soft-launch release notes'],
  'docs/agent-tasks/liveops-analytics.md': ['LiveOps & Analytics', 'Analytics event catalog', 'First race start rate']
};

for (const [file, tokens] of Object.entries(agentTaskChecks)) {
  requireTokens(files[file], tokens, `${file} commercial agent task`, missing);
}

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
