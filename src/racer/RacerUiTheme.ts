export const RACER_UI_THEME = {
  text: {
    primary: '#ffffff',
    buttonPrimary: 'rgba(20,24,32,0.96)',
    body: 'rgba(255,255,255,0.86)',
    bodyStrong: 'rgba(255,255,255,0.9)',
    note: 'rgba(255,255,255,0.72)',
    muted: 'rgba(255,255,255,0.82)'
  },
  accent: {
    gold: 'rgba(255, 207, 74, 0.94)',
    goldPressed: 'rgba(235, 178, 48, 0.96)',
    goldSoft: 'rgba(255, 207, 74, 0.12)',
    goldBar: 'rgba(255, 220, 88, 0.92)',
    blueCurve: 'rgba(92, 178, 255, 0.72)',
    traffic: 'rgba(255, 96, 80, 0.9)',
    brake: 'rgba(255, 92, 60, 0.62)',
    brakeActive: 'rgba(255, 92, 60, 0.9)'
  },
  panel: {
    hud: 'rgba(12, 18, 24, 0.52)',
    minimap: 'rgba(12, 18, 24, 0.48)',
    modal: 'rgba(18, 24, 32, 0.95)',
    modalShadow: 'rgba(0,0,0,0.3)',
    modalOuterGlow: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.2)',
    modalBorder: 'rgba(255,255,255,0.52)',
    divider: 'rgba(255, 255, 255, 0.12)',
    barBg: 'rgba(0, 0, 0, 0.42)',
    minimapBarBg: 'rgba(0, 0, 0, 0.32)',
    minimapProgressBg: 'rgba(0, 0, 0, 0.36)'
  },
  button: {
    secondary: 'rgba(255, 255, 255, 0.14)',
    secondaryPressed: 'rgba(255, 255, 255, 0.24)',
    secondaryStroke: 'rgba(255,255,255,0.42)',
    primaryStroke: 'rgba(255, 255, 255, 0.84)'
  },
  controls: {
    baseIdle: 'rgba(255,255,255,0.15)',
    baseActive: 'rgba(255,255,255,0.24)',
    knobIdle: 'rgba(255,255,255,0.48)',
    knobActive: 'rgba(255,255,255,0.78)',
    darkStroke: 'rgba(20,24,32,0.62)',
    stroke: 'rgba(255,255,255,0.48)',
    shadow: 'rgba(0,0,0,0.18)',
    brakeGlow: 'rgba(255,92,60,0.22)',
    pauseBg: 'rgba(12, 18, 24, 0.68)',
    pausePressed: 'rgba(255, 207, 74, 0.82)',
    pauseGlow: 'rgba(255,207,74,0.28)'
  },
  minimap: {
    straight: 'rgba(255,255,255,0.22)',
    rightCurve: 'rgba(255, 207, 74, 0.72)',
    leftCurve: 'rgba(92, 178, 255, 0.72)',
    cursor: 'rgba(255,255,255,0.82)',
    progress: 'rgba(255, 207, 74, 0.9)'
  },
  overlay: {
    shade: 'rgba(0, 0, 0, 0.58)',
    topTint: 'rgba(255, 207, 74, 0.07)',
    bottomShade: 'rgba(0, 0, 0, 0.18)'
  }
} as const;
