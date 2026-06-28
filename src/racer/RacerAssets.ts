import type { Audio, Engine, Texture } from 'lite-game-engine';
import { ACTIVE_RACER_ASSET_PACK, type RacerAssetPackManifest } from './RacerAssetManifest';

export type RacerAssetStatus = 'idle' | 'loading' | 'ready' | 'fallback';

export class RacerAssets {
  background: Texture | null = null;
  sprites: Texture | null = null;
  music: Audio | null = null;
  engineLoop: Audio | null = null;
  crash: Audio | null = null;
  menuConfirm: Audio | null = null;
  status: RacerAssetStatus = 'idle';
  loaded = false;
  failed = false;
  muted = false;

  constructor(readonly pack: RacerAssetPackManifest = ACTIVE_RACER_ASSET_PACK) {}

  get packLabel(): string {
    return this.pack.label;
  }

  get commercialSafe(): boolean {
    return this.pack.commercialSafe;
  }

  get statusLabel(): string {
    if (this.status === 'ready') return 'Assets ready';
    if (this.status === 'fallback') return 'Fallback drawing';
    if (this.status === 'loading') return 'Loading assets...';
    return 'Assets idle';
  }

  async load(engine: Engine): Promise<void> {
    this.status = 'loading';
    this.loadAudio(engine);

    try {
      const [background, sprites] = await Promise.all([
        engine.loader.loadTexture(this.pack.images.backgroundAtlas),
        engine.loader.loadTexture(this.pack.images.spriteAtlas)
      ]);
      this.background = background;
      this.sprites = sprites;
      this.loaded = true;
      this.failed = false;
      this.status = 'ready';
    } catch (error) {
      this.failed = true;
      this.loaded = false;
      this.status = 'fallback';
      console.warn('[racer] texture loading failed, using procedural fallback', error);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.pauseMusic();
      this.stopEngineLoop();
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playMusic(): void {
    if (this.muted) return;
    this.playAudio(this.music, true, 'music');
    this.playEngineLoop();
  }

  pauseMusic(): void {
    this.pauseAudio(this.music);
    this.pauseAudio(this.engineLoop);
  }

  stopMusic(): void {
    this.stopAudio(this.music);
    this.stopEngineLoop();
  }

  playEngineLoop(): void {
    if (this.muted) return;
    this.playAudio(this.engineLoop, true, 'engine loop');
  }

  stopEngineLoop(): void {
    this.stopAudio(this.engineLoop);
  }

  playCrash(): void {
    this.playSfx(this.crash, 'crash');
  }

  playMenuConfirm(): void {
    this.playSfx(this.menuConfirm, 'menu confirm');
  }

  private loadAudio(engine: Engine): void {
    this.music = this.loadOptionalAudio(engine, this.pack.audio.music, 'music');
    this.engineLoop = this.loadOptionalAudio(engine, this.pack.audio.engineLoop, 'engine loop');
    this.crash = this.loadOptionalAudio(engine, this.pack.audio.crash, 'crash');
    this.menuConfirm = this.loadOptionalAudio(engine, this.pack.audio.menuConfirm, 'menu confirm');

    if (this.music) this.music.volume = 0.05;
    if (this.engineLoop) this.engineLoop.volume = 0.04;
    if (this.crash) this.crash.volume = 0.12;
    if (this.menuConfirm) this.menuConfirm.volume = 0.08;
  }

  private loadOptionalAudio(engine: Engine, path: string | undefined, label: string): Audio | null {
    if (!path) return null;

    try {
      return engine.loader.loadAudio(path);
    } catch (error) {
      console.warn(`[racer] ${label} audio loading failed`, error);
      return null;
    }
  }

  private playSfx(audio: Audio | null, label: string): void {
    if (this.muted) return;
    this.playAudio(audio, false, label);
  }

  private playAudio(audio: Audio | null, loop: boolean, label: string): void {
    try {
      audio?.play(loop);
    } catch (error) {
      console.warn(`[racer] ${label} playback failed`, error);
    }
  }

  private pauseAudio(audio: Audio | null): void {
    try {
      audio?.pause();
    } catch {
      // Audio is optional and should never block gameplay.
    }
  }

  private stopAudio(audio: Audio | null): void {
    try {
      audio?.stop();
    } catch {
      // Audio is optional and should never block gameplay.
    }
  }
}
