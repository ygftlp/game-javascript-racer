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
  /** Inner rect used to fit the track outline path. */
  pathBounds: RacerRect;
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
  /** Top-right modal close (X). */
  closeButton: RacerRect;
}

export interface RacerSettingsLayout extends RacerPanelLayout {
  audioButton: RacerRect;
  miniMapButton: RacerRect;
  coachButton: RacerRect;
  sensitivityButton: RacerRect;
  resetCoachButton: RacerRect;
  backButton: RacerRect;
  /** Top-right modal close (X). */
  closeButton: RacerRect;
}

export interface RacerPausedLayout extends RacerPanelLayout {
  resumeButton: RacerRect;
  restartButton: RacerRect;
  audioButton: RacerRect;
  menuButton: RacerRect;
  /** Top-right modal close (X) — resumes race. */
  closeButton: RacerRect;
}

export interface RacerFinishedLayout extends RacerPanelLayout {
  restartButton: RacerRect;
  shareButton: RacerRect;
  leaderboardButton: RacerRect;
  noteY: number;
  /** Top-right modal close (X) — returns to menu. */
  closeButton: RacerRect;
}

export interface RacerHelpLayout extends RacerPanelLayout {
  line4Y: number;
  line5Y: number;
  line6Y: number;
  startButton: RacerRect;
  backButton: RacerRect;
  /** Top-right modal close (X). */
  closeButton: RacerRect;
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

/** Top-right circular close (X) inside a modal panel. */
function panelCloseButton(panelRect: RacerRect, size = 34): RacerRect {
  const inset = 14;
  return rect(panelRect.x + panelRect.w - size - inset, panelRect.y + inset, size, size);
}

function panel(width: number, height: number, desiredW: number, desiredH: number): RacerRect {
  const w = Math.min(desiredW, width * 0.78);
  const h = Math.min(desiredH, height - 36);
  return rect((width - w) / 2, Math.max(18, (height - h) / 2), w, h);
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
  // Landscape phones often have a left home-indicator / notch strip.
  // Keep all left-column chrome clear of that black safe band.
  const menuLeftSafe = clamp(width * 0.075, 52, 84);
  // Market circular home — airy 2+2 cluster with clear hierarchy:
  //   [ big play ]   [ mid track ]
  //      [ rank ]      [ help ]
  // Slightly smaller orbs + larger gaps beat oversized circles jammed together.
  const menuPrimarySize = Math.max(86, Math.min(small ? 98 : 108, height * 0.23));
  const menuSecondarySize = Math.max(64, Math.min(small ? 72 : 80, height * 0.165));
  const menuIconSize = Math.max(40, Math.min(small ? 44 : 48, height * 0.092));
  // Label band under each orb — enough for one line without kissing the next row.
  const menuIconLabelH = Math.max(18, Math.min(22, height * 0.04));
  const menuPrimaryLabelH = Math.max(22, Math.min(26, height * 0.048));
  const menuSecondaryLabelH = Math.max(20, Math.min(24, height * 0.044));
  // Edge-to-edge air between play/track orbs (was ~16–22; felt dense).
  const menuClusterGap = Math.max(30, Math.min(44, width * 0.036));
  // Vertical air after main-row labels before utility orbs.
  const menuRowGap = Math.max(18, Math.min(28, height * 0.042));
  const menuIconGap = Math.max(30, Math.min(44, width * 0.032));
  // Total cluster width drives horizontal centering of utilities under both orbs.
  const menuClusterW = menuPrimarySize + menuClusterGap + menuSecondarySize;
  const menuX = menuLeftSafe + 8;
  // Status chip is taller now (~76–88). Anchor the action cluster below it with real air.
  const statusCardBottom = height * 0.055 + clamp(height * 0.165, 76, 88);
  const menuStartY = clamp(statusCardBottom + clamp(height * 0.045, 18, 28), small ? 128 : 140, height * 0.4);
  const menuTrackX = menuX + menuPrimarySize + menuClusterGap;
  const menuTrackY = menuStartY + (menuPrimarySize - menuSecondarySize) * 0.5;
  const menuIconY = menuStartY + menuPrimarySize + menuPrimaryLabelH + menuRowGap;
  // Center the two utility orbs under the main pair.
  const menuUtilityRowW = menuIconSize * 2 + menuIconGap;
  const menuUtilityX = menuX + (menuClusterW - menuUtilityRowW) / 2;
  // Hit rects include circle + label clearance band so labels stay tappable.
  const menuPrimaryHitH = menuPrimarySize + menuPrimaryLabelH;
  const menuSecondaryHitH = menuSecondarySize + menuSecondaryLabelH;
  const menuIconHitH = menuIconSize + menuIconLabelH;

  // WeChat already renders its own capsule in the top-right corner. Keep the
  // game settings entry compact and clearly below it instead of drawing a
  // second capsule beside/under the system control.
  // Sit a beat lower than the top chrome row so brand + status own the header band.
  const settingsButtonSize = clamp(height * 0.1, 38, 44);
  const settingsButtonRight = clamp(width * 0.035, 24, 34);
  const settingsButtonY = clamp(height * 0.215, 78, 96);

  // Frontend panels must stay above the gesture bar and below the top capsule area.
  // Prefer slightly roomier panels so content is not packed edge-to-edge.
  const frontendTopSafe = clamp(height * 0.045, 14, 24);
  const frontendBottomSafe = clamp(height * 0.08, 24, 42);
  const frontendDesiredHeight = shortScreen ? 310 : small ? 372 : 500;

  const trackPanel = safePanel(width, height, 620, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  // Compact header leaves more vertical air for track cards.
  const trackHeaderHeight = clamp(trackPanel.h * 0.18, 64, 78);
  const trackBottomPadding = shortScreen ? 14 : 18;
  const trackBackHeight = clamp(trackPanel.h * 0.1, shortScreen ? 34 : 38, 48);
  const trackBackGap = clamp(trackPanel.h * 0.028, 10, 14);
  const trackGap = clamp(trackPanel.h * 0.028, 10, 14);
  const trackButtonW = Math.min(small ? 400 : 460, trackPanel.w - 64);
  const trackContentTop = trackPanel.y + trackHeaderHeight;
  const trackContentHeight = trackPanel.h - trackHeaderHeight - trackBottomPadding - trackBackHeight - trackBackGap;
  const trackButtonHeight = Math.max(44, (trackContentHeight - trackGap * 2) / 3);
  const trackButtons = [0, 1, 2].map((index) =>
    centeredButton(width, trackContentTop + index * (trackButtonHeight + trackGap), trackButtonW, trackButtonHeight)
  );
  const trackBackY = trackPanel.y + trackPanel.h - trackBottomPadding - trackBackHeight;
  const trackCloseButton = panelCloseButton(trackPanel, small ? 32 : 36);

  const settingsPanel = safePanel(width, height, 640, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  const settingsCardW = Math.min(small ? 420 : 500, settingsPanel.w - 64);
  const settingsHeaderHeight = clamp(settingsPanel.h * 0.16, 58, 72);
  const settingsBottomPadding = shortScreen ? 14 : 18;
  const settingsGap = clamp(settingsPanel.h * 0.022, 8, 12);
  // 5 setting rows + 1 bottom back button.
  const settingsRows = 6;
  const settingsContentHeight = settingsPanel.h - settingsHeaderHeight - settingsBottomPadding;
  const settingsCardH = Math.max(36, (settingsContentHeight - settingsGap * (settingsRows - 1)) / settingsRows);
  const settingsStartY = settingsPanel.y + settingsHeaderHeight;
  const settingsRowY = (index: number): number => settingsStartY + index * (settingsCardH + settingsGap);
  const settingsCloseButton = panelCloseButton(settingsPanel, small ? 32 : 36);

  const helpPanel = safePanel(width, height, 640, frontendDesiredHeight, frontendTopSafe, frontendBottomSafe);
  const helpHeaderHeight = clamp(helpPanel.h * 0.16, 58, 72);
  const helpBottomPadding = shortScreen ? 14 : 18;
  const helpButtonH = clamp(helpPanel.h * 0.1, shortScreen ? 34 : 38, 48);
  const helpButtonW = small ? 200 : 230;
  const helpButtonGap = clamp(helpPanel.h * 0.024, 10, 14);
  const helpButtonsHeight = helpButtonH * 2 + helpButtonGap;
  const helpLinesHeight = Math.max(120, helpPanel.h - helpHeaderHeight - helpButtonsHeight - helpBottomPadding - helpButtonGap);
  const helpLineGap = helpLinesHeight / 6;
  const helpLineStartY = helpPanel.y + helpHeaderHeight + helpLineGap * 0.2;
  const helpBackY = helpPanel.y + helpPanel.h - helpBottomPadding - helpButtonH;
  const helpStartY = helpBackY - helpButtonGap - helpButtonH;
  const helpCloseButton = panelCloseButton(helpPanel, small ? 32 : 36);

  // In-race modals: shorter, airier panels with room for a close X.
  const pausedPanel = panel(width, height, 480, small ? 340 : 380);
  const pausedStartY = pausedPanel.y + (small ? 88 : 100);
  const pausedCloseButton = panelCloseButton(pausedPanel, small ? 32 : 36);

  const finishedPanel = panel(width, height, 520, small ? 300 : 340);
  const finishedButtonW = small ? Math.min(128, finishedPanel.w * 0.28) : 148;
  const finishedButtonH = small ? 44 : 50;
  const finishedButtonY = finishedPanel.y + (small ? 180 : 200);
  const finishedGap = small ? 12 : 18;
  const finishedTotalW = finishedButtonW * 3 + finishedGap * 2;
  const finishedStartX = (width - finishedTotalW) / 2;
  const finishedCloseButton = panelCloseButton(finishedPanel, small ? 32 : 36);

  const hudPanel = rect(14, 14, small ? 174 : 198, small ? 88 : 96);
  const progressW = clamp(width * 0.32, 220, 340);
  const progressBar = rect((width - progressW) / 2, small ? 16 : 18, progressW, 6);

  const pauseButtonR = small ? 24 : 28;
  const pauseSafeY = Math.max(96, height * 0.17);
  const pauseButton = circle(width - pauseButtonR - 20, pauseSafeY + pauseButtonR, pauseButtonR);

  // Contour minimap: top-right square card under the pause button.
  const miniMapSize = clamp(Math.min(width, height) * 0.14, 96, 120);
  const miniMapGapBelowPause = small ? 10 : 12;
  const miniMapRightInset = small ? 14 : 18;
  const miniMapPanel = rect(
    width - miniMapRightInset - miniMapSize,
    pauseButton.y + pauseButton.r + miniMapGapBelowPause,
    miniMapSize,
    miniMapSize
  );
  const miniMapInset = 10;
  const miniMapPathBounds = rect(
    miniMapPanel.x + miniMapInset,
    miniMapPanel.y + miniMapInset,
    miniMapPanel.w - miniMapInset * 2,
    miniMapPanel.h - miniMapInset * 2
  );

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
    miniMap: { panel: miniMapPanel, pathBounds: miniMapPathBounds },
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
      startButton: rect(menuX, menuStartY, menuPrimarySize, menuPrimaryHitH),
      trackButton: rect(menuTrackX, menuTrackY, menuSecondarySize, menuSecondaryHitH),
      // Circular utility icons centered under the main orb pair.
      leaderboardButton: rect(menuUtilityX, menuIconY, menuIconSize, menuIconHitH),
      helpButton: rect(menuUtilityX + menuIconSize + menuIconGap, menuIconY, menuIconSize, menuIconHitH),
      settingsButton: rect(
        width - settingsButtonRight - settingsButtonSize,
        settingsButtonY,
        settingsButtonSize,
        settingsButtonSize
      )
    },
    trackSelect: {
      panel: trackPanel,
      titleY: trackPanel.y + 18,
      line1Y: trackPanel.y + 48,
      line2Y: trackPanel.y + 48,
      line3Y: trackPanel.y,
      trackButtons,
      backButton: centeredButton(width, trackBackY, small ? 200 : 220, trackBackHeight),
      closeButton: trackCloseButton
    },
    settings: {
      panel: settingsPanel,
      titleY: settingsPanel.y + 18,
      line1Y: settingsPanel.y + 48,
      line2Y: settingsPanel.y,
      line3Y: settingsPanel.y,
      audioButton: centeredButton(width, settingsRowY(0), settingsCardW, settingsCardH),
      miniMapButton: centeredButton(width, settingsRowY(1), settingsCardW, settingsCardH),
      coachButton: centeredButton(width, settingsRowY(2), settingsCardW, settingsCardH),
      sensitivityButton: centeredButton(width, settingsRowY(3), settingsCardW, settingsCardH),
      resetCoachButton: centeredButton(width, settingsRowY(4), settingsCardW, settingsCardH),
      backButton: centeredButton(width, settingsRowY(5), small ? 200 : 220, settingsCardH),
      closeButton: settingsCloseButton
    },
    paused: {
      panel: pausedPanel,
      titleY: pausedPanel.y + (small ? 20 : 24),
      line1Y: pausedPanel.y + (small ? 56 : 64),
      line2Y: pausedPanel.y + (small ? 80 : 90),
      line3Y: pausedPanel.y + (small ? 104 : 116),
      resumeButton: centeredButton(width, pausedStartY, small ? 210 : 230, buttonH),
      restartButton: centeredButton(width, pausedStartY + buttonH + spacing + 4, small ? 210 : 230, buttonH),
      audioButton: centeredButton(width, pausedStartY + (buttonH + spacing + 4) * 2, small ? 210 : 230, buttonH),
      menuButton: centeredButton(width, pausedStartY + (buttonH + spacing + 4) * 3, small ? 210 : 230, buttonH),
      closeButton: pausedCloseButton
    },
    finished: {
      panel: finishedPanel,
      titleY: finishedPanel.y + (small ? 20 : 24),
      line1Y: finishedPanel.y + (small ? 68 : 78),
      line2Y: finishedPanel.y + (small ? 100 : 112),
      line3Y: finishedPanel.y + (small ? 128 : 142),
      restartButton: rect(finishedStartX, finishedButtonY, finishedButtonW, finishedButtonH),
      shareButton: rect(finishedStartX + finishedButtonW + finishedGap, finishedButtonY, finishedButtonW, finishedButtonH),
      leaderboardButton: rect(finishedStartX + (finishedButtonW + finishedGap) * 2, finishedButtonY, finishedButtonW, finishedButtonH),
      noteY: finishedButtonY + finishedButtonH + (small ? 16 : 20),
      closeButton: finishedCloseButton
    },
    help: {
      panel: helpPanel,
      titleY: helpPanel.y + 18,
      line1Y: helpLineStartY,
      line2Y: helpLineStartY + helpLineGap,
      line3Y: helpLineStartY + helpLineGap * 2,
      line4Y: helpLineStartY + helpLineGap * 3,
      line5Y: helpLineStartY + helpLineGap * 4,
      line6Y: helpLineStartY + helpLineGap * 5,
      startButton: centeredButton(width, helpStartY, helpButtonW, helpButtonH),
      backButton: centeredButton(width, helpBackY, helpButtonW, helpButtonH),
      closeButton: helpCloseButton
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
