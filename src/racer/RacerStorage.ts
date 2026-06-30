import type { Engine } from '../engine';

const FAST_LAP_KEY = 'racer.v4.fast_lap_time';

function bestLapKey(trackId?: string): string {
  return trackId ? `${FAST_LAP_KEY}.${trackId}` : FAST_LAP_KEY;
}

export class RacerStorage {
  constructor(private readonly engine: Engine) {}

  getBestLapTime(trackId?: string): number {
    const raw = this.engine.platform.getStorage(bestLapKey(trackId)) || (!trackId ? '' : this.engine.platform.getStorage(FAST_LAP_KEY));
    if (!raw) return 0;

    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  setBestLapTime(seconds: number, trackId?: string): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    this.engine.platform.setStorage(bestLapKey(trackId), String(seconds));
  }
}
