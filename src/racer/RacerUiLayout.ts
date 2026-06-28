export type RacerOverlayPhase = 'menu' | 'paused' | 'finished';

export interface RacerRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RacerCircle {
  x: number;
  y: number;
  r: number;
}

export interface RacerTouchZones {
  left: RacerRect;
  right: RacerRect;
  brake: RacerRect;
}

export interface RacerControlLayout {
  joystickBase: RacerCircle;
  joystickKnobRadius: number;
  joystickTouchArea: RacerRect;
  brakeButton: RacerCircle;
  brakeTouchArea: RacerRect;
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
  restartButton: RacerRect;
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
  progressBar: RacerRect;
  rowHeight: number;
}

export interface RacerUiLayout {
  small: boolean;
  pauseButton: RacerCircle;
  hud: RacerHudLayout;
  controls: RacerControlLayout;
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

function circle(x: number, y: number, r: number): RacerCircle {
  return { x, y, r };
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

  const pausedPanel = panel(width, height, 600, small ? 330 : 374);
  const pausedStartY = pausedPanel.y + (small ? 128 : 154);

  const finishedPanel = panel(width, height, 600, small ? 336 : 380);
  const finishedButtonW = small ? Math.min(132, finishedPanel.w * 0.28) : 150;
  const finishedButtonH = small ? 46 : 54;
  const finishedButtonY = finishedPanel.y + (small ? 190 : 212);
  const finishedGap = small ? 14 : 25;
  const finishedTotalW = finishedButtonW * 3 + finishedGap * 2;
  const finishedStartX = (width - finishedTotalW) / 2;

  const hudPanel = rect(14, 14, small ? 176 : 206, small ? 104 : 116);
  const progressBar = rect(hudPanel.x, hudPanel.y + hudPanel.h + 8, hudPanel.w, 8);

  const pauseButtonR = small ? 22 : 25;
  const pauseSafeY = Math.max(94, height * 0.17);
  const pauseButton = circle(width - pauseButtonR - 20, pauseSafeY + pauseButtonR, pauseButtonR);

  const joystickRadius = Math.max(52, Math.min(70, width * 0.06, height * 0.14));
  const joystickKnobRadius = joystickRadius * 0.38;
  const joystickBase = circle(joystickRadius + 34, height - joystickRadius - 34, joystickRadius);
  const joystickTouchArea = rect(0, height * 0.48, Math.min(width * 0.48, joystickBase.x + joystickRadius + 42), height * 0.52);

  const brakeRadius = Math.max(42, Math.min(58, width * 0.052, height * 0.12));
  const brakeButton = circle(width - brakeRadius - 44, height - brakeRadius - 42, brakeRadius);
  const brakeTouchArea = rect(width * 0.56, height * 0.54, width * 0.44, height * 0.46);

  return {
    small,
    pauseButton,
    hud: {
      panel: hudPanel,
      progressBar,
      rowHeight: small ? 15 : 17
    },
    controls: {
      joystickBase,
      joystickKnobRadius,
      joystickTouchArea,
      brakeButton,
      brakeTouchArea
    },
    touchZones: {
      left: rect(0, 0, width * 0.42, height),
      right: rect(width * 0.58, 0, width * 0.42, height),
      brake: brakeTouchArea
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
      titleY: pausedPanel.y + (small ? 24 : 30),
      line1Y: pausedPanel.y + (small ? 76 : 90),
      line2Y: pausedPanel.y + (small ? 104 : 122),
      line3Y: pausedPanel.y + (small ? 132 : 154),
      resumeButton: centeredButton(width, pausedStartY, small ? 206 : 224, buttonH),
      restartButton: centeredButton(width, pausedStartY + buttonH + spacing, small ? 206 : 224, buttonH),
      audioButton: centeredButton(width, pausedStartY + (buttonH + spacing) * 2, small ? 206 : 224, buttonH)
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

export function pointInCircle(point: { x: number; y: number }, target: RacerCircle, padding = 0): boolean {
  return Math.hypot(point.x - target.x, point.y - target.y) <= target.r + padding;
}
