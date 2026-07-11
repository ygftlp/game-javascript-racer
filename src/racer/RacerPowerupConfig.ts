export const RACER_POWERUP_CONFIG = {
  boost: {
    duration: 2,
    accelerationMultiplier: 1.45,
    speedLimitMultiplier: 1.12,
    minPickupSpeedMultiplier: 0.78
  },
  nitro: {
    pickupCharge: 50,
    maxCharge: 100,
    drainPerSecond: 22,
    accelerationMultiplier: 2.05,
    speedLimitMultiplier: 1.28
  },
  slow: {
    duration: 2.3,
    accelerationMultiplier: 0.45,
    speedLimitMultiplier: 0.62,
    maxHitSpeedMultiplier: 0.42
  },
  respawn: {
    minSeconds: 10,
    maxSeconds: 14
  }
} as const;

export const RACER_POWERUP_LANES = [-0.58, 0, 0.58] as const;
export const RACER_POWERUP_SEQUENCE = ['boost', 'nitro', 'boost', 'slow'] as const;
