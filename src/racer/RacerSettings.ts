import type { Engine } from '../engine';

const AUDIO_MUTED_KEY = 'racer.v4.audio_muted';
const FIRST_RACE_COACH_SHOWN_KEY = 'racer.v4.first_race_coach_shown';

export class RacerSettings {
  constructor(private readonly engine: Engine) {}

  isAudioMuted(): boolean {
    return this.engine.platform.getStorage(AUDIO_MUTED_KEY) === 'true';
  }

  setAudioMuted(value: boolean): void {
    this.engine.platform.setStorage(AUDIO_MUTED_KEY, String(value));
  }

  hasShownFirstRaceCoach(): boolean {
    return this.engine.platform.getStorage(FIRST_RACE_COACH_SHOWN_KEY) === 'true';
  }

  setFirstRaceCoachShown(value: boolean): void {
    this.engine.platform.setStorage(FIRST_RACE_COACH_SHOWN_KEY, String(value));
  }
}
