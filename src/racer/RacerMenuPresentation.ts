import type { RacerAssets } from './RacerAssets';
import type { RacerJoystickSnapshot } from './RacerJoystick';
import type { RacerState } from './RacerState';
import { RacerUiRenderer, type RacerUiPressedTarget, type RacerUiTrackOption } from './RacerUiRenderer';
import type { RacerUiLayout } from './RacerUiLayout';

interface MenuRenderOptions {
  phase: 'menu' | 'playing' | 'paused' | 'finished' | 'help' | 'trackSelect' | 'settings';
  targetLaps: number;
  audioMuted: boolean;
  miniMapEnabled: boolean;
  controlCoachEnabled: boolean;
  controlCoachSeen: boolean;
  controlSensitivityLabel: string;
  controlSensitivityDescription: string;
  brakeActive: boolean;
  pressedTarget: RacerUiPressedTarget;
  controlCoachTimeLeft: number;
  joystick: RacerJoystickSnapshot;
  trackName: string;
  trackIndex: number;
  trackCount: number;
  selectedTrackId: string;
  tracks: readonly RacerUiTrackOption[];
}

type RenderMethod = (
  ctx: CanvasRenderingContext2D,
  state: RacerState,
  assets: RacerAssets | undefined,
  layout: RacerUiLayout,
  options: MenuRenderOptions
) => void;

type HudMethod = (
  ctx: CanvasRenderingContext2D,
  state: RacerState,
  assets: RacerAssets | undefined,
  targetLaps: number,
  audioMuted: boolean,
  layout: RacerUiLayout
) => void;

interface MutableUiRenderer {
  render: RenderMethod;
  drawHud: HudMethod;
}

type DashCapableContext = CanvasRenderingContext2D & {
  setLineDash?: (segments: number[]) => void;
};

let installed = false;

function isFrontendPhase(phase: MenuRenderOptions['phase']): boolean {
  return phase === 'menu' || phase === 'help' || phase === 'trackSelect' || phase === 'settings';
}

function safeSetLineDash(ctx: CanvasRenderingContext2D, segments: number[]): void {
  const dash = (ctx as DashCapableContext).setLineDash;
  if (typeof dash !== 'function') return;
  try {
    dash.call(ctx, segments);
  } catch (error) {
    console.warn('[racer] setLineDash is unavailable on this WeChat Canvas context', error);
  }
}

function drawFrontendBackdrop(ctx: CanvasRenderingContext2D, state: RacerState): void {
  const width = state.width;
  const height = state.height;
  const horizon = height * 0.48;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#07111f';
  ctx.fillRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#102a43');
  sky.addColorStop(1, '#1b4965');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

  ctx.fillStyle = '#143d2b';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width * 0.16, height * 0.28);
  ctx.lineTo(width * 0.34, horizon);
  ctx.lineTo(width * 0.55, height * 0.23);
  ctx.lineTo(width * 0.78, horizon);
  ctx.lineTo(width, height * 0.31);
  ctx.lineTo(width, horizon);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#111820';
  ctx.beginPath();
  ctx.moveTo(width * 0.34, height);
  ctx.lineTo(width * 0.46, horizon);
  ctx.lineTo(width * 0.54, horizon);
  ctx.lineTo(width * 0.66, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 212, 59, 0.55)';
  ctx.lineWidth = Math.max(2, width * 0.003);
  safeSetLineDash(ctx, [Math.max(12, height * 0.055), Math.max(9, height * 0.04)]);
  ctx.beginPath();
  ctx.moveTo(width / 2, height);
  ctx.lineTo(width / 2, horizon);
  ctx.stroke();
  safeSetLineDash(ctx, []);

  const vignette = ctx.createRadialGradient(width / 2, height * 0.46, 0, width / 2, height * 0.46, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, 'rgba(5, 12, 24, 0.08)');
  vignette.addColorStop(1, 'rgba(5, 12, 24, 0.72)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  ctx.font = `${Math.max(10, Math.round(width / 100))}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.fillText('RUNTIME S2 · 2026.07.11', width - 14, height - 9);
  ctx.restore();
}

function drawFrontendFallback(ctx: CanvasRenderingContext2D, state: RacerState, message: string): void {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#07111f';
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.max(22, Math.round(state.width / 24))}px sans-serif`;
  ctx.fillText('极速公路', state.width / 2, state.height * 0.44);
  ctx.font = `${Math.max(12, Math.round(state.width / 55))}px sans-serif`;
  ctx.fillStyle = '#ffcc4d';
  ctx.fillText(message, state.width / 2, state.height * 0.56);
  ctx.restore();
}

export function installRacerMenuPresentation(): void {
  if (installed) return;
  installed = true;

  const prototype = RacerUiRenderer.prototype as unknown as MutableUiRenderer;
  const originalRender = prototype.render;

  prototype.render = function renderWithFrontendIsolation(
    this: MutableUiRenderer,
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    assets: RacerAssets | undefined,
    layout: RacerUiLayout,
    options: MenuRenderOptions
  ): void {
    if (!isFrontendPhase(options.phase)) {
      originalRender.call(this, ctx, state, assets, layout, options);
      return;
    }

    try {
      drawFrontendBackdrop(ctx, state);
    } catch (error) {
      console.error('[racer] frontend backdrop render failed', error);
      drawFrontendFallback(ctx, state, '兼容模式背景');
    }

    const originalDrawHud = this.drawHud;
    this.drawHud = (): void => {};
    try {
      originalRender.call(this, ctx, state, assets, layout, options);
    } catch (error) {
      console.error('[racer] frontend UI render failed', error);
      drawFrontendFallback(ctx, state, '界面渲染失败，请查看控制台');
    } finally {
      this.drawHud = originalDrawHud;
    }
  };
}
