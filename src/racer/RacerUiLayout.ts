export type RacerOverlayPhase = 'menu' | 'paused' | 'finished';

export interface RacerRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RacerTouchZones {
  left: RacerRect;
  right: RacerRect;
  brake: RacerRect;
}

export interface RacerPanelLayout {
  panel: RacerRect;
  titleY: number;
  line1Y: number;
  line2Y: number;
  line3Y: number;
}

export interface RacerMenuLayout extends RacerPanelLayout {
  startButton: RacerRect;
  leaderboardButton: RacerRect;
  audioButton: RacerRect;
}

export interface RacerPausedLayout extends RacerPanelLayout {
  resumeButton: RacerRect;
  audioButton: RacerRect;
}

export interface RacerFinishedLayout extends RacerPanelLayout {
  restartButton: RacerRect;
  shareButton: RacerRect;
  leaderboardButton: RacerRect;
  noteY: number;
}

export interface RacerHudLayout {
  panel: RacerRect;
  rowHeight: number;
}

export interface RacerUiLayout {
  small: boolean;
  pauseButton: RacerRect;
  hud: RacerHudLayout;
  touchZones: RacerTouchZones;
  menu: RacerMenuLayout;
  paused: RacerPausedLayout;
  finished: RacerFinishedLayout;
  fonts: {
    title: number;
    body: number;
    note: number;
    button: number;
    hud: number;
  };
}

function rect(x: number, y: number, w: number, h: number): RacerRect {
  return { x, y, w, h };
}

function centeredButton(width: number, y: number, buttonW: number, buttonH: number): RacerRect {
  return rect((width - buttonW) / 2, y, buttonW, buttonH);
}

function panel(width: number, height: number, desiredW: number, desiredH: number): RacerRect {
  const w = Math.min(desiredW, width * 0.86);
  const h = Math.min(desiredH, height - 24);
  return rect((width - w) / 2, Math.max(12, (height - h) / 2), w, h);
}

export function buildRacerUiLayout(width: number, height: number): RacerUiLayout {
  const small = width < 760 || height < 430;
  const buttonW = small ? Math.min(220, width * 0.42) : 236;
  const buttonH = small ? 44 : 52;
  const spacing = small ? 10 : 12;
  const title = small ? 32 : 40;
  const body = small ? 18 : 20;
  const note = small ? 16 : 18;
  const button = small ? 20 : 22;
  const hud = small ? 14 : 16;

  const menuPanel = panel(width, height, 600, small ? 344 : 384);
  const menuStartY = menuPanel.y + (small ? 156 : 184);

  const pausedPanel = panel(width, height, 600, small ? 292 : 336);
  const pausedStartY = pausedPanel.y + (small ? 132 : 158);

  const finishedPanel = panel(width, height, 600, small ? 336 : 380);
  const finishedButtonW = small ? Math.min(132, finishedPanel.w * 0.28) : 150;
  const finishedButtonH = small ? 46 : 54;
  const finishedButtonY = finishedPanel.y + (small ? 190 : 212);
  const finishedGap = small ? 14 : 25;
  const finishedTotalW = finishedButtonW * 3 + finishedGap * 2;
  const finishedStartX = (width - finishedTotalW) / 2;

  const hudPanel = rect(14, 14, small ? 172 : 196, small ? 114 : 128);
  const pauseButtonW = small ? 74 : 86;
  const pauseButtonH = small ? 38 : 42;
  const pauseSafeY = Math.max(92, height * 0.16);
  const pauseButton = rect(width - pauseButtonW - 18, pauseSafeY, pauseButtonW, pauseButtonH);

  return {
    small,
    pauseButton,
    hud: {
      panel: hudPanel,
      rowHeight: small ? 15 : 17
    },
    touchZones: {
      left: rect(0, 0, width * 0.42, height),
      right: rect(width * 0.58, 0, width * 0.42, height),
      brake: rect(0, height * 0.74, width, height * 0.26)
    },
    menu: {
      panel: menuPanel,
      titleY: menuPanel.y + (small ? 18 : 24),
      line1Y: menuPanel.y + (small ? 70 : 82),
      line2Y: menuPanel.y + (small ? 98 : 112),
      line3Y: menuPanel.y + (small ? 126 : 142),
      startButton: centeredButton(width, menuStartY, buttonW, buttonH),
      leaderboardButton: centeredButton(width, menuStartY + buttonH + spacing, buttonW, buttonH),
      audioButton: centeredButton(width, menuStartY + (buttonH + spacing) * 2, buttonW, buttonH)
    },
    paused: {
      panel: pausedPanel,
      titleY: pausedPanel.y + (small ? 28 : 34),
      line1Y: pausedPanel.y + (small ? 86 : 98),
      line2Y: pausedPanel.y + (small ? 110 : 126),
      line3Y: pausedPanel.y + (small ? 134 : 154),
      resumeButton: centeredButton(width, pausedStartY, small ? 200 : 220, buttonH),
      audioButton: centeredButton(width, pausedStartY + buttonH + spacing, small ? 200 : 220, buttonH)
    },
    finished: {
      panel: finishedPanel,
      titleY: finishedPanel.y + (small ? 22 : 28),
      line1Y: finishedPanel.y + (small ? 74 : 84),
      line2Y: finishedPanel.y + (small ? 104 : 116),
      line3Y: finishedPanel.y + (small ? 134 : 148),
      restartButton: rect(finishedStartX, finishedButtonY, finishedButtonW, finishedButtonH),
      shareButton: rect(finishedStartX + finishedButtonW + finishedGap, finishedButtonY, finishedButtonW, finishedButtonH),
      leaderboardButton: rect(finishedStartX + (finishedButtonW + finishedGap) * 2, finishedButtonY, finishedButtonW, finishedButtonH),
      noteY: finishedPanel.y + (small ? 270 : 294)
    },
    fonts: { title, body, note, button, hud }
  };
}

export function pointInRect(point: { x: number; y: number }, target: RacerRect): boolean {
  return point.x >= target.x && point.x <= target.x + target.w && point.y >= target.y && point.y <= target.y + target.h;
}
