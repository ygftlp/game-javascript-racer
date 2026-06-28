import type { Audio, Engine, Texture } from 'lite-game-engine';

export class RacerAssets {
  background: Texture | null = null;
  sprites: Texture | null = null;
  music: Audio | null = null;
  loaded = false;
  failed = false;

  async load(engine: Engine): Promise<void> {
    this.loadMusic(engine);

    try {
      const [background, sprites] = await Promise.all([
        engine.loader.loadTexture('images/background.png'),
        engine.loader.loadTexture('images/sprites.png')
      ]);
      this.background = background;
      this.sprites = sprites;
      this.loaded = true;
    } catch (error) {
      this.failed = true;
      console.warn('[racer] texture loading failed, using procedural fallback', error);
    }
  }

  playMusic(): void {
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
    try {
      this.music = engine.loader.loadAudio('music/racer.mp3');
      this.music.volume = 0.05;
    } catch (error) {
      console.warn('[racer] music loading failed', error);
    }
  }
}
