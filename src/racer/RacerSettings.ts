import type { Engine } from 'lite-game-engine';

const AUDIO_MUTED_KEY = 'racer.v4.audio_muted';

export class RacerSettings {
  constructor(private readonly engine: Engine) {}

  isAudioMuted(): boolean {
    return this.engine.platform.getStorage(AUDIO_MUTED_KEY) === 'true';
  }

  setAudioMuted(muted: boolean): void {
    this.engine.platform.setStorage(AUDIO_MUTED_KEY, String(muted));
  }
}
