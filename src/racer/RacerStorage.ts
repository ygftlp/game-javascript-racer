import type { Engine } from '../engine';

const FAST_LAP_KEY = 'racer.v4.fast_lap_time';

export class RacerStorage {
  constructor(private readonly engine: Engine) {}

  getBestLapTime(): number {
    const raw = this.engine.platform.getStorage(FAST_LAP_KEY);
    if (!raw) return 0;

    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  setBestLapTime(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    this.engine.platform.setStorage(FAST_LAP_KEY, String(seconds));
  }
}
