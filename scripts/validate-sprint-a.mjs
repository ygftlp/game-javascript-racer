import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = {
  main: 'src/main.wx.ts',
  canvasCompat: 'src/racer/RacerCanvasCompat.ts',
  frontendScene: 'src/racer/frontend/RacerV2FrontendScene.ts',
  startup: 'src/platforms/wechat/startup.ts',
  wechatMainCanvas: 'src/platforms/wechat/RacerWechatMainCanvas.ts',
  wechatPlatform: 'src/platforms/wechat/RacerWechatPlatform.ts',
  wechatRenderLoop: 'src/platforms/wechat/RacerWechatRenderLoop.ts',
  engine: 'src/engine/local-lite-game-engine.ts',
  joystick: 'src/racer/RacerJoystick.ts',
  assetManifest: 'src/racer/RacerAssetManifest.ts',
  assets: 'src/racer/RacerAssets.ts',
  feedback: 'src/racer/RacerFeedbackController.ts',
  powerupConfig: 'src/racer/RacerPowerupConfig.ts',
  state: 'src/racer/RacerState.ts',
  layout: 'src/racer/RacerUiLayout.ts',
  uiRenderer: 'src/racer/RacerUiRenderer.ts',
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
  'drawBackdrop',
  'backgroundTop',
  'backgroundBottom',
  'Product-style frontend',
  'drawStatusCard',
  'drawBrandBanner',
  'drawSystemBar',
  'drawVehicleShowcase',
  'drawMenuButtons',
  'drawTrackSelect',
  'drawSettings',
  'drawHelp',
  'frontendTime',
  '拾取蓝色 N 后按住氮气'
], 'V2 clean responsive frontend pages and scene boundary', failures);
requireTokens(source.canvasCompat, ['installRacerCanvasCompatibility', 'roundRectFallback', 'quadraticCurveTo'], 'canvas compatibility', failures);
requireTokens(source.startup, ['installRacerCanvasCompatibility', 'renderBootScreen', 'RacerWechatPlatform', 'RacerV2FrontendScene', 'startReliableWeChatRenderLoop', 'RUNTIME V2 FRONTEND', '极速公路启动失败'], 'wechat startup, V2 frontend, and reliable render loop binding', failures);
requireTokens(source.wechatMainCanvas, ['ensureWeChatMainCanvas', 'main_canvas_bootstrap', 'GameGlobal.canvas', 'root.canvas = mainCanvas', 'wx.createCanvas'], 'explicit visible WeChat main canvas bootstrap', failures);
requireTokens(source.wechatPlatform, ['resolveExistingMainCanvas', "typeof canvas !== 'undefined'", "typeof GameGlobal !== 'undefined'", 'windowWidth', 'windowHeight', 'wechat_canvas_ready', 'hasCanvasRaf'], 'wechat main canvas and window metrics', failures);
requireTokens(source.wechatRenderLoop, ['canvas.requestAnimationFrame', 'first_frame_rendered', 'frame_render_failed', 'Draw synchronously'], 'reliable first frame and canvas scheduler', failures);
requireTokens(source.engine, ['changedTouches?: TouchPoint[]', 'dispatchTouchEnd', 'this.emit(this.moveHandlers, activeTouches'], 'multi-touch lifecycle', failures);
requireTokens(source.joystick, ['private touchId', 'isTracking(point', 'this.touchId = point.id ?? null'], 'joystick touch ownership', failures);
requireTokens(source.assetManifest, ['boostPickup?: string', 'nitroPickup?: string', 'slowHit?: string', 'nitroLoop?: string', 'boost-pickup.mp3', 'nitro-loop.mp3'], 'optional gameplay feedback audio manifest', failures);
requireTokens(source.assets, ['playBoostPickup', 'playNitroPickup', 'playSlowHit', 'playNitroLoop', 'stopNitroLoop', 'this.pack.audio.nitroLoop'], 'optional gameplay feedback audio loading and playback', failures);
requireTokens(source.feedback, ['class RacerFeedbackController', 'syncAudio', 'cameraOffset', 'drawNitroSpeedLines', 'drawImpactVignette', 'assets.stopNitroLoop()'], 'gameplay audio and motion feedback controller', failures);
requireTokens(source.powerupConfig, ['pickupCharge: 50', 'maxCharge: 100', 'drainPerSecond: 22', 'RACER_POWERUP_SEQUENCE'], 'powerup balance config', failures);
requireTokens(source.state, ['MAX_PHYSICS_STEP = 1 / 60', 'private updateStep', 'findSafePowerupSegment', 'collisionCooldown > 0', 'nitroReserve', 'input.nitro', 'get nitroCharge', '氮气已储存'], 'physics, powerup safety, and manual nitro state', failures);
requireTokens(source.layout, [
  'nitroButton',
  'nitroTouchArea',
  'line6Y',
  'menuButtonW',
  'menuStartY',
  'menuX',
  'settingsButtonRight',
  'startButton: rect(menuX',
  'settingsButton: rect(width - settingsButtonRight',
  'joystickRadius = Math.max(58',
  'Math.min(86',
  'joystickKnobRadius = joystickRadius * 0.4',
  'height * 0.42',
  'width * 0.48'
], 'compact joystick, nitro controls, and V2 shared visual/touch layout', failures);
requireTokens(source.uiRenderer, ['drawNitroButton', 'state.nitroCharge', '黄色 ≫：立即加速', '蓝色 N：补充 50% 氮气', '红黑地面：减速陷阱'], 'nitro HUD and powerup tutorial', failures);
requireTokens(source.scene, ['state.input.nitro', 'nitroTouchArea', 'powerup_pickup', 'slow_hit', 'nitro_start', 'nitro_end', 'this.getUiLayout().menu.startButton', 'this.getUiLayout().menu.settingsButton'], 'manual nitro, analytics, and shared menu hit targets', failures);
requireTokens(source.renderer, ['RacerFeedbackController', 'feedback.syncAudio', 'feedback.cameraOffset', 'feedback.drawMotionOverlay', 'ctx.translate(cameraOffset.x, cameraOffset.y)', 'drawSlowHazard', 'roundedRectPath'], 'world motion feedback and powerup visual safety', failures);

if (source.main.includes('installRacerMenuPresentation')) {
  failures.push('WeChat entry must not install the legacy menu presentation prototype patch');
}

if (source.frontendScene.includes('prototype.render =') || source.frontendScene.includes('prototype.draw =')) {
  failures.push('V2 frontend must use a scene boundary instead of replacing renderer prototypes');
}

if (source.frontendScene.includes("{ target: 'menu-settings', rect: layout.menu.settingsButton, label: '设置'")) {
  failures.push('V2 settings entry must live in the top-right system bar, not a fifth left-side button');
}

if (source.frontendScene.includes('skylineDark') || source.frontendScene.includes('skylineLight') || source.frontendScene.includes('roadTop')) {
  failures.push('V2 frontend must use the clean product backdrop instead of race scenery');
}

if (source.layout.includes('Math.max(92, Math.min(126')) {
  failures.push('Race joystick must not regress to the oversized 92-126px radius');
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

console.log('Sprint A gameplay safety, clean V2 frontend, compact joystick, shared touch layout, explicit WeChat main canvas, reliable render loop, manual nitro, audio, and motion feedback validation passed.');
