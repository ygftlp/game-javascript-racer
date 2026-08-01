import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = {
  main: 'src/main.wx.ts',
  canvasCompat: 'src/racer/RacerCanvasCompat.ts',
  frontendScene: 'src/racer/frontend/RacerV2FrontendScene.ts',
  homeLayout: 'src/racer/frontend/home/RacerHomeLayout.ts',
  homeRenderer: 'src/racer/frontend/home/RacerHomeRenderer.ts',
  startup: 'src/platforms/wechat/startup.ts',
  wechatMainCanvas: 'src/platforms/wechat/RacerWechatMainCanvas.ts',
  wechatPlatform: 'src/platforms/wechat/RacerWechatPlatform.ts',
  wechatRenderLoop: 'src/platforms/wechat/RacerWechatRenderLoop.ts',
  engine: 'src/engine/local-lite-game-engine.ts',
  joystick: 'src/racer/RacerJoystick.ts',
  assetManifest: 'src/racer/RacerAssetManifest.ts',
  assets: 'src/racer/RacerAssets.ts',
  backgroundTheme: 'src/racer/RacerBackgroundTheme.ts',
  feedback: 'src/racer/RacerFeedbackController.ts',
  miniMap: 'src/racer/RacerMiniMap.ts',
  trackOutline: 'src/racer/RacerTrackOutline.ts',
  powerupConfig: 'src/racer/RacerPowerupConfig.ts',
  state: 'src/racer/RacerState.ts',
  layout: 'src/racer/RacerUiLayout.ts',
  uiRenderer: 'src/racer/RacerUiRenderer.ts',
  uiTheme: 'src/racer/RacerUiTheme.ts',
  renderer: 'src/racer/Pseudo3DRenderer.ts',
  scene: 'src/scenes/RacerScene.ts'
};

async function read(path) {
  return readFile(resolve(path), 'utf8');
}

function requireTokens(content, tokens, label, failures) {
  for (const token of tokens) {
    if (!content.includes(token)) failures.push(`${label}: missing ${token}`);
  }
}

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await read(path)]))
);
const failures = [];

