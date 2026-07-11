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

let installed = false;

function isFrontendPhase(phase: MenuRenderOptions['phase']): boolean {
  return phase === 'menu' || phase === 'help' || phase === 'trackSelect' || phase === 'settings';
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
  ctx.setLineDash([Math.max(12, height * 0.055), Math.max(9, height * 0.04)]);
  ctx.beginPath();
  ctx.moveTo(width / 2, height);
  ctx.lineTo(width / 2, horizon);
  ctx.stroke();
  ctx.setLineDash([]);

  const vignette = ctx.createRadialGradient(width / 2, height * 0.46, 0, width / 2, height * 0.46, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, 'rgba(5, 12, 24, 0.08)');
  vignette.addColorStop(1, 'rgba(5, 12, 24, 0.72)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
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

    drawFrontendBackdrop(ctx, state);
    const originalDrawHud = this.drawHud;
    this.drawHud = (): void => {};
    try {
      originalRender.call(this, ctx, state, assets, layout, options);
    } finally {
      this.drawHud = originalDrawHud;
    }
  };
}
