import type { Engine, Renderer } from '../../engine';
import type { RacerScene } from '../../scenes/RacerScene';

interface FrameCanvas {
  width: number;
  height: number;
  requestAnimationFrame?: (callback: (time: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}

interface DrawableScene {
  update(dt: number): void;
  draw(renderer: Renderer): void;
}

function scheduleFrame(canvas: FrameCanvas, callback: (time: number) => void): number {
  if (typeof canvas.requestAnimationFrame === 'function') {
    return canvas.requestAnimationFrame(callback);
  }

  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(callback);
  }

  return setTimeout(() => callback(Date.now()), 1000 / 60) as unknown as number;
}

function drawRenderFailure(engine: Engine, error: unknown): void {
  console.error('[racer] frame_render_failed', error);

  const ctx = engine.renderer.ctx;
  try {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#160b12';
    ctx.fillRect(0, 0, engine.width, engine.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(22, Math.round(engine.width / 24))}px sans-serif`;
    ctx.fillText('赛车画面渲染失败', engine.width / 2, engine.height * 0.45);
    ctx.fillStyle = '#ffcc4d';
    ctx.font = `${Math.max(12, Math.round(engine.width / 55))}px sans-serif`;
    ctx.fillText('请查看 Console 中 frame_render_failed 的首条错误', engine.width / 2, engine.height * 0.56);
    ctx.restore();
  } catch (fallbackError) {
    console.error('[racer] failed to draw render error screen', fallbackError);
  }
}

export function startReliableWeChatRenderLoop(engine: Engine, scene: RacerScene): void {
  const canvas = engine.platform.canvas as unknown as FrameCanvas;
  const drawable = scene as unknown as DrawableScene;
  let running = true;
  let firstFrame = true;
  let lastTime = Date.now();

  const render = (time: number): void => {
    if (!running) return;

    const now = Number.isFinite(time) && time > 0 ? time : Date.now();
    const rawDelta = (now - lastTime) / 1000;
    const dt = firstFrame ? 0 : Math.min(0.05, Math.max(0, rawDelta));
    lastTime = now;

    try {
      drawable.update(dt);
      engine.renderer.clear();
      drawable.draw(engine.renderer);

      if (firstFrame) {
        const screen = engine.platform.getScreenInfo();
        console.log('[racer] first_frame_rendered', {
          width: engine.width,
          height: engine.height,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          pixelRatio: screen.pixelRatio,
          scheduler: typeof canvas.requestAnimationFrame === 'function' ? 'canvas.requestAnimationFrame' : 'fallback'
        });
        firstFrame = false;
      }
    } catch (error) {
      running = false;
      drawRenderFailure(engine, error);
      return;
    }

    scheduleFrame(canvas, render);
  };

  // Draw synchronously so a broken RAF implementation can never leave a silent black screen.
  render(lastTime);
}
