export interface TouchPoint {
  id?: number;
  x: number;
  y: number;
}

export interface ScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface TouchSubscriptionOptions {
  persistent?: boolean;
}

type TouchHandler = (touches: TouchPoint[]) => void;

type AnyWx = {
  createCanvas?: () => CanvasLike;
  createImage?: () => ImageLike;
  createInnerAudioContext?: () => AudioLike;
  getSystemInfoSync?: () => Partial<ScreenInfo>;
  getStorageSync?: (key: string) => unknown;
  setStorageSync?: (key: string, value: string) => void;
  onTouchStart?: (handler: (event: TouchEventLike) => void) => void;
  onTouchMove?: (handler: (event: TouchEventLike) => void) => void;
  onTouchEnd?: (handler: (event: TouchEventLike) => void) => void;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (id: number) => void;
};

interface TouchEventLike {
  touches?: Array<{ identifier?: number; clientX?: number; clientY?: number; x?: number; y?: number }>;
  changedTouches?: Array<{ identifier?: number; clientX?: number; clientY?: number; x?: number; y?: number }>;
}

interface CanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): CanvasRenderingContext2D | null;
  addEventListener?: (type: string, handler: EventListener) => void;
}

interface ImageLike {
  src: string;
  width?: number;
  height?: number;
  onload?: () => void;
  onerror?: (error: unknown) => void;
}

interface AudioLike {
  src: string;
  loop?: boolean;
  volume?: number;
  play: () => void;
  pause: () => void;
  stop?: () => void;
}

declare const wx: AnyWx | undefined;

function getWx(): AnyWx | null {
  try {
    return typeof wx === 'undefined' ? null : wx;
  } catch {
    return null;
  }
}

function getWindowSize(): ScreenInfo {
  const host = getWx();
  const info = host?.getSystemInfoSync?.();
  if (info?.width && info?.height) {
    return {
      width: info.width,
      height: info.height,
      pixelRatio: info.pixelRatio || 1
    };
  }

  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth || 800,
      height: window.innerHeight || 450,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  return { width: 800, height: 450, pixelRatio: 1 };
}

function normalizeTouches(event: TouchEventLike): TouchPoint[] {
  const raw = event.touches?.length ? event.touches : event.changedTouches || [];
  return raw.map((touch, index) => ({
    id: touch.identifier ?? index,
    x: touch.clientX ?? touch.x ?? 0,
    y: touch.clientY ?? touch.y ?? 0
  }));
}

function requestFrame(callback: FrameRequestCallback): number {
  const host = getWx();
  if (host?.requestAnimationFrame) return host.requestAnimationFrame(callback);
  if (typeof requestAnimationFrame !== 'undefined') return requestAnimationFrame(callback);
  return setTimeout(() => callback(Date.now()), 1000 / 60) as unknown as number;
}

function cancelFrame(id: number): void {
  const host = getWx();
  if (host?.cancelAnimationFrame) {
    host.cancelAnimationFrame(id);
    return;
  }
  if (typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(id);
    return;
  }
  clearTimeout(id);
}

export class Renderer {
  constructor(readonly ctx: CanvasRenderingContext2D, readonly width: number, readonly height: number) {}

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

export class Texture {
  loaded = false;

  constructor(readonly image: ImageLike) {}
}

export class Audio {
  volume = 1;

  constructor(private readonly audio: AudioLike | null) {}

  play(loop = false): void {
    if (!this.audio) return;
    this.audio.loop = loop;
    this.audio.volume = this.volume;
    this.audio.play();
  }

  pause(): void {
    this.audio?.pause();
  }

  stop(): void {
    if (this.audio?.stop) this.audio.stop();
    else this.audio?.pause();
  }
}

export class Loader {
  loadTexture(path: string): Promise<Texture> {
    const host = getWx();
    const image = host?.createImage?.() || (typeof Image !== 'undefined' ? new Image() : null);

    if (!image) {
      return Promise.reject(new Error(`No image factory available for ${path}`));
    }

    const texture = new Texture(image as ImageLike);
    return new Promise((resolve, reject) => {
      image.onload = () => {
        texture.loaded = true;
        resolve(texture);
      };
      image.onerror = reject;
      image.src = path;
    });
  }

  loadAudio(path: string): Audio {
    const host = getWx();
    const audio = host?.createInnerAudioContext?.() || (typeof document !== 'undefined' ? document.createElement('audio') : null);
    if (!audio) return new Audio(null);
    audio.src = path;
    return new Audio(audio as AudioLike);
  }
}

export class Input {
  private readonly startHandlers = new Set<TouchHandler>();
  private readonly moveHandlers = new Set<TouchHandler>();
  private readonly endHandlers = new Set<TouchHandler>();

  constructor(private readonly canvas: CanvasLike) {
    this.bindTouchEvents();
  }

  onStart(handler: TouchHandler, _options?: TouchSubscriptionOptions): void {
    this.startHandlers.add(handler);
  }

  offStart(handler: TouchHandler): void {
    this.startHandlers.delete(handler);
  }

