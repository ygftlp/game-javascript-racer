import type { RoadColor } from './config';

export interface RacerRoadTheme {
  light: RoadColor;
  dark: RoadColor;
  start: RoadColor;
  finish: RoadColor;
  fog: string;
}

export const COMMERCIAL_ASPHALT_ROAD_THEME: RacerRoadTheme = {
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
