export const RACER_CONFIG = {
  fps: 60,
  roadWidth: 2000,
  segmentLength: 200,
  rumbleLength: 3,
  lanes: 3,
  fieldOfView: 100,
  cameraHeight: 1000,
  drawDistance: 260,
  centrifugal: 0.3,
  maxSpeed: 9000,
  acceleration: 2200,
  braking: -6200,
  deceleration: -1800,
  offRoadDeceleration: -4200,
  offRoadLimit: 2600
} as const;

export interface RoadColor {
  road: string;
  grass: string;
  rumble: string;
  lane: string;
}

export const COLORS = {
  sky: '#72d7ee',
  farHill: '#6ab06e',
  nearHill: '#2f8d45',
  fog: '#005108',
  light: { road: '#6b6b6b', grass: '#10aa10', rumble: '#555555', lane: '#cccccc' },
  dark: { road: '#696969', grass: '#009a00', rumble: '#bbbbbb', lane: '' },
  start: { road: '#ffffff', grass: '#ffffff', rumble: '#ffffff', lane: '' },
  finish: { road: '#111111', grass: '#111111', rumble: '#eeeeee', lane: '' },
  player: '#f6d365',
  playerTrim: '#fda085',
  hud: '#ffffff',
  hudShadow: 'rgba(0, 0, 0, 0.55)'
} as const;

export interface TrackSection {
  length: number;
  curve: number;
  hill: number;
}

export const TRACK_SECTIONS: TrackSection[] = [
  { length: 45, curve: 0, hill: 0 },
  { length: 60, curve: 1.6, hill: 18 },
  { length: 45, curve: -2.2, hill: -8 },
  { length: 70, curve: 0.8, hill: 28 },
  { length: 35, curve: 0, hill: -16 },
  { length: 80, curve: -2.8, hill: 4 },
  { length: 65, curve: 2.4, hill: -20 },
  { length: 90, curve: 0, hill: 0 },
  { length: 60, curve: -1.8, hill: 24 },
  { length: 70, curve: 2.6, hill: -28 },
  { length: 120, curve: 0, hill: 0 }
];
