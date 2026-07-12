import type { RacerRoadsideTheme } from './RacerTrackDefinition';
import type { AtlasFrame } from './SpriteAtlas';

export interface RacerBackgroundLayerStyle {
  frame: AtlasFrame;
  yRatio: number;
  heightRatio: number;
  parallax: number;
  verticalResponse: number;
  alpha: number;
}

export interface RacerBackgroundTheme {
  skyTop: string;
  skyBottom: string;
  sun: string;
  haze: string;
  fallbackFar: string;
  fallbackNear: string;
  atlasTint: string;
}

const THEMES: Record<RacerRoadsideTheme, RacerBackgroundTheme> = {
  legacy: {
    skyTop: '#8fd4e3',
    skyBottom: '#d8edf0',
    sun: 'rgba(255, 222, 139, 0.58)',
    haze: 'rgba(202, 227, 218, 0.46)',
    fallbackFar: '#638d79',
    fallbackNear: '#214f3f',
    atlasTint: 'rgba(29, 71, 55, 0.18)'
  },
  coast: {
    skyTop: '#75c9df',
    skyBottom: '#e2f2ed',
    sun: 'rgba(255, 217, 128, 0.68)',
    haze: 'rgba(193, 231, 229, 0.5)',
    fallbackFar: '#6f9fa3',
    fallbackNear: '#285b58',
    atlasTint: 'rgba(24, 83, 81, 0.16)'
  },
  city: {
    skyTop: '#33465f',
    skyBottom: '#8190a0',
    sun: 'rgba(255, 196, 110, 0.32)',
    haze: 'rgba(91, 112, 132, 0.48)',
    fallbackFar: '#45586b',
    fallbackNear: '#1f2e3d',
    atlasTint: 'rgba(20, 31, 47, 0.28)'
  },
  desert: {
    skyTop: '#83c9dc',
    skyBottom: '#f2d6a2',
    sun: 'rgba(255, 219, 132, 0.72)',
    haze: 'rgba(234, 195, 139, 0.42)',
    fallbackFar: '#b28b61',
    fallbackNear: '#6f5a43',
    atlasTint: 'rgba(105, 77, 48, 0.18)'
  },
  night: {
    skyTop: '#111b32',
    skyBottom: '#354768',
    sun: 'rgba(151, 188, 255, 0.26)',
    haze: 'rgba(56, 76, 112, 0.54)',
    fallbackFar: '#293c59',
    fallbackNear: '#101c2e',
    atlasTint: 'rgba(10, 20, 38, 0.42)'
  }
};

export function racerBackgroundTheme(theme: RacerRoadsideTheme): RacerBackgroundTheme {
  return THEMES[theme] ?? THEMES.legacy;
}