requireTokens(source.main, ['ensureWeChatMainCanvas', 'startWeChatRacerGame'], 'wechat runtime entry', failures);
requireTokens(source.frontendScene, [
  'class RacerV2FrontendScene',
  'isFrontendPhase',
  "runtime.phase === 'menu'",
  "runtime.phase === 'trackSelect'",
  "runtime.phase === 'settings'",
  'homeRenderer.draw',
  'drawTrackSelect',
  'drawSettings',
  'drawHelp',
  'frontendTime'
], 'V2 frontend page routing and modal pages', failures);
requireTokens(source.homeRenderer, [
  'class RacerHomeRenderer',
  'drawBackdrop',
  'drawCity',
  'drawProfile',
  'drawAssetCard',
  'drawCarStage',
  'drawGarageButton',
  'drawStartButton',
  'Wide metal start CTA',
  'leftPreviousArrow',
  'rightNextArrow',
  '38,000',
  'Lv. 21',
  '进入车库',
  '拾取蓝色N后按住氮气'
], 'independent garage-style home renderer', failures);
requireTokens(source.homeLayout, [
  'RacerHomeLayout',
  'buildRacerHomeLayout',
  'bestCard',
  'profileCard',
  'coinCard',
  'gemCard',
  'carStage',
  'garageButton',
  'footerBar',
  'trackCarousel'
], 'independent garage-style home layout', failures);
requireTokens(source.canvasCompat, ['installRacerCanvasCompatibility', 'roundRectFallback', 'quadraticCurveTo'], 'canvas compatibility', failures);
requireTokens(source.startup, ['installRacerCanvasCompatibility', 'renderBootScreen', 'RacerWechatPlatform', 'RacerV2FrontendScene', 'startReliableWeChatRenderLoop', 'RUNTIME V2 FRONTEND', '极速公路启动失败'], 'wechat startup, V2 frontend, and reliable render loop binding', failures);
requireTokens(source.wechatMainCanvas, ['ensureWeChatMainCanvas', 'main_canvas_bootstrap', 'GameGlobal.canvas', 'root.canvas = mainCanvas', 'wx.createCanvas'], 'explicit visible WeChat main canvas bootstrap', failures);
requireTokens(source.wechatPlatform, ['resolveExistingMainCanvas', "typeof canvas !== 'undefined'", "typeof GameGlobal !== 'undefined'", 'windowWidth', 'windowHeight', 'wechat_canvas_ready', 'hasCanvasRaf'], 'wechat main canvas and window metrics', failures);
requireTokens(source.wechatRenderLoop, ['canvas.requestAnimationFrame', 'first_frame_rendered', 'frame_render_failed', 'Draw synchronously'], 'reliable first frame and canvas scheduler', failures);
requireTokens(source.engine, ['changedTouches?: TouchPoint[]', 'dispatchTouchEnd', 'this.emit(this.moveHandlers, activeTouches'], 'multi-touch lifecycle', failures);
requireTokens(source.joystick, ['private touchId', 'isTracking(point', 'this.touchId = point.id ?? null'], 'joystick touch ownership', failures);
requireTokens(source.assetManifest, ['boostPickup?: string', 'nitroPickup?: string', 'slowHit?: string', 'nitroLoop?: string', 'boost-pickup.mp3', 'nitro-loop.mp3'], 'optional gameplay feedback audio manifest', failures);
requireTokens(source.assets, ['playBoostPickup', 'playNitroPickup', 'playSlowHit', 'playNitroLoop', 'stopNitroLoop', 'this.pack.audio.nitroLoop'], 'optional gameplay feedback audio loading and playback', failures);
requireTokens(source.backgroundTheme, [
  'interface RacerBackgroundTheme',
  'legacy:',
  'coast:',
  'night:',
  'atlasTint',
  'racerBackgroundTheme'
], 'restrained per-track race background themes', failures);
requireTokens(source.feedback, ['class RacerFeedbackController', 'syncAudio', 'cameraOffset', 'drawNitroSpeedLines', 'drawImpactVignette', 'assets.stopNitroLoop()'], 'gameplay audio and motion feedback controller', failures);
requireTokens(source.miniMap, [
  'collidesNitro',
  'drawOutline',
  'drawDrivenArc',
  'ensureOutline',
  'common WeChat landscape height'
], 'contour minimap visibility without height gate', failures);
requireTokens(source.trackOutline, [
  'buildTrackOutline',
  'fitOutlineToBounds',
  'sampleOutlineAt',
  'curvesFromSegments'
], 'track outline pure builder', failures);
requireTokens(source.powerupConfig, ['pickupCharge: 50', 'maxCharge: 100', 'drainPerSecond: 22', 'RACER_POWERUP_SEQUENCE'], 'powerup balance config', failures);
requireTokens(source.state, ['MAX_PHYSICS_STEP = 1 / 60', 'private updateStep', 'findSafePowerupSegment', 'collisionCooldown > 0', 'nitroReserve', 'input.nitro', 'get nitroCharge', '氮气已储存'], 'physics, powerup safety, and manual nitro state', failures);
requireTokens(source.layout, [
  'nitroButton',
  'nitroTouchArea',
  'line6Y',
  'buildRacerHomeLayout',
  'menuPrimarySize',
  'menuLeftSafe',
  'menuStartY',
  'menuX',
  'RacerTrackCarouselLayout',
  'trackCarousel',
  'trackCarouselCardW',
  'trackCarouselStepX',
  'settingsButtonSize',
  'settingsButtonRight',
  'settingsButtonY',
  'startButton: rect(menuX',
  'width - settingsButtonRight - settingsButtonSize',
  'joystickRadius = Math.max(58',
  'Math.min(86',
  'joystickKnobRadius = joystickRadius * 0.4',
  'height * 0.42',
  'width * 0.48',
  'function safePanel',
  'frontendTopSafe',
  'frontendBottomSafe',
  'settingsRows = 6',
  'settingsRowY(5)',
  'trackContentHeight',
  'helpLinesHeight',
  'settingsHeaderHeight = clamp(settingsPanel.h * 0.16, 58',
  'trackHeaderHeight = clamp(trackPanel.h * 0.18, 64',
  'helpHeaderHeight = clamp(helpPanel.h * 0.16, 58',
'closeButton',
  'pathBounds',
  'miniMapSize = clamp',
  'miniMapTop',
  'pauseGap'
  ], 'safe-area frontend panels, home track carousel layout, capsule-safe settings control, compact joystick, and shared touch layout', failures);
