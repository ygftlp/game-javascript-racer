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

interface WeChatGameGlobal {
  canvas?: WeChatCanvasLike;
}

declare const canvas: WeChatCanvasLike | undefined;
declare const GameGlobal: WeChatGameGlobal | undefined;

function runtimeHost(): WeChatRuntimeHost | null {
  try {
    const root = globalThis as unknown as { wx?: WeChatRuntimeHost };
    return root.wx ?? null;
  } catch {
    return null;
  }
}

function isCanvas(value: unknown): value is WeChatCanvasLike {
  return Boolean(value) && typeof (value as WeChatCanvasLike).getContext === 'function';
}

function resolveExistingMainCanvas(): WeChatCanvasLike | null {
  // WeChat's screen canvas is commonly exposed as a free global rather than a
  // normal globalThis property. Check those bindings before creating a canvas,
  // otherwise wx.createCanvas() can return a secondary/offscreen surface.
  try {
    if (typeof canvas !== 'undefined' && isCanvas(canvas)) return canvas;
  } catch {
    // Continue through the remaining runtime shapes.
  }

  try {
    if (typeof GameGlobal !== 'undefined' && isCanvas(GameGlobal?.canvas)) {
      return GameGlobal.canvas;
    }
  } catch {
    // Continue through the remaining runtime shapes.
  }

  try {
    const root = globalThis as unknown as {
      canvas?: WeChatCanvasLike;
      GameGlobal?: WeChatGameGlobal;
    };
    const candidate = root.canvas ?? root.GameGlobal?.canvas;
    return isCanvas(candidate) ? candidate : null;
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
    const canvasTarget = existingMainCanvas ?? (this.canvas as unknown as WeChatCanvasLike);
    const pixelRatio = Math.max(1, screen.pixelRatio || 1);

    canvasTarget.width = Math.round(screen.width * pixelRatio);
    canvasTarget.height = Math.round(screen.height * pixelRatio);

    Object.defineProperty(this, 'screen', {
      configurable: true,
      enumerable: true,
      value: screen
    });
    Object.defineProperty(this, 'canvas', {
      configurable: true,
      enumerable: true,
      value: canvasTarget
    });

    console.log('[racer] wechat_canvas_ready', {
      source: existingMainCanvas ? 'existing-main-canvas' : 'wx.createCanvas',
      width: screen.width,
      height: screen.height,
      pixelRatio,
      canvasWidth: canvasTarget.width,
      canvasHeight: canvasTarget.height,
      hasCanvasRaf: typeof canvasTarget.requestAnimationFrame === 'function'
    });
  }
}
