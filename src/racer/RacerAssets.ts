import type { Engine, Texture } from 'lite-game-engine';

export class RacerAssets {
  background: Texture | null = null;
  sprites: Texture | null = null;
  loaded = false;
  failed = false;

  async load(engine: Engine): Promise<void> {
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
}
