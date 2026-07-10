export type RacerOverlayPhase = 'menu' | 'paused' | 'finished' | 'help' | 'trackSelect' | 'settings';

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

export interface RacerMiniMapLayout {
  panel: RacerRect;
  previewBar: RacerRect;
  progressBar: RacerRect;
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
  trackButton: RacerRect;
  leaderboardButton: RacerRect;
  helpButton: RacerRect;
  settingsButton: RacerRect;
}

export interface RacerTrackSelectLayout extends RacerPanelLayout {
  trackButtons: RacerRect[];
  backButton: RacerRect;
}

export interface RacerSettingsLayout extends RacerPanelLayout {
  audioButton: RacerRect;
  miniMapButton: RacerRect;
  coachButton: RacerRect;
  sensitivityButton: RacerRect;
  resetCoachButton: RacerRect;
  backButton: RacerRect;
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

export interface RacerHelpLayout extends RacerPanelLayout {
  line4Y: number;
  startButton: RacerRect;
  backButton: RacerRect;
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
  miniMap: RacerMiniMapLayout;
  controls: RacerControlLayout;
  touchZones: RacerTouchZones;
  menu: RacerMenuLayout;
  trackSelect: RacerTrackSelectLayout;
  settings: RacerSettingsLayout;
  paused: RacerPausedLayout;
  finished: RacerFinishedLayout;
  help: RacerHelpLayout;
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

function buildTrackButtons(width: number, trackPanel: RacerRect, small: boolean): RacerRect[] {
  const buttonW = Math.min(small ? 430 : 500, trackPanel.w - 64);
  const buttonH = small ? 58 : 68;
  const gap = small ? 10 : 12;
  const startY = trackPanel.y + (small ? 112 : 132);

  return [0, 1, 2].map((index) => centeredButton(width, startY + index * (buttonH + gap), buttonW, buttonH));
}

export function buildRacerUiLayout(width: number, height: number): RacerUiLayout {
  const small = width < 760 || height < 430;
  const buttonW = small ? Math.min(248, width * 0.46) : 268;
  const buttonH = small ? 46 : 54;
  const menuButtonH = small ? 42 : 50;
  const spacing = small ? 10 : 12;
  const menuSpacing = small ? 8 : 10;
  const title = small ? 34 : 44;
  const body = small ? 18 : 21;
  const note = small ? 16 : 18;
  const button = small ? 20 : 23;
  const hud = small ? 14 : 16;

  const menuPanel = panel(width, height, 640, small ? 430 : 520);
  const menuStartY = menuPanel.y + (small ? 160 : 188);

  const trackPanel = panel(width, height, 660, small ? 410 : 470);
  const trackButtons = buildTrackButtons(width, trackPanel, small);
  const trackBackY = trackButtons[trackButtons.length - 1].y + trackButtons[trackButtons.length - 1].h + (small ? 14 : 18);

  const settingsPanel = panel(width, height, 680, small ? 430 : 520);
  const settingsCardW = Math.min(small ? 450 : 540, settingsPanel.w - 56);
  const settingsCardH = small ? 44 : 54;
  const settingsGap = small ? 6 : 9;
  const settingsStartY = settingsPanel.y + (small ? 102 : 128);

  const pausedPanel = panel(width, height, 620, small ? 414 : 466);
  const pausedStartY = pausedPanel.y + (small ? 132 : 158);

  const helpPanel = panel(width, height, 640, small ? 398 : 448);
  const helpButtonY = helpPanel.y + (small ? 298 : 336);

  const finishedPanel = panel(width, height, 640, small ? 352 : 398);
  const finishedButtonW = small ? Math.min(144, finishedPanel.w * 0.29) : 164;
  const finishedButtonH = small ? 48 : 56;
  const finishedButtonY = finishedPanel.y + (small ? 198 : 224);
  const finishedGap = small ? 14 : 26;
  const finishedTotalW = finishedButtonW * 3 + finishedGap * 2;
  const finishedStartX = (width - finishedTotalW) / 2;

  const hudPanel = rect(14, 14, small ? 184 : 216, small ? 88 : 98);
  const progressBar = rect(hudPanel.x, hudPanel.y + hudPanel.h + 8, hudPanel.w, 8);
  const miniMapPanel = rect(hudPanel.x, progressBar.y + progressBar.h + 8, hudPanel.w, small ? 72 : 82);
  const miniMapPreviewBar = rect(miniMapPanel.x + 12, miniMapPanel.y + (small ? 31 : 34), miniMapPanel.w - 24, small ? 16 : 18);
  const miniMapProgressBar = rect(miniMapPanel.x + 12, miniMapPanel.y + miniMapPanel.h - 15, miniMapPanel.w - 24, 5);

  const pauseButtonR = small ? 24 : 28;
  const pauseSafeY = Math.max(96, height * 0.17);
  const pauseButton = circle(width - pauseButtonR - 20, pauseSafeY + pauseButtonR, pauseButtonR);

  const joystickRadius = Math.max(92, Math.min(126, width * 0.11, height * 0.245));
  const joystickKnobRadius = joystickRadius * 0.42;
  const joystickBase = circle(joystickRadius + 28, height - joystickRadius - 20, joystickRadius);
  const joystickTouchArea = rect(0, height * 0.34, Math.min(width * 0.62, joystickBase.x + joystickRadius + 72), height * 0.66);

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
    miniMap: {
      panel: miniMapPanel,
      previewBar: miniMapPreviewBar,
      progressBar: miniMapProgressBar
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
      titleY: menuPanel.y + (small ? 18 : 28),
      line1Y: menuPanel.y + (small ? 68 : 94),
      line2Y: menuPanel.y + (small ? 98 : 126),
      line3Y: menuPanel.y + (small ? 126 : 158),
      startButton: centeredButton(width, menuStartY, buttonW, menuButtonH),
      trackButton: centeredButton(width, menuStartY + (menuButtonH + menuSpacing), buttonW, menuButtonH),
      leaderboardButton: centeredButton(width, menuStartY + (menuButtonH + menuSpacing) * 2, buttonW, menuButtonH),
      helpButton: centeredButton(width, menuStartY + (menuButtonH + menuSpacing) * 3, buttonW, menuButtonH),
      settingsButton: centeredButton(width, menuStartY + (menuButtonH + menuSpacing) * 4, buttonW, menuButtonH)
    },
    trackSelect: {
      panel: trackPanel,
      titleY: trackPanel.y + (small ? 22 : 30),
      line1Y: trackPanel.y + (small ? 74 : 90),
      line2Y: trackPanel.y + (small ? 96 : 116),
      line3Y: trackPanel.y,
      trackButtons,
      backButton: centeredButton(width, trackBackY, small ? 210 : 236, buttonH)
    },
    settings: {
      panel: settingsPanel,
      titleY: settingsPanel.y + (small ? 22 : 30),
      line1Y: settingsPanel.y + (small ? 70 : 90),
      line2Y: settingsPanel.y,
      line3Y: settingsPanel.y,
      audioButton: centeredButton(width, settingsStartY, settingsCardW, settingsCardH),
      miniMapButton: centeredButton(width, settingsStartY + (settingsCardH + settingsGap), settingsCardW, settingsCardH),
      coachButton: centeredButton(width, settingsStartY + (settingsCardH + settingsGap) * 2, settingsCardW, settingsCardH),
      sensitivityButton: centeredButton(width, settingsStartY + (settingsCardH + settingsGap) * 3, settingsCardW, settingsCardH),
      resetCoachButton: centeredButton(width, settingsStartY + (settingsCardH + settingsGap) * 4, settingsCardW, settingsCardH),
      backButton: centeredButton(width, settingsStartY + (settingsCardH + settingsGap) * 5, small ? 210 : 236, settingsCardH)
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
      noteY: finishedButtonY + finishedButtonH + (small ? 18 : 24)
    },
    help: {
      panel: helpPanel,
      titleY: helpPanel.y + (small ? 24 : 32),
      line1Y: helpPanel.y + (small ? 82 : 100),
      line2Y: helpPanel.y + (small ? 118 : 140),
      line3Y: helpPanel.y + (small ? 154 : 180),
      line4Y: helpPanel.y + (small ? 190 : 220),
      startButton: centeredButton(width, helpButtonY, small ? 226 : 246, buttonH),
      backButton: centeredButton(width, helpButtonY + buttonH + spacing, small ? 226 : 246, buttonH)
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
