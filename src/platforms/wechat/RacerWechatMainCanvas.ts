interface WeChatCanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): CanvasRenderingContext2D | null;
}

interface WeChatCanvasHost {
  createCanvas?: () => WeChatCanvasLike;
}

interface WeChatGameGlobal {
  canvas?: WeChatCanvasLike;
}

declare const wx: WeChatCanvasHost | undefined;
declare const GameGlobal: WeChatGameGlobal | undefined;
declare const canvas: WeChatCanvasLike | undefined;

function isCanvas(value: unknown): value is WeChatCanvasLike {
  return Boolean(value) && typeof (value as WeChatCanvasLike).getContext === 'function';
}

function findPublishedCanvas(): WeChatCanvasLike | null {
  try {
    if (typeof canvas !== 'undefined' && isCanvas(canvas)) return canvas;
  } catch {
    // Continue through the other WeChat global shapes.
  }

  try {
    if (typeof GameGlobal !== 'undefined' && isCanvas(GameGlobal?.canvas)) {
      return GameGlobal.canvas;
    }
  } catch {
    // Continue through the other WeChat global shapes.
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

function publishCanvas(mainCanvas: WeChatCanvasLike): void {
  try {
    const root = globalThis as unknown as {
      canvas?: WeChatCanvasLike;
      GameGlobal?: WeChatGameGlobal;
    };
    root.canvas = mainCanvas;
    if (!root.GameGlobal) root.GameGlobal = {};
    root.GameGlobal.canvas = mainCanvas;
  } catch (error) {
    console.warn('[racer] unable to publish main canvas on globalThis', error);
  }

  try {
    if (typeof GameGlobal !== 'undefined') GameGlobal.canvas = mainCanvas;
  } catch (error) {
    console.warn('[racer] unable to publish main canvas on GameGlobal', error);
  }
}

export function ensureWeChatMainCanvas(): WeChatCanvasLike {
  const existing = findPublishedCanvas();
  if (existing) {
    publishCanvas(existing);
    console.log('[racer] main_canvas_bootstrap', { source: 'existing' });
    return existing;
  }

  let host: WeChatCanvasHost | null = null;
  try {
    host = typeof wx === 'undefined' ? null : wx;
  } catch {
    host = null;
  }

  const created = host?.createCanvas?.();
  if (!created) throw new Error('WeChat main canvas could not be created');

  publishCanvas(created);
  console.log('[racer] main_canvas_bootstrap', { source: 'wx.createCanvas' });
  return created;
}
