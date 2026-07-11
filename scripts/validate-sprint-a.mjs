import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = {
  canvasCompat: 'src/racer/RacerCanvasCompat.ts',
  startup: 'src/platforms/wechat/startup.ts',
  engine: 'src/engine/local-lite-game-engine.ts',
  joystick: 'src/racer/RacerJoystick.ts',
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

requireTokens(source.canvasCompat, ['installRacerCanvasCompatibility', 'roundRectFallback', 'quadraticCurveTo'], 'canvas compatibility', failures);
requireTokens(source.startup, ['installRacerCanvasCompatibility', 'engine.renderer.ctx'], 'startup canvas compatibility install', failures);
requireTokens(source.engine, ['changedTouches?: TouchPoint[]', 'dispatchTouchEnd', 'this.emit(this.moveHandlers, activeTouches'], 'multi-touch lifecycle', failures);
requireTokens(source.joystick, ['private touchId', 'isTracking(point', 'this.touchId = point.id ?? null'], 'joystick touch ownership', failures);
requireTokens(source.powerupConfig, ['pickupCharge: 50', 'maxCharge: 100', 'drainPerSecond: 22', 'RACER_POWERUP_SEQUENCE'], 'powerup balance config', failures);
requireTokens(source.state, ['MAX_PHYSICS_STEP = 1 / 60', 'private updateStep', 'findSafePowerupSegment', 'collisionCooldown > 0', 'nitroReserve', 'input.nitro', 'get nitroCharge', '氮气已储存'], 'physics, powerup safety, and manual nitro state', failures);
requireTokens(source.layout, ['nitroButton', 'nitroTouchArea', 'line6Y'], 'nitro and tutorial layout', failures);
requireTokens(source.uiRenderer, ['drawNitroButton', 'state.nitroCharge', '黄色 ≫：立即加速', '蓝色 N：补充 50% 氮气', '红黑地面：减速陷阱'], 'nitro HUD and powerup tutorial', failures);
requireTokens(source.scene, ['state.input.nitro', 'nitroTouchArea', 'powerup_pickup', 'slow_hit', 'nitro_start', 'nitro_end'], 'manual nitro input and analytics', failures);
requireTokens(source.renderer, ['drawSlowHazard', 'roundedRectPath', "type === 'slow'"], 'powerup visual safety', failures);

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

console.log('Sprint A gameplay safety and manual nitro validation passed.');
