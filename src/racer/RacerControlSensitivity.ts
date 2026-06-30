export type RacerControlSensitivityId = 'comfort' | 'standard' | 'sensitive';

export interface RacerControlSensitivityProfile {
  id: RacerControlSensitivityId;
  label: string;
  description: string;
  joystickGain: number;
  steerInputLimit: number;
  steerResponse: number;
}

export const RACER_CONTROL_SENSITIVITY_PROFILES: readonly RacerControlSensitivityProfile[] = [
  {
    id: 'comfort',
    label: '舒适',
    description: '更稳，适合新手和小屏幕',
    joystickGain: 1.14,
    steerInputLimit: 1.08,
    steerResponse: 1.95
  },
  {
    id: 'standard',
    label: '标准',
    description: '默认街机手感',
    joystickGain: 1.45,
    steerInputLimit: 1.35,
    steerResponse: 2.35
  },
  {
    id: 'sensitive',
    label: '灵敏',
    description: '更快响应，适合熟练玩家',
    joystickGain: 1.72,
    steerInputLimit: 1.55,
    steerResponse: 2.78
  }
];

export const DEFAULT_RACER_CONTROL_SENSITIVITY = RACER_CONTROL_SENSITIVITY_PROFILES[1];

export function findRacerControlSensitivity(id: string | null | undefined): RacerControlSensitivityProfile {
  return RACER_CONTROL_SENSITIVITY_PROFILES.find((profile) => profile.id === id) ?? DEFAULT_RACER_CONTROL_SENSITIVITY;
}

export function nextRacerControlSensitivity(id: RacerControlSensitivityId): RacerControlSensitivityProfile {
  const index = RACER_CONTROL_SENSITIVITY_PROFILES.findIndex((profile) => profile.id === id);
  return RACER_CONTROL_SENSITIVITY_PROFILES[(index + 1) % RACER_CONTROL_SENSITIVITY_PROFILES.length] ?? DEFAULT_RACER_CONTROL_SENSITIVITY;
}
