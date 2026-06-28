import { Engine, WxPlatform } from 'lite-game-engine';
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

export function startWeChatRacerGame(): WeChatRacerGame {
  const engine = new Engine(new WxPlatform());
  const scene = new RacerScene(engine);

  bindWeChatLifecycle(scene);
  engine.setScene(scene);
  engine.start();

  return { engine, scene };
}
