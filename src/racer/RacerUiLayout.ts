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
  nitroButton: RacerCircle;
  nitroTouchArea: RacerRect;
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
  line5Y: number;
  line6Y: number;
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function centeredButton(width: number, y: number, buttonW: number, buttonH: number): RacerRect {
  return rect((width - buttonW) / 2, y, buttonW, buttonH);
}

function panel(width: number, height: number, desiredW: number, desiredH: number): RacerRect {
  const w = Math.min(desiredW, width * 0.82);
  const h = Math.min(desiredH, height - 28);
  return rect((width - w) / 2, Math.max(14, (height - h) / 2), w, h);
}

function safePanel(
  width: number,
  height: number,
  desiredW: number,
  desiredH: number,
  topSafe: number,
  bottomSafe: number
): RacerRect {
  const w = Math.min(desiredW, width * 0.84);
  const availableHeight = Math.max(210, height - topSafe - bottomSafe);
  const h = Math.min(desiredH, availableHeight);
  const y = topSafe + Math.max(0, (availableHeight - h) / 2);
  return rect((width - w) / 2, y, w, h);
}

export function buildRacerUiLayout(width: number, height: number): RacerUiLayout {
  const small = width < 760 || height < 430;
  const shortScreen = height < 380;
  const buttonW = small ? Math.min(248, width * 0.46) : 268;
  const buttonH = small ? 46 : 54;
  const spacing = small ? 10 : 12;
  const title = shortScreen ? 30 : small ? 34 : 44;
  const body = shortScreen ? 15 : small ? 18 : 21;
  const note = shortScreen ? 13 : small ? 16 : 18;
  const button = shortScreen ? 17 : small ? 20 : 23;
  const hud = small ? 14 : 16;

  const menuPanel = panel(width, height, 640, small ? 430 : 520);
  const menuButtonW = Math.max(188, Math.min(small ? 260 : 300, width * (small ? 0.31 : 0.25)));
  const menuButtonH = Math.max(38, Math.min(small ? 46 : 54, height * 0.11));
  const menuSpacing = Math.max(6, Math.min(10, height * 0.018));
  const menuX = Math.max(22, width * 0.09);
  const menuStartY = Math.max(height * 0.39, small ? 120 : 170);
  const settingsButtonW = Math.max(82, Math.min(108, width * 0.095));
  const settingsButtonH = Math.max(36, Math.min(48, height * 0.09));
  const settingsButtonRight = Math.max(22, width * 0.03);
  const settingsButtonY = Math.max(18, height * 0.085);

  // Frontend panels must stay above the gesture bar and below the top capsule area.
  const frontendTopSafe = clamp(height * 0.05, 16, 26);
  const frontendBottomSafe = clamp(height * 0.09, 28, 48);
  const frontendDesiredHeight = shortScreen ? 292 : small ? 350 : 470;

  const trackPanel = safePanel(width, height, 660, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  const trackHeaderHeight = clamp(trackPanel.h * 0.24, shortScreen ? 62 : 72, 100);
  const trackBottomPadding = shortScreen ? 8 : 12;
  const trackBackHeight = clamp(trackPanel.h * 0.12, shortScreen ? 30 : 34, 46);
  const trackBackGap = clamp(trackPanel.h * 0.02, 5, 9);
  const trackGap = clamp(trackPanel.h * 0.018, 4, 9);
  const trackButtonW = Math.min(small ? 430 : 500, trackPanel.w - 48);
  const trackContentTop = trackPanel.y + trackHeaderHeight;
  const trackContentHeight = trackPanel.h - trackHeaderHeight - trackBottomPadding - trackBackHeight - trackBackGap;
  const trackButtonHeight = Math.max(32, (trackContentHeight - trackGap * 2) / 3);
  const trackButtons = [0, 1, 2].map((index) =>
    centeredButton(width, trackContentTop + index * (trackButtonHeight + trackGap), trackButtonW, trackButtonHeight)
  );
  const trackBackY = trackPanel.y + trackPanel.h - trackBottomPadding - trackBackHeight;

  const settingsPanel = safePanel(width, height, 680, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  const settingsCardW = Math.min(small ? 450 : 540, settingsPanel.w - 48);
  const settingsHeaderHeight = clamp(settingsPanel.h * 0.24, shortScreen ? 62 : 72, 100);
  const settingsBottomPadding = shortScreen ? 7 : 12;
  const settingsGap = clamp(settingsPanel.h * 0.018, 4, 8);
  const settingsRows = 6;
  const settingsContentHeight = settingsPanel.h - settingsHeaderHeight - settingsBottomPadding;
  const settingsCardH = Math.max(25, (settingsContentHeight - settingsGap * (settingsRows - 1)) / settingsRows);
  const settingsStartY = settingsPanel.y + settingsHeaderHeight;
  const settingsRowY = (index: number): number => settingsStartY + index * (settingsCardH + settingsGap);

  const helpPanel = safePanel(width, height, 680, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  const helpHeaderHeight = clamp(helpPanel.h * 0.23, shortScreen ? 58 : 68, 94);
  const helpBottomPadding = shortScreen ? 7 : 12;
  const helpButtonH = clamp(helpPanel.h * 0.105, shortScreen ? 28 : 34, 48);
  const helpButtonW = small ? 210 : 246;
  const helpButtonGap = clamp(helpPanel.h * 0.018, 4, 8);
  const helpButtonsHeight = helpButtonH * 2 + helpButtonGap;
  const helpLinesHeight = Math.max(96, helpPanel.h - helpHeaderHeight - helpButtonsHeight - helpBottomPadding - helpButtonGap);
  const helpLineGap = helpLinesHeight / 6;
  const helpLineStartY = helpPanel.y + helpHeaderHeight + helpLineGap * 0.15;
  const helpBackY = helpPanel.y + helpPanel.h - helpBottomPadding - helpButtonH;
  const helpStartY = helpBackY - helpButtonGap - helpButtonH;

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
  const miniMapPanel = rect(hudPanel.x, progressBar.y + progressBar.h + 8, hudPanel.w, small ? 72 : 82);
  const miniMapPreviewBar = rect(miniMapPanel.x + 12, miniMapPanel.y + (small ? 31 : 34), miniMapPanel.w - 24, small ? 16 : 18);
  const miniMapProgressBar = rect(miniMapPanel.x + 12, miniMapPanel.y + miniMapPanel.h - 15, miniMapPanel.w - 24, 5);

  const pauseButtonR = small ? 24 : 28;
  const pauseSafeY = Math.max(96, height * 0.17);
  const pauseButton = circle(width - pauseButtonR - 20, pauseSafeY + pauseButtonR, pauseButtonR);

  // Keep the visual control compact while preserving a generous invisible touch target.
  const joystickRadius = Math.max(58, Math.min(86, width * 0.078, height * 0.18));
  const joystickKnobRadius = joystickRadius * 0.4;
  const joystickBase = circle(joystickRadius + 24, height - joystickRadius - 18, joystickRadius);
  const joystickTouchArea = rect(
    0,
    height * 0.42,
    Math.min(width * 0.48, joystickBase.x + joystickRadius + 52),
    height * 0.58
  );

  const brakeRadius = Math.max(48, Math.min(64, width * 0.058, height * 0.13));
  const brakeButton = circle(width - brakeRadius - 46, height - brakeRadius - 38, brakeRadius);
  const nitroRadius = Math.max(38, Math.min(52, brakeRadius * 0.82));
  const nitroSafeTop = pauseButton.y + pauseButton.r + nitroRadius + 14;
  const nitroButtonX = small ? brakeButton.x - brakeRadius - nitroRadius - 18 : brakeButton.x;
  const nitroButtonY = small
    ? brakeButton.y - brakeRadius * 0.12
    : Math.max(nitroSafeTop, brakeButton.y - brakeRadius - nitroRadius - 18);
  const nitroButton = circle(nitroButtonX, nitroButtonY, nitroRadius);
  const brakeTouchArea = rect(
    brakeButton.x - brakeRadius - 8,
    brakeButton.y - brakeRadius - 8,
    brakeRadius * 2 + 16,
    brakeRadius * 2 + 16
  );
  const nitroTouchArea = rect(
    nitroButton.x - nitroRadius - 8,
    nitroButton.y - nitroRadius - 8,
    nitroRadius * 2 + 16,
    nitroRadius * 2 + 16
  );

  return {
    small,
    pauseButton,
    hud: { panel: hudPanel, progressBar, rowHeight: small ? 16 : 18 },
    miniMap: { panel: miniMapPanel, previewBar: miniMapPreviewBar, progressBar: miniMapProgressBar },
    controls: {
      joystickBase,
      joystickKnobRadius,
      joystickTouchArea,
      brakeButton,
      brakeTouchArea,
      nitroButton,
      nitroTouchArea
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
      startButton: rect(menuX, menuStartY, menuButtonW, menuButtonH),
      trackButton: rect(menuX, menuStartY + (menuButtonH + menuSpacing), menuButtonW, menuButtonH),
      leaderboardButton: rect(menuX, menuStartY + (menuButtonH + menuSpacing) * 2, menuButtonW, menuButtonH),
      helpButton: rect(menuX, menuStartY + (menuButtonH + menuSpacing) * 3, menuButtonW, menuButtonH),
      settingsButton: rect(width - settingsButtonRight - settingsButtonW, settingsButtonY, settingsButtonW, settingsButtonH)
    },
    trackSelect: {
      panel: trackPanel,
      titleY: trackPanel.y + Math.min(22, trackHeaderHeight * 0.24),
      line1Y: trackPanel.y + trackHeaderHeight * 0.68,
      line2Y: trackPanel.y + trackHeaderHeight * 0.84,
      line3Y: trackPanel.y,
      trackButtons,
      backButton: centeredButton(width, trackBackY, small ? 210 : 236, trackBackHeight)
    },
    settings: {
      panel: settingsPanel,
      titleY: settingsPanel.y + Math.min(22, settingsHeaderHeight * 0.24),
      line1Y: settingsPanel.y + settingsHeaderHeight * 0.72,
      line2Y: settingsPanel.y,
      line3Y: settingsPanel.y,
      audioButton: centeredButton(width, settingsRowY(0), settingsCardW, settingsCardH),
      miniMapButton: centeredButton(width, settingsRowY(1), settingsCardW, settingsCardH),
      coachButton: centeredButton(width, settingsRowY(2), settingsCardW, settingsCardH),
      sensitivityButton: centeredButton(width, settingsRowY(3), settingsCardW, settingsCardH),
      resetCoachButton: centeredButton(width, settingsRowY(4), settingsCardW, settingsCardH),
      backButton: centeredButton(width, settingsRowY(5), small ? 210 : 236, settingsCardH)
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
      titleY: helpPanel.y + Math.min(20, helpHeaderHeight * 0.24),
      line1Y: helpLineStartY,
      line2Y: helpLineStartY + helpLineGap,
      line3Y: helpLineStartY + helpLineGap * 2,
      line4Y: helpLineStartY + helpLineGap * 3,
      line5Y: helpLineStartY + helpLineGap * 4,
      line6Y: helpLineStartY + helpLineGap * 5,
      startButton: centeredButton(width, helpStartY, helpButtonW, helpButtonH),
      backButton: centeredButton(width, helpBackY, helpButtonW, helpButtonH)
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
