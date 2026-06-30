import type { Engine } from '../engine';
import { DEFAULT_RACER_CONTROL_SENSITIVITY, findRacerControlSensitivity, type RacerControlSensitivityId } from './RacerControlSensitivity';

const AUDIO_MUTED_KEY = 'racer.v4.audio_muted';
const FIRST_RACE_COACH_SHOWN_KEY = 'racer.v4.first_race_coach_shown';
const MINI_MAP_ENABLED_KEY = 'racer.v4.mini_map_enabled';
const CONTROL_COACH_ENABLED_KEY = 'racer.v4.control_coach_enabled';
const CONTROL_SENSITIVITY_KEY = 'racer.v4.control_sensitivity';
const SELECTED_TRACK_ID_KEY = 'racer.v4.selected_track_id';

export class RacerSettings {
  constructor(private readonly engine: Engine) {}

  isAudioMuted(): boolean {
    return this.engine.platform.getStorage(AUDIO_MUTED_KEY) === 'true';
  }

  setAudioMuted(value: boolean): void {
    this.engine.platform.setStorage(AUDIO_MUTED_KEY, String(value));
  }

  isMiniMapEnabled(): boolean {
    const value = this.engine.platform.getStorage(MINI_MAP_ENABLED_KEY);
    return value === '' || value === null || value === undefined ? true : value !== 'false';
  }

  setMiniMapEnabled(value: boolean): void {
    this.engine.platform.setStorage(MINI_MAP_ENABLED_KEY, String(value));
  }

  isControlCoachEnabled(): boolean {
    const value = this.engine.platform.getStorage(CONTROL_COACH_ENABLED_KEY);
    return value === '' || value === null || value === undefined ? true : value !== 'false';
  }

  setControlCoachEnabled(value: boolean): void {
    this.engine.platform.setStorage(CONTROL_COACH_ENABLED_KEY, String(value));
  }

  getControlSensitivityId(): RacerControlSensitivityId {
    const value = this.engine.platform.getStorage(CONTROL_SENSITIVITY_KEY);
    return findRacerControlSensitivity(value).id;
  }

  setControlSensitivityId(value: RacerControlSensitivityId): void {
    const profile = findRacerControlSensitivity(value);
    this.engine.platform.setStorage(CONTROL_SENSITIVITY_KEY, profile.id);
  }

  resetControlSensitivity(): void {
    this.setControlSensitivityId(DEFAULT_RACER_CONTROL_SENSITIVITY.id);
  }

  hasShownFirstRaceCoach(): boolean {
    return this.engine.platform.getStorage(FIRST_RACE_COACH_SHOWN_KEY) === 'true';
  }

  setFirstRaceCoachShown(value: boolean): void {
    this.engine.platform.setStorage(FIRST_RACE_COACH_SHOWN_KEY, String(value));
  }

  resetFirstRaceCoach(): void {
    this.setFirstRaceCoachShown(false);
  }

  getSelectedTrackId(): string | null {
    const value = this.engine.platform.getStorage(SELECTED_TRACK_ID_KEY);
    return value && value.trim() ? value : null;
  }

  setSelectedTrackId(trackId: string): void {
    if (!trackId.trim()) return;
    this.engine.platform.setStorage(SELECTED_TRACK_ID_KEY, trackId);
  }
}
