export type RacerPerformanceProfile = 'low' | 'medium' | 'high';

export interface RacerTuning {
  profile: RacerPerformanceProfile;
  drawDistance: number;
  totalCars: number;
  /** Compatibility alias used by the active racer state. */
  trafficCount: number;
  label: string;
}

export const RACER_TUNING_PRESETS: Record<RacerPerformanceProfile, RacerTuning> = {
  low: {
    profile: 'low',
    drawDistance: 160,
    totalCars: 45,
    trafficCount: 45,
    label: 'Low'
  },
  medium: {
    profile: 'medium',
    drawDistance: 220,
    totalCars: 70,
    trafficCount: 70,
    label: 'Medium'
  },
  high: {
    profile: 'high',
    drawDistance: 280,
    totalCars: 95,
    trafficCount: 95,
    label: 'High'
  }
};

export function resolveRacerTuning(width: number, height: number, pixelRatio = 1): RacerTuning {
  const logicalPixels = width * height;
  const pressure = logicalPixels * Math.max(1, pixelRatio * 0.5);

  if (pressure < 520_000) return RACER_TUNING_PRESETS.low;
  if (pressure < 1_250_000) return RACER_TUNING_PRESETS.medium;
  return RACER_TUNING_PRESETS.high;
}
