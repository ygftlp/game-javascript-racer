import { WxPlatform, type ScreenInfo } from '../../engine';

interface WeChatCanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): CanvasRenderingContext2D | null;
  requestAnimationFrame?: (callback: (time: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}

interface WeChatWindowInfo {
  windowWidth?: number;
  windowHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  pixelRatio?: number;
}

interface WeChatRuntimeHost {
  getWindowInfo?: () => WeChatWindowInfo;
  getSystemInfoSync?: () => WeChatWindowInfo;
}

function runtimeHost(): WeChatRuntimeHost | null {
  try {
    const root = globalThis as unknown as { wx?: WeChatRuntimeHost };
    return root.wx ?? null;
  } catch {
    return null;
  }
}

function resolveExistingMainCanvas(): WeChatCanvasLike | null {
  try {
    const root = globalThis as unknown as {
      canvas?: WeChatCanvasLike;
      GameGlobal?: { canvas?: WeChatCanvasLike };
    };
    const candidate = root.canvas ?? root.GameGlobal?.canvas;
    return candidate && typeof candidate.getContext === 'function' ? candidate : null;
  } catch {
    return null;
  }
}

function resolveWindowInfo(fallback: ScreenInfo): ScreenInfo {
  const host = runtimeHost();
  let info: WeChatWindowInfo | undefined;

  try {
    info = host?.getWindowInfo?.() ?? host?.getSystemInfoSync?.();
  } catch (error) {
    console.warn('[racer] failed to read WeChat window metrics; using engine fallback', error);
  }

  const width = Number(info?.windowWidth ?? info?.screenWidth);
  const height = Number(info?.windowHeight ?? info?.screenHeight);
  const pixelRatio = Number(info?.pixelRatio);

  return {
    width: Number.isFinite(width) && width > 0 ? width : fallback.width,
    height: Number.isFinite(height) && height > 0 ? height : fallback.height,
    pixelRatio: Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : fallback.pixelRatio
  };
}

export class RacerWechatPlatform extends WxPlatform {
  constructor() {
    const existingMainCanvas = resolveExistingMainCanvas();
    super();

    const screen = resolveWindowInfo(super.getScreenInfo());
    const canvas = existingMainCanvas ?? (this.canvas as unknown as WeChatCanvasLike);
    const pixelRatio = Math.max(1, screen.pixelRatio || 1);

    canvas.width = Math.round(screen.width * pixelRatio);
    canvas.height = Math.round(screen.height * pixelRatio);

    Object.defineProperty(this, 'screen', {
      configurable: true,
      enumerable: true,
      value: screen
    });
    Object.defineProperty(this, 'canvas', {
      configurable: true,
      enumerable: true,
      value: canvas
    });

    console.log('[racer] wechat_canvas_ready', {
      source: existingMainCanvas ? 'existing-main-canvas' : 'wx.createCanvas',
      width: screen.width,
      height: screen.height,
      pixelRatio,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      hasCanvasRaf: typeof canvas.requestAnimationFrame === 'function'
    });
  }
}
