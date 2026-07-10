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
    description: '更稳但不迟钝，适合新手和小屏幕',
    joystickGain: 1.28,
    steerInputLimit: 1.14,
    steerResponse: 2.12
  },
  {
    id: 'standard',
    label: '标准',
    description: '更灵敏的默认街机手感',
    joystickGain: 1.68,
    steerInputLimit: 1.46,
    steerResponse: 2.72
  },
  {
    id: 'sensitive',
    label: '灵敏',
    description: '短行程快速转向，适合熟练玩家',
    joystickGain: 2.02,
    steerInputLimit: 1.72,
    steerResponse: 3.18
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