  onMove(handler: TouchHandler, _options?: TouchSubscriptionOptions): void {
    this.moveHandlers.add(handler);
  }

  offMove(handler: TouchHandler): void {
    this.moveHandlers.delete(handler);
  }

  onEnd(handler: TouchHandler, _options?: TouchSubscriptionOptions): void {
    this.endHandlers.add(handler);
  }

  offEnd(handler: TouchHandler): void {
    this.endHandlers.delete(handler);
  }

  private bindTouchEvents(): void {
    const host = getWx();
    if (host?.onTouchStart) {
      host.onTouchStart((event) => this.emit(this.startHandlers, normalizeTouches(event)));
      host.onTouchMove?.((event) => this.emit(this.moveHandlers, normalizeTouches(event)));
      host.onTouchEnd?.((event) => this.emit(this.endHandlers, normalizeTouches(event)));
      return;
    }

    this.canvas.addEventListener?.('touchstart', (event) => {
      const touchEvent = event as TouchEvent;
      this.emit(this.startHandlers, Array.from(touchEvent.touches).map((touch, index) => ({ id: touch.identifier ?? index, x: touch.clientX, y: touch.clientY })));
    });
    this.canvas.addEventListener?.('touchmove', (event) => {
      const touchEvent = event as TouchEvent;
      this.emit(this.moveHandlers, Array.from(touchEvent.touches).map((touch, index) => ({ id: touch.identifier ?? index, x: touch.clientX, y: touch.clientY })));
    });
    this.canvas.addEventListener?.('touchend', (event) => {
      const touchEvent = event as TouchEvent;
      this.emit(this.endHandlers, Array.from(touchEvent.changedTouches).map((touch, index) => ({ id: touch.identifier ?? index, x: touch.clientX, y: touch.clientY })));
    });
  }

  private emit(handlers: Set<TouchHandler>, touches: TouchPoint[]): void {
    for (const handler of handlers) handler(touches);
  }
}

export class WxPlatform {
  readonly canvas: CanvasLike;
  readonly screen: ScreenInfo;

  constructor() {
    this.screen = getWindowSize();
    this.canvas = this.createCanvas();
    const pixelRatio = Math.max(1, this.screen.pixelRatio || 1);
    this.canvas.width = Math.round(this.screen.width * pixelRatio);
    this.canvas.height = Math.round(this.screen.height * pixelRatio);

    if (typeof document !== 'undefined' && 'style' in this.canvas) {
      const styled = this.canvas as CanvasLike & { style?: { width: string; height: string } };
      if (styled.style) {
        styled.style.width = `${this.screen.width}px`;
        styled.style.height = `${this.screen.height}px`;
      }
    }
  }

  getScreenInfo(): ScreenInfo {
    return this.screen;
  }

  getStorage(key: string): string | null {
    const host = getWx();
    if (host?.getStorageSync) {
      const value = host.getStorageSync(key);
      return value == null ? null : String(value);
    }
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    return null;
  }

  setStorage(key: string, value: string): void {
    const host = getWx();
    if (host?.setStorageSync) {
      host.setStorageSync(key, value);
      return;
    }
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  }

  private createCanvas(): CanvasLike {
    const host = getWx();
    const wxCanvas = host?.createCanvas?.();
    if (wxCanvas) return wxCanvas;

    if (typeof document !== 'undefined') {
      const existing = document.querySelector('canvas') as HTMLCanvasElement | null;
      const canvas = existing || document.createElement('canvas');
      if (!existing) document.body.appendChild(canvas);
      return canvas;
    }

    throw new Error('No canvas factory available');
  }
}

export class Scene {
  update(_dt: number): void {}

  protected draw(_renderer: Renderer): void {}
}

export class Engine {
  readonly platform: WxPlatform;
  readonly renderer: Renderer;
  readonly input: Input;
  readonly loader = new Loader();
  readonly width: number;
  readonly height: number;

  private scene: Scene | null = null;
  private running = false;
  private frameId = 0;
  private lastTime = 0;

  constructor(platform: WxPlatform) {
    this.platform = platform;
    this.width = platform.screen.width;
    this.height = platform.screen.height;

    const ctx = platform.canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context is not available');

    const pixelRatio = Math.max(1, platform.screen.pixelRatio || 1);
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingEnabled = false;

    this.renderer = new Renderer(ctx, this.width, this.height);
    this.input = new Input(platform.canvas);
  }

  setScene(scene: Scene): void {
    this.scene = scene;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = Date.now();
    this.frameId = requestFrame((time) => this.tick(time));
  }

  stop(): void {
    this.running = false;
    cancelFrame(this.frameId);
  }

  private tick(time: number): void {
    if (!this.running) return;

    const now = time || Date.now();
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;

    this.scene?.update(dt);
    this.renderer.clear();
    (this.scene as { draw?: (renderer: Renderer) => void } | null)?.draw?.(this.renderer);

    this.frameId = requestFrame((nextTime) => this.tick(nextTime));
  }
}
