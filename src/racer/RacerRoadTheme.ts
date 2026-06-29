import { RACER_CONFIG, type RoadColor } from './config';

export interface RacerRoadTheme {
  id: string;
  name: string;
  description: string;
  light: RoadColor;
  dark: RoadColor;
  start: RoadColor;
  finish: RoadColor;
  fog: string;
}

export const COMMERCIAL_ASPHALT_ROAD_THEME: RacerRoadTheme = {
  id: 'commercial-asphalt-v1',
  name: 'Commercial Asphalt V1',
  description: 'Dark asphalt, clean lane markers, and high-contrast red-white rumble strips for a more publish-ready racer look.',
  light: {
    road: '#343941',
    grass: '#17643a',
    rumble: '#f2f4f7',
    lane: '#f4e7b2'
  },
  dark: {
    road: '#2c3037',
    grass: '#135532',
    rumble: '#e6403b',
    lane: ''
  },
  start: {
    road: '#f6f6f2',
    grass: '#e9ece4',
    rumble: '#f6f6f2',
    lane: ''
  },
  finish: {
    road: '#15171b',
    grass: '#15171b',
    rumble: '#f6f6f2',
    lane: ''
  },
  fog: 'rgba(21, 64, 45, 0.82)'
};

export const LEGACY_GREEN_ROAD_THEME: RacerRoadTheme = {
  id: 'legacy-green',
  name: 'Legacy Green',
  description: 'Original prototype palette retained for reference and regression comparison.',
  light: {
    road: '#6b6b6b',
    grass: '#10aa10',
    rumble: '#555555',
    lane: '#cccccc'
  },
  dark: {
    road: '#696969',
    grass: '#009a00',
    rumble: '#bbbbbb',
    lane: ''
  },
  start: {
    road: '#ffffff',
    grass: '#ffffff',
    rumble: '#ffffff',
    lane: ''
  },
  finish: {
    road: '#111111',
    grass: '#111111',
    rumble: '#eeeeee',
    lane: ''
  },
  fog: '#005108'
};

export const ACTIVE_RACER_ROAD_THEME = COMMERCIAL_ASPHALT_ROAD_THEME;

export function roadColorForSegment(index: number, theme: RacerRoadTheme = ACTIVE_RACER_ROAD_THEME): RoadColor {
  return Math.floor(index / RACER_CONFIG.rumbleLength) % 2 ? theme.dark : theme.light;
}
