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
  'src/racer/RacerUiLayout.ts',
  'src/racer/RacerUiRenderer.ts',
  'src/racer/RacerUiTheme.ts',
  'src/platforms/wechat/startup.ts',
  'src/platforms/wechat/game.json',
  'scripts/build-wechat.mjs',
  'scripts/use-engine-mode.mjs',
  'scripts/validate-assets.mjs',
  'docs/asset-replacement-guide.md',
  'docs/agent-workstreams.md',
  'docs/commercial-ui-ux-plan.md',
  'docs/production-completion-plan.md',
  'docs/road-replacement-guide.md',
  'docs/ui-polish-agent-sync.md'
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
const manifest = files['src/racer/RacerAssetManifest.ts'];
const services = files['src/racer/RacerServices.ts'];
const scene = files['src/scenes/RacerScene.ts'];
const renderer = files['src/racer/Pseudo3DRenderer.ts'];
const roadTheme = files['src/racer/RacerRoadTheme.ts'];
const trackDefinition = files['src/racer/RacerTrackDefinition.ts'];
const controlSensitivity = files['src/racer/RacerControlSensitivity.ts'];
const config = files['src/racer/config.ts'];
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
const liteEngineTypes = files['src/types/lite-game-engine.d.ts'];
const uiFlags = files['src/racer/RacerUiFlags.ts'];
const uiLayout = files['src/racer/RacerUiLayout.ts'];
const joystick = files['src/racer/RacerJoystick.ts'];
const roadGuide = files['docs/road-replacement-guide.md'];
const productionPlan = files['docs/production-completion-plan.md'];
const uiAgentSync = files['docs/ui-polish-agent-sync.md'];

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

