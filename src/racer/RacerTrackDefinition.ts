import type { TrackSection } from './config';
import { COMMERCIAL_ASPHALT_ROAD_THEME, type RacerRoadTheme } from './RacerRoadTheme';

export type RacerRoadsideTheme = 'legacy' | 'coast' | 'city' | 'desert' | 'night';

export interface RacerTrackDefinition {
  id: string;
  name: string;
  description: string;
  sections: TrackSection[];
  roadTheme: RacerRoadTheme;
  roadsideTheme: RacerRoadsideTheme;
  targetLaps: number;
}

export const DEFAULT_OUTRUN_TRACK: RacerTrackDefinition = {
  id: 'default-outrun-loop',
  name: '极速公路',
  description: '默认 3 圈冲刺赛道，包含直道、坡道和左右交替弯道。',
  roadTheme: COMMERCIAL_ASPHALT_ROAD_THEME,
  roadsideTheme: 'legacy',
  targetLaps: 3,
  sections: [
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
  ]
};

export const COAST_SPRINT_TRACK: RacerTrackDefinition = {
  id: 'coast-sprint',
  name: '海岸冲刺',
  description: '更短的高速海岸赛道，适合快速开局和移动端碎片化体验。',
  roadTheme: COMMERCIAL_ASPHALT_ROAD_THEME,
  roadsideTheme: 'coast',
  targetLaps: 2,
  sections: [
    { length: 72, curve: 0, hill: 0 },
    { length: 64, curve: 1.2, hill: 10 },
    { length: 54, curve: -1.7, hill: -8 },
    { length: 92, curve: 0.5, hill: 16 },
    { length: 46, curve: 0, hill: -12 },
    { length: 76, curve: -2.1, hill: 4 },
    { length: 86, curve: 1.8, hill: -10 },
    { length: 120, curve: 0, hill: 0 }
  ]
};

export const CITY_NIGHT_TRACK: RacerTrackDefinition = {
  id: 'city-night-run',
  name: '城市夜跑',
  description: '更密集的夜间城市节奏赛道，弯道更多，适合后续加入霓虹视觉主题。',
  roadTheme: COMMERCIAL_ASPHALT_ROAD_THEME,
  roadsideTheme: 'night',
  targetLaps: 3,
  sections: [
    { length: 56, curve: 0, hill: 0 },
    { length: 48, curve: -1.6, hill: 6 },
    { length: 58, curve: 2.1, hill: -6 },
    { length: 42, curve: -2.4, hill: 10 },
    { length: 70, curve: 0, hill: -8 },
    { length: 52, curve: 1.9, hill: 12 },
    { length: 62, curve: -1.3, hill: -10 },
    { length: 84, curve: 2.6, hill: 0 },
    { length: 96, curve: 0, hill: 0 }
  ]
};

export const RACER_TRACKS: readonly RacerTrackDefinition[] = [
  DEFAULT_OUTRUN_TRACK,
  COAST_SPRINT_TRACK,
  CITY_NIGHT_TRACK
];

export const ACTIVE_RACER_TRACK = DEFAULT_OUTRUN_TRACK;
export const TRACK_SECTIONS = ACTIVE_RACER_TRACK.sections;

export function findRacerTrackById(trackId: string): RacerTrackDefinition {
  return RACER_TRACKS.find((track) => track.id === trackId) ?? ACTIVE_RACER_TRACK;
}

export function getNextRacerTrack(currentTrackId: string): RacerTrackDefinition {
  const index = RACER_TRACKS.findIndex((track) => track.id === currentTrackId);
  return RACER_TRACKS[(index + 1 + RACER_TRACKS.length) % RACER_TRACKS.length];
}

export function racerTrackIndex(trackId: string): number {
  return Math.max(0, RACER_TRACKS.findIndex((track) => track.id === trackId));
}
