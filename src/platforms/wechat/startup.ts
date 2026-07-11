import { Engine } from '../../engine';
import { installRacerCanvasCompatibility } from '../../racer/RacerCanvasCompat';
import { RacerV2FrontendScene } from '../../racer/frontend/RacerV2FrontendScene';
import { RacerScene } from '../../scenes/RacerScene';
import { startReliableWeChatRenderLoop } from './RacerWechatRenderLoop';
import { RacerWechatPlatform } from './RacerWechatPlatform';

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

function renderStatusScreen(engine: Engine, title: string, detail: string, error?: unknown): void {
  if (error !== undefined) console.error(`[racer] ${title}`, error);

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
    ctx.fillText(title, engine.width / 2, engine.height * 0.45);
    ctx.fillStyle = '#ffcc4d';
    ctx.font = `${Math.max(12, Math.round(engine.width / 55))}px sans-serif`;
    ctx.fillText(detail, engine.width / 2, engine.height * 0.56);
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

export function startWeChatRacerGame(): WeChatRacerGame {
  // RacerWechatPlatform replaces the legacy `new WxPlatform()` path so the
  // runtime can resolve the actual WeChat main canvas and window metrics.
  const engine = new Engine(new RacerWechatPlatform());
  renderBootScreen(engine);

  try {
    installRacerCanvasCompatibility(engine.renderer.ctx);
    const scene = new RacerScene(engine);
    const frontendScene = new RacerV2FrontendScene(scene);

    bindWeChatLifecycle(scene);
    engine.setScene(frontendScene);
    startReliableWeChatRenderLoop(engine, frontendScene);

    console.log('[racer] RUNTIME V2 FRONTEND');
    return { engine, scene };
  } catch (error) {
    renderStatusScreen(engine, '极速公路启动失败', '请查看调试器 Console 中的首条红色错误', error);
    throw error;
  }
}
