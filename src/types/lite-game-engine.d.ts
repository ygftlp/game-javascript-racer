declare module 'lite-game-engine' {
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

  export type TouchHandler = (touches: TouchPoint[]) => void;

  export class Renderer {
    readonly ctx: CanvasRenderingContext2D;
    readonly width: number;
    readonly height: number;
    constructor(ctx: CanvasRenderingContext2D, width: number, height: number);
    clear(): void;
  }

  export class Texture {
    readonly image: unknown;
    loaded: boolean;
  }

  export class Audio {
    volume: number;
    play(loop?: boolean): void;
    pause(): void;
    stop(): void;
  }

  export class Loader {
    loadTexture(path: string): Promise<Texture>;
    loadAudio(path: string): Audio;
  }

  export class Input {
    onStart(handler: TouchHandler, options?: TouchSubscriptionOptions): void;
    offStart(handler: TouchHandler): void;
    onMove(handler: TouchHandler, options?: TouchSubscriptionOptions): void;
    offMove(handler: TouchHandler): void;
    onEnd(handler: TouchHandler, options?: TouchSubscriptionOptions): void;
    offEnd(handler: TouchHandler): void;
  }

  export class WxPlatform {
    getScreenInfo(): ScreenInfo;
    getStorage(key: string): string | null;
    setStorage(key: string, value: string): void;
  }

  export class Scene {
    update(dt: number): void;
    protected draw(renderer: Renderer): void;
  }

  export class Engine {
    readonly platform: WxPlatform;
    readonly renderer: Renderer;
    readonly input: Input;
    readonly loader: Loader;
    readonly width: number;
    readonly height: number;
    constructor(platform: WxPlatform);
    setScene(scene: Scene): void;
    start(): void;
    stop(): void;
  }
}
