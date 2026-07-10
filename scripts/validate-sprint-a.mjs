import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = {
  canvasCompat: 'src/racer/RacerCanvasCompat.ts',
  startup: 'src/platforms/wechat/startup.ts',
  engine: 'src/engine/local-lite-game-engine.ts',
  joystick: 'src/racer/RacerJoystick.ts',
  state: 'src/racer/RacerState.ts',
  renderer: 'src/racer/Pseudo3DRenderer.ts'
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
requireTokens(source.state, ['MAX_PHYSICS_STEP = 1 / 60', 'private updateStep', 'findSafePowerupSegment', 'POWERUP_SEQUENCE', 'collisionCooldown > 0'], 'physics and powerup safety', failures);
requireTokens(source.renderer, ['drawSlowHazard', 'roundedRectPath', "type === 'slow'"], 'powerup visual safety', failures);

if (source.renderer.includes('ctx.roundRect(') || source.renderer.includes('.roundRect(')) {
  failures.push('Pseudo3DRenderer must not depend on native Canvas roundRect');
}

if (failures.length) {
  console.error('Sprint A validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Sprint A gameplay safety validation passed.');