requireTokens(engineModeScript, ['file:../game-engine'], 'engine mode script must support local ../game-engine dependency', missing);
requireTokens(liteEngineTypes, ["declare module 'lite-game-engine'", 'export class Engine'], 'local lite-game-engine type fallback declaration', missing);
requireTokens(localEngine, ['this.screen.width * pixelRatio', 'ctx.scale(pixelRatio, pixelRatio)'], 'high-DPI local engine canvas scaling', missing);
requireTokens(uiFlags, ['releaseMode: true', 'showAssetStatus: false', 'showControlLabels: false', 'showMiniMap: true', 'showFirstRaceCoach: true'], 'commercial release UI flags', missing);
requireTokens(roadTheme, ['COMMERCIAL_ASPHALT_ROAD_THEME', 'LEGACY_GREEN_ROAD_THEME', 'roadColorForSegment'], 'commercial road theme', missing);
requireTokens(trackDefinition, ['RacerTrackDefinition', 'DEFAULT_OUTRUN_TRACK', 'COAST_SPRINT_TRACK', 'CITY_NIGHT_TRACK', 'RACER_TRACKS', 'findRacerTrackById', 'getNextRacerTrack', 'racerTrackIndex'], 'multi-track registry', missing);
requireTokens(controlSensitivity, ['RacerControlSensitivityId', 'RACER_CONTROL_SENSITIVITY_PROFILES', "id: 'comfort'", "id: 'standard'", "id: 'sensitive'", 'joystickGain', 'steerInputLimit', 'steerResponse', 'findRacerControlSensitivity', 'nextRacerControlSensitivity'], 'control sensitivity profiles', missing);
if (!config.includes("from './RacerTrackDefinition'") || config.includes('const TRACK_SECTIONS: TrackSection[] = [')) {
  missing.push('config.ts must re-export track definitions without owning track section data');
}
requireTokens(state, ['private track: RacerTrackDefinition', 'setTrack(track: RacerTrackDefinition', 'for (const section of this.track.sections)', 'roadColorForSegment(index, this.track.roadTheme)', 'this.track.roadTheme.start', 'this.track.roadTheme.finish', 'steer: number', 'private controlSensitivity', 'setControlSensitivity(profile: RacerControlSensitivityProfile)', 'this.controlSensitivity.steerResponse', 'this.controlSensitivity.steerInputLimit'], 'RacerState track/runtime/control sensitivity state', missing);
requireTokens(settings, ['SELECTED_TRACK_ID_KEY', 'getSelectedTrackId', 'setSelectedTrackId', 'FIRST_RACE_COACH_SHOWN_KEY', 'MINI_MAP_ENABLED_KEY', 'CONTROL_COACH_ENABLED_KEY', 'CONTROL_SENSITIVITY_KEY', 'getControlSensitivityId', 'setControlSensitivityId', 'resetControlSensitivity', 'isMiniMapEnabled', 'setMiniMapEnabled', 'isControlCoachEnabled', 'setControlCoachEnabled', 'resetFirstRaceCoach'], 'RacerSettings persisted settings', missing);
requireTokens(storage, ['bestLapKey(trackId', 'getBestLapTime(trackId', 'setBestLapTime(seconds: number, trackId'], 'RacerStorage per-track best lap', missing);
requireTokens(services, ['trackId: string', 'trackName: string'], 'RaceResult selected track metadata', missing);
requireTokens(scene, [
  'findRacerTrackById',
  'findRacerControlSensitivity',
  'nextRacerControlSensitivity',
  'private controlSensitivity: RacerControlSensitivityProfile',
  'this.settings.getControlSensitivityId()',
  'this.state.setControlSensitivity(this.controlSensitivity)',
  'this.settings.setControlSensitivityId(this.controlSensitivity.id)',
  'cycleControlSensitivity()',
  'this.joystick.steer(this.controlSensitivity)',
  'controlSensitivityLabel: this.controlSensitivity.label',
  'controlSensitivityDescription: this.controlSensitivity.description',
  'this.settings.getSelectedTrackId()',
  'this.settings.setSelectedTrackId(this.activeTrack.id)',
  'this.storage.getBestLapTime(this.activeTrack.id)',
  'this.storage.setBestLapTime(this.savedBestLapTime, this.activeTrack.id)',
  'private activeTrack: RacerTrackDefinition',
  'private get targetLaps(): number',
  'private miniMapEnabled = true',
  'private controlCoachEnabled = true',
  'this.settings.isMiniMapEnabled()',
  'this.settings.isControlCoachEnabled()',
  'miniMapEnabled: this.miniMapEnabled',
  'controlCoachEnabled: this.controlCoachEnabled',
  'controlCoachSeen: this.hasShownControlCoach',
  "this.phase = 'trackSelect'",
  "this.phase = 'settings'",
  'openTrackSelect()',
  'openSettings()',
  'selectTrack(trackIndex: number)',
  'toggleMiniMap()',
  'toggleControlCoach()',
  'resetControlCoachSetting()',
  'isSettingsSensitivityButton',
  "'settings-sensitivity'",
  'trackSelectIndex(point: TouchPoint)',
  'trackPressedTarget(index: number)',
  'trackIndexFromPressedTarget',
  'isMenuSettingsButton',
  'isSettingsAudioButton',
  'isSettingsMiniMapButton',
  'isSettingsCoachButton',
  'isSettingsResetCoachButton',
  'isSettingsBackButton',
  "'track-back'",
  "'menu-settings'",
  "'settings-back'",
  'tracks: RACER_TRACKS',
  'selectedTrackId: this.activeTrack.id',
  'this.state.completedLaps >= this.targetLaps',
  'targetLaps: this.targetLaps',
  'trackName: this.activeTrack.name',
  '(touches: TouchPoint[] = [])',
  'private handleTouchEnd(touches: TouchPoint[] = [])'
], 'RacerScene dedicated track selection, settings, control sensitivity, and selected track flow', missing);
if (scene.includes('const TARGET_LAPS')) missing.push('RacerScene must not hardcode TARGET_LAPS');
if (scene.includes('cycleTrack()')) missing.push('RacerScene should use dedicated track selection screen instead of cycleTrack');
requireTokens(renderer, ['RacerUiRenderer', 'this.ui.render(ctx, state, assets, layout, options)', 'state.activeTrack.roadTheme.fog', 'ctx.imageSmoothingEnabled = false', 'drawImage(image', 'drawPlayerFallback', 'drawPlayerVisibilityMarker', 'state.height - carH - 24', 'this.drawPlayer(ctx, state, assets?.sprites ?? null, playerSegment, playerPercent)'], 'Pseudo3DRenderer world/UI integration', missing);
requireTokens(uiTheme, ['RACER_UI_THEME', 'accent', 'minimap', 'controls'], 'centralized UI theme tokens', missing);
requireTokens(uiLayout, ['RacerMiniMapLayout', 'miniMapPreviewBar', 'miniMapProgressBar', 'trackButton', 'RacerTrackSelectLayout', 'trackSelect', 'trackButtons', 'RacerSettingsLayout', 'settingsButton', 'settings:', 'miniMapButton', 'coachButton', 'sensitivityButton', 'resetCoachButton', 'backButton', 'RacerHelpLayout', 'menuButton', 'Math.max(76', 'joystickTouchArea'], 'RacerUiLayout publish layout, track select, and settings layout', missing);
requireTokens(joystick, ['class RacerJoystick', 'deadZone = 0.06', 'profile.joystickGain', 'profile.steerInputLimit'], 'configurable virtual joystick model', missing);
requireTokens(uiRenderer, [
  'RacerMiniMap',
  'RACER_UI_FLAGS.showMiniMap && options.miniMapEnabled',
  'this.miniMap.render(ctx, state, layout)',
  'RACER_UI_THEME',
  'RacerUiPhase =',
  'trackSelect',
  'settings',
  'RacerTrackSelectPressedTarget',
  'RacerUiTrackOption',
  'miniMapEnabled: boolean',
  'controlCoachEnabled: boolean',
  'controlCoachSeen: boolean',
  'controlSensitivityLabel: string',
  'controlSensitivityDescription: string',
  'selectedTrackId: string',
  'tracks: readonly RacerUiTrackOption[]',
  'drawTrackSelect',
  'drawTrackCard',
  'drawSettings',
  '选择赛道',
  '已选择',
  '设置',
  '音乐：',
  '小地图：',
  '操作引导：',
  '控制手感：',
  '当前手感：',
  '重看操作引导',
  '返回菜单',
  'targetLaps: number',
  '`目标：完成 ${targetLaps} 圈，刷新最佳圈速`',
  'drawControlCoach',
  'drawVignette',
  'raceGrade',
  'RACER_UI_THEME.accent.goldSoft',
  'drawModalPanel',
  'primary = false',
  'drawJoystick',
  'drawBrakeButton',
  'drawPauseButton'
], 'RacerUiRenderer commercial UI, dedicated track select screen, settings screen, and sensitivity display', missing);
requireTokens(miniMap, ['class RacerMiniMap', 'drawCurvePreview', 'drawTrafficDots', '赛道雷达', 'RACER_UI_THEME'], 'independent minimap component', missing);
requireTokens(startup, ['startWeChatRacerGame', 'new WxPlatform', 'onHide', 'onShow'], 'WeChat startup module lifecycle binding', missing);
requireTokens(roadGuide, ['RACER_TRACKS', '选择赛道', 'selected track id', 'per track id', 'Level 5: Add textured road support'], 'road replacement guide track registry and persistence docs', missing);
requireTokens(productionPlan, ['dedicated track-select screen', 'dedicated settings screen', 'control sensitivity', '舒适', '标准', '灵敏', 'selected track id', 'per track id', 'Finish the configured target lap count on each selectable track'], 'production completion plan track-select, settings, and sensitivity docs', missing);
requireTokens(uiAgentSync, ['dedicated track-select screen', 'dedicated settings screen', 'control sensitivity', '舒适', '标准', '灵敏', 'selected track id', 'per track id'], 'UI polish multi-agent sync track-select, settings, and sensitivity docs', missing);

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
