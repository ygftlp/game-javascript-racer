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
  menuButton: RacerRect;
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
  const w = Math.min(desiredW, width * 0.82);
  const h = Math.min(desiredH, height - 28);
  return rect((width - w) / 2, Math.max(14, (height - h) / 2), w, h);
}

export function buildRacerUiLayout(width: number, height: number): RacerUiLayout {
  const small = width < 760 || height < 430;
  const buttonW = small ? Math.min(248, width * 0.46) : 268;
  const buttonH = small ? 48 : 56;
  const spacing = small ? 12 : 14;
  const title = small ? 34 : 44;
  const body = small ? 18 : 21;
  const note = small ? 16 : 18;
  const button = small ? 21 : 24;
  const hud = small ? 14 : 16;

  const menuPanel = panel(width, height, 640, small ? 366 : 412);
  const menuStartY = menuPanel.y + (small ? 166 : 198);

  const pausedPanel = panel(width, height, 620, small ? 414 : 466);
  const pausedStartY = pausedPanel.y + (small ? 132 : 158);

  const finishedPanel = panel(width, height, 640, small ? 352 : 398);
  const finishedButtonW = small ? Math.min(144, finishedPanel.w * 0.29) : 164;
  const finishedButtonH = small ? 48 : 56;
  const finishedButtonY = finishedPanel.y + (small ? 198 : 224);
  const finishedGap = small ? 14 : 26;
  const finishedTotalW = finishedButtonW * 3 + finishedGap * 2;
  const finishedStartX = (width - finishedTotalW) / 2;

  const hudPanel = rect(14, 14, small ? 184 : 216, small ? 88 : 98);
  const progressBar = rect(hudPanel.x, hudPanel.y + hudPanel.h + 8, hudPanel.w, 8);

  const pauseButtonR = small ? 24 : 28;
  const pauseSafeY = Math.max(96, height * 0.17);
  const pauseButton = circle(width - pauseButtonR - 20, pauseSafeY + pauseButtonR, pauseButtonR);

  const joystickRadius = Math.max(76, Math.min(96, width * 0.085, height * 0.205));
  const joystickKnobRadius = joystickRadius * 0.43;
  const joystickBase = circle(joystickRadius + 36, height - joystickRadius - 28, joystickRadius);
  const joystickTouchArea = rect(0, height * 0.42, Math.min(width * 0.55, joystickBase.x + joystickRadius + 58), height * 0.58);

  const brakeRadius = Math.max(48, Math.min(64, width * 0.058, height * 0.13));
  const brakeButton = circle(width - brakeRadius - 46, height - brakeRadius - 38, brakeRadius);
  const brakeTouchArea = rect(width * 0.54, height * 0.5, width * 0.46, height * 0.5);

  return {
    small,
    pauseButton,
    hud: {
      panel: hudPanel,
      progressBar,
      rowHeight: small ? 16 : 18
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
      titleY: menuPanel.y + (small ? 22 : 28),
      line1Y: menuPanel.y + (small ? 82 : 98),
      line2Y: menuPanel.y + (small ? 112 : 130),
      line3Y: menuPanel.y + (small ? 140 : 162),
      startButton: centeredButton(width, menuStartY, buttonW, buttonH),
      leaderboardButton: centeredButton(width, menuStartY + buttonH + spacing, buttonW, buttonH),
      audioButton: centeredButton(width, menuStartY + (buttonH + spacing) * 2, buttonW, buttonH)
    },
    paused: {
      panel: pausedPanel,
      titleY: pausedPanel.y + (small ? 26 : 34),
      line1Y: pausedPanel.y + (small ? 82 : 100),
      line2Y: pausedPanel.y + (small ? 112 : 132),
      line3Y: pausedPanel.y + (small ? 142 : 164),
      resumeButton: centeredButton(width, pausedStartY, small ? 226 : 246, buttonH),
      restartButton: centeredButton(width, pausedStartY + buttonH + spacing, small ? 226 : 246, buttonH),
      audioButton: centeredButton(width, pausedStartY + (buttonH + spacing) * 2, small ? 226 : 246, buttonH),
      menuButton: centeredButton(width, pausedStartY + (buttonH + spacing) * 3, small ? 226 : 246, buttonH)
    },
    finished: {
      panel: finishedPanel,
      titleY: finishedPanel.y + (small ? 24 : 32),
      line1Y: finishedPanel.y + (small ? 80 : 94),
      line2Y: finishedPanel.y + (small ? 112 : 128),
      line3Y: finishedPanel.y + (small ? 144 : 162),
      restartButton: rect(finishedStartX, finishedButtonY, finishedButtonW, finishedButtonH),
      shareButton: rect(finishedStartX + finishedButtonW + finishedGap, finishedButtonY, finishedButtonW, finishedButtonH),
      leaderboardButton: rect(finishedStartX + (finishedButtonW + finishedGap) * 2, finishedButtonY, finishedButtonW, finishedButtonH),
      noteY: finishedPanel.y + (small ? 284 : 314)
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
