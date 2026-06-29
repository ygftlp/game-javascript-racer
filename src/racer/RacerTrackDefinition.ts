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
  description: 'Default 3-lap pseudo-3D sprint course with straights, hills, and alternating left/right curve sections.',
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

export const ACTIVE_RACER_TRACK = DEFAULT_OUTRUN_TRACK;
export const TRACK_SECTIONS = ACTIVE_RACER_TRACK.sections;
