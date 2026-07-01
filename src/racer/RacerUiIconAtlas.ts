import type { RacerUiIconName } from './RacerUiIcons';

export interface RacerUiIconAtlasFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const RACER_UI_ICON_ATLAS_CELL_SIZE = 64;

export const RACER_UI_ICON_ATLAS: Record<RacerUiIconName, RacerUiIconAtlasFrame> = {
  play: { x: 0, y: 0, w: 64, h: 64 },
  track: { x: 64, y: 0, w: 64, h: 64 },
  leaderboard: { x: 128, y: 0, w: 64, h: 64 },
  help: { x: 192, y: 0, w: 64, h: 64 },
  settings: { x: 0, y: 64, w: 64, h: 64 },
  music: { x: 64, y: 64, w: 64, h: 64 },
  minimap: { x: 128, y: 64, w: 64, h: 64 },
  coach: { x: 192, y: 64, w: 64, h: 64 },
  sensitivity: { x: 0, y: 128, w: 64, h: 64 },
  reset: { x: 64, y: 128, w: 64, h: 64 },
  back: { x: 128, y: 128, w: 64, h: 64 },
  share: { x: 192, y: 128, w: 64, h: 64 }
};
