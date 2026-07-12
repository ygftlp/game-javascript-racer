import type { RacerState } from './RacerState';
import {
  buildTrackOutline,
  curvesFromSegments,
  fitOutlineToBounds,
  sampleOutlineAt,
  type FittedOutline,
  type TrackOutline
} from './RacerTrackOutline';
import { RACER_UI_THEME } from './RacerUiTheme';
import type { RacerRect, RacerUiLayout } from './RacerUiLayout';

function wrap01(value: number): number {
  const t = value % 1;
  return t < 0 ? t + 1 : t;
}

export class RacerMiniMap {
  private cachedOutline: TrackOutline | null = null;
  private cachedTrackId: string | null = null;

  render(ctx: CanvasRenderingContext2D, state: RacerState, layout: RacerUiLayout): void {
    // Contour card still competes with joystick/road on short landscape frames.
    if (layout.small || state.height < 430) return;

    const miniMap = layout.miniMap;
    const trackId = state.activeTrack.id;
    const outline = this.ensureOutline(trackId, state);
    if (!outline || outline.points.length < 2) return;

    const fitted = fitOutlineToBounds(outline, miniMap.pathBounds, 2);
    if (fitted.points.length < 2) return;

    const progress = state.trackLength > 0 ? wrap01(state.position / state.trackLength) : 0;

    this.drawPanel(ctx, miniMap.panel);
    this.drawOutline(ctx, fitted);
    this.drawDrivenArc(ctx, fitted, progress);
    this.drawTraffic(ctx, state, fitted);
    this.drawPlayer(ctx, fitted, progress);
  }

  private ensureOutline(trackId: string, state: RacerState): TrackOutline | null {
    if (this.cachedOutline && this.cachedTrackId === trackId) return this.cachedOutline;
    if (!state.segments.length) return null;
    this.cachedOutline = buildTrackOutline(trackId, curvesFromSegments(state.segments), {
      sampleEvery: 3
    });
    this.cachedTrackId = trackId;
    return this.cachedOutline;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    this.roundedPanel(
      ctx,
      target.x,
      target.y,
      target.w,
      target.h,
      RACER_UI_THEME.panel.minimap,
      RACER_UI_THEME.panel.border
    );
  }

  private drawOutline(ctx: CanvasRenderingContext2D, fitted: FittedOutline): void {
    ctx.save();
    ctx.strokeStyle = RACER_UI_THEME.minimap.outline;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    this.strokePath(ctx, fitted.points);
    ctx.restore();
  }

  private drawDrivenArc(ctx: CanvasRenderingContext2D, fitted: FittedOutline, progress: number): void {
    if (progress <= 0.001 || fitted.totalLength <= 0) return;
    const end = progress * fitted.totalLength;
    const points = fitted.points;
    const arcs = fitted.arcLengths;

    ctx.save();
    ctx.strokeStyle = RACER_UI_THEME.minimap.outlineDriven;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      if (arcs[i - 1] >= end) break;
      if (arcs[i] <= end) {
        ctx.lineTo(points[i].x, points[i].y);
      } else {
        const seg = Math.max(1e-6, arcs[i] - arcs[i - 1]);
        const u = (end - arcs[i - 1]) / seg;
        ctx.lineTo(
          points[i - 1].x + (points[i].x - points[i - 1].x) * u,
          points[i - 1].y + (points[i].y - points[i - 1].y) * u
        );
        break;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawTraffic(ctx: CanvasRenderingContext2D, state: RacerState, fitted: FittedOutline): void {
    if (!state.trackLength) return;
    let drawn = 0;
    ctx.save();
    for (const car of state.cars) {
      const t = wrap01(car.z / state.trackLength);
      const { point } = sampleOutlineAt(fitted, t);
      this.circle(ctx, point.x, point.y, 2.2, RACER_UI_THEME.accent.traffic);
      drawn += 1;
      if (drawn >= 8) break;
    }
    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, fitted: FittedOutline, progress: number): void {
    const { point, tangent } = sampleOutlineAt(fitted, progress);
    ctx.save();
    this.circle(ctx, point.x, point.y, 4.2, RACER_UI_THEME.minimap.playerRing);
    this.circle(ctx, point.x, point.y, 3.2, RACER_UI_THEME.minimap.player);
    const tick = 7;
    ctx.strokeStyle = RACER_UI_THEME.minimap.player;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + tangent.x * tick, point.y + tangent.y * tick);
    ctx.stroke();
    ctx.restore();
  }

  private strokePath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]): void {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  private circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private roundedPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke?: string
  ): void {
    const r = Math.min(12, w / 5, h / 5);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
