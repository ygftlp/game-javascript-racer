import { Engine, WxPlatform } from '../../engine';
import { installRacerCanvasCompatibility } from '../../racer/RacerCanvasCompat';
import { RacerScene } from '../../scenes/RacerScene';

interface WeChatLifecycleHost {
  onHide?: (handler: () => void) => void;
  onShow?: (handler: () => void) => void;
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

function renderStartupFailure(engine: Engine, error: unknown): void {
  console.error('[racer] WeChat startup failed', error);
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
    ctx.fillText('极速公路启动失败', width / 2, height * 0.45);
    ctx.fillStyle = '#ffcc4d';
    ctx.font = `${Math.max(12, Math.round(width / 55))}px sans-serif`;
    ctx.fillText('请打开调试器 Console 查看首条红色错误', width / 2, height * 0.56);
    ctx.restore();
  } catch (renderError) {
    console.error('[racer] Failed to render startup error screen', renderError);
  }
}

export function startWeChatRacerGame(): WeChatRacerGame {
  const engine = new Engine(new WxPlatform());

  try {
    installRacerCanvasCompatibility(engine.renderer.ctx);
    const scene = new RacerScene(engine);

    bindWeChatLifecycle(scene);
    engine.setScene(scene);
    engine.start();

    return { engine, scene };
  } catch (error) {
    renderStartupFailure(engine, error);
    throw error;
  }
}
