import { Engine, WxPlatform, type Renderer } from '../../engine';
import { installRacerCanvasCompatibility } from '../../racer/RacerCanvasCompat';
import { RacerScene } from '../../scenes/RacerScene';

interface WeChatLifecycleHost {
  onHide?: (handler: () => void) => void;
  onShow?: (handler: () => void) => void;
}

interface DrawableScene {
  draw?: (renderer: Renderer) => void;
}

declare const wx: WeChatLifecycleHost | undefined;

export interface WeChatRacerGame {
  engine: Engine;
  scene: RacerScene;
}

function getWeChatLifecycleHost(): WeChatLifecycleHost | null {
  try {
    return typeof wx === 'undefined' ? null : wx;
  } catch {
    return null;
  }
}

function bindWeChatLifecycle(scene: RacerScene): void {
  const host = getWeChatLifecycleHost();
  if (!host) return;

  host.onHide?.(() => scene.handleAppHidden());
  host.onShow?.(() => scene.handleAppShown());
}

function renderStatusScreen(engine: Engine, title: string, detail: string, error?: unknown): void {
  if (error !== undefined) console.error(`[racer] ${title}`, error);

  const ctx = engine.renderer.ctx;
  const width = engine.width;
  const height = engine.height;

  try {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#160b12';
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(22, Math.round(width / 24))}px sans-serif`;
    ctx.fillText(title, width / 2, height * 0.45);
    ctx.fillStyle = '#ffcc4d';
    ctx.font = `${Math.max(12, Math.round(width / 55))}px sans-serif`;
    ctx.fillText(detail, width / 2, height * 0.56);
    ctx.restore();
  } catch (renderError) {
    console.error('[racer] Failed to render runtime status screen', renderError);
  }
}

function renderBootScreen(engine: Engine): void {
  const ctx = engine.renderer.ctx;
  try {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#07111f';
    ctx.fillRect(0, 0, engine.width, engine.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(20, Math.round(engine.width / 28))}px sans-serif`;
    ctx.fillText('极速公路', engine.width / 2, engine.height * 0.47);
    ctx.fillStyle = '#8ecae6';
    ctx.font = `${Math.max(12, Math.round(engine.width / 60))}px sans-serif`;
    ctx.fillText('正在初始化画面…', engine.width / 2, engine.height * 0.56);
    ctx.restore();
  } catch (error) {
    console.error('[racer] boot screen render failed', error);
  }
}

function installFirstFrameGuard(engine: Engine, scene: RacerScene): void {
  const drawable = scene as unknown as DrawableScene;
  const originalDraw = drawable.draw;
  if (typeof originalDraw !== 'function') {
    throw new Error('RacerScene.draw is unavailable at runtime');
  }

  let firstFrameRendered = false;
  drawable.draw = (renderer: Renderer): void => {
    try {
      originalDraw.call(scene, renderer);
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        console.log('[racer] first_frame_rendered', {
          width: engine.width,
          height: engine.height,
          canvasWidth: engine.platform.canvas.width,
          canvasHeight: engine.platform.canvas.height,
          pixelRatio: engine.platform.getScreenInfo().pixelRatio
        });
      }
    } catch (error) {
      engine.stop();
      renderStatusScreen(engine, '极速公路渲染失败', '请查看 Console 中 [racer] 的首条错误', error);
    }
  };
}

export function startWeChatRacerGame(): WeChatRacerGame {
  const engine = new Engine(new WxPlatform());
  renderBootScreen(engine);

  try {
    installRacerCanvasCompatibility(engine.renderer.ctx);
    const scene = new RacerScene(engine);
    installFirstFrameGuard(engine, scene);

    bindWeChatLifecycle(scene);
    engine.setScene(scene);
    engine.start();

    return { engine, scene };
  } catch (error) {
    renderStatusScreen(engine, '极速公路启动失败', '请查看调试器 Console 中的首条红色错误', error);
    throw error;
  }
}
