import type { Audio, Engine, Texture } from 'lite-game-engine';
import { ACTIVE_RACER_ASSET_PACK, type RacerAssetPackManifest } from './RacerAssetManifest';

export type RacerAssetStatus = 'idle' | 'loading' | 'ready' | 'fallback';

export class RacerAssets {
  background: Texture | null = null;
  sprites: Texture | null = null;
  music: Audio | null = null;
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
    this.loadMusic(engine);

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
    if (muted) this.pauseMusic();
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playMusic(): void {
    if (this.muted) return;

    try {
      this.music?.play(true);
    } catch (error) {
      console.warn('[racer] music playback failed', error);
    }
  }

  pauseMusic(): void {
    try {
      this.music?.pause();
    } catch {
      // Audio is optional and should never block gameplay.
    }
  }

  stopMusic(): void {
    try {
      this.music?.stop();
    } catch {
      // Audio is optional and should never block gameplay.
    }
  }

  private loadMusic(engine: Engine): void {
    if (!this.pack.audio.music) return;

    try {
      this.music = engine.loader.loadAudio(this.pack.audio.music);
      this.music.volume = 0.05;
    } catch (error) {
      console.warn('[racer] music loading failed', error);
    }
  }
}