requireTokens(source.uiRenderer, ['drawNitroButton', 'state.nitroCharge', '黄色 ≫ 立即加速', '蓝色 N 补充 50% 氮气', '红黑地面是减速陷阱', 'drawCloseButton'], 'nitro HUD and powerup tutorial', failures);
requireTokens(source.uiTheme, [
  "baseIdle: 'rgba(255,255,255,0.1)'",
  "knobIdle: 'rgba(255,255,255,0.34)'",
  "brake: 'rgba(230, 84, 58, 0.46)'",
  "hud: 'rgba(12, 18, 24, 0.44)'"
], 'low-weight idle race controls and HUD', failures);
requireTokens(source.scene, ['state.input.nitro', 'nitroTouchArea', 'powerup_pickup', 'slow_hit', 'nitro_start', 'nitro_end', 'this.getUiLayout().menu.startButton', 'this.getUiLayout().menu.settingsButton'], 'manual nitro, analytics, and shared menu hit targets', failures);
requireTokens(source.renderer, [
  'RacerFeedbackController',
  'racerBackgroundTheme',
  'progressRotation',
  'state.height * 0.43',
  'state.height * 0.29',
  'feedback.syncAudio',
  'feedback.cameraOffset',
  'feedback.drawMotionOverlay',
  'ctx.translate(cameraOffset.x, cameraOffset.y)',
  'drawSlowHazard',
  'roundedRectPath'
], 'layered race background, world motion feedback, and powerup visual safety', failures);

if (source.main.includes('installRacerMenuPresentation')) {
  failures.push('WeChat entry must not install the legacy menu presentation prototype patch');
}

if (source.frontendScene.includes('prototype.render =') || source.frontendScene.includes('prototype.draw =')) {
  failures.push('V2 frontend must use a scene boundary instead of replacing renderer prototypes');
}

if (source.frontendScene.includes("{ target: 'menu-settings', rect: layout.menu.settingsButton, label: '设置'")) {
  failures.push('V2 settings entry must live outside the left-side primary action list');
}

if (source.frontendScene.includes("{ target: 'menu-track', rect: layout.menu.trackButton, label: '选择赛道'")) {
  failures.push('V2 home must use the track carousel instead of a primary 选择赛道 orb');
}

requireTokens(source.scene, [
  'beginMenuCarouselDrag',
  'finishMenuCarouselDrag',
  'menuCarouselOffset',
  "source === 'home_carousel'",
  "this.phase !== 'trackSelect' && this.phase !== 'menu'"
], 'home track carousel drag/snap selection from menu phase', failures);

if (source.frontendScene.includes("ctx.fillText('•••'")) {
  failures.push('V2 settings entry must not imitate the native WeChat capsule with duplicate ellipsis controls');
}

if (source.frontendScene.includes('skylineDark') || source.frontendScene.includes('skylineLight') || source.frontendScene.includes('roadTop')) {
  failures.push('V2 frontend must use the clean product backdrop instead of race scenery');
}

if (source.layout.includes('Math.max(92, Math.min(126')) {
  failures.push('Race joystick must not regress to the oversized 92-126px radius');
}

if (source.layout.includes('const settingsPanel = panel(') || source.layout.includes('settingsCardH = small ? 44 : 54')) {
  failures.push('Frontend settings must use safe-area flow layout instead of fixed-height cards');
}

if (source.renderer.includes('BACKGROUND.SKY')) {
  failures.push('Race renderer must not stretch the legacy sky atlas across the full screen');
}

if (source.renderer.includes('destW, state.height') || source.renderer.includes('state.width - destW, state.height')) {
  failures.push('Race background atlas layers must use bounded destination heights');
}

if (source.renderer.includes('ctx.roundRect(') || source.renderer.includes('.roundRect(')) {
  failures.push('Pseudo3DRenderer must not depend on native Canvas roundRect');
}

if (source.state.includes("this.nitroTime = Math.max(this.nitroTime")) {
  failures.push('Nitro pickup must store charge instead of auto-activating a timed boost');
}

if (failures.length) {
  console.error('Sprint A validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Sprint A gameplay safety, layered per-track race background, short-screen radar cleanup, low-weight controls, safe-area V2 panels, capsule-safe settings entry, explicit WeChat main canvas, reliable render loop, manual nitro, audio, and motion feedback validation passed.');
