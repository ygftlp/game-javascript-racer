import type { RacerState } from './RacerState';
import { RACER_UI_THEME } from './RacerUiTheme';
import type { RacerMiniMapLayout, RacerRect, RacerUiLayout } from './RacerUiLayout';

interface PreviewSlice {
  x: number;
  w: number;
  curve: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function wrapDistance(from: number, to: number, trackLength: number): number {
  let distance = to - from;
  while (distance < 0) distance += trackLength;
  while (distance >= trackLength) distance -= trackLength;
  return distance;
}

export class RacerMiniMap {
  render(ctx: CanvasRenderingContext2D, state: RacerState, layout: RacerUiLayout): void {
    const miniMap = layout.miniMap;
    const progress = state.trackLength > 0 ? state.position / state.trackLength : 0;

    this.drawPanel(ctx, miniMap.panel);
    this.drawTitle(ctx, miniMap);
    this.drawCurvePreview(ctx, state, miniMap);
    this.drawTrafficDots(ctx, state, miniMap);
    this.drawProgress(ctx, miniMap, progress);
  }

  private drawPanel(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    this.roundedPanel(ctx, target.x, target.y, target.w, target.h, RACER_UI_THEME.panel.minimap, RACER_UI_THEME.panel.border);
  }

  private drawTitle(ctx: CanvasRenderingContext2D, miniMap: RacerMiniMapLayout): void {
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = RACER_UI_THEME.text.bodyStrong;
    ctx.fillText('赛道雷达', miniMap.panel.x + 12, miniMap.panel.y + 8);
    ctx.restore();
  }

  private drawCurvePreview(ctx: CanvasRenderingContext2D, state: RacerState, miniMap: RacerMiniMapLayout): void {
    const preview = miniMap.previewBar;
    const slices = this.buildPreviewSlices(state, preview);

    this.roundedPanel(ctx, preview.x, preview.y, preview.w, preview.h, RACER_UI_THEME.panel.minimapBarBg);

    for (const slice of slices) {
      const absCurve = Math.abs(slice.curve);
      const fill = absCurve < 0.15
        ? RACER_UI_THEME.minimap.straight
        : slice.curve > 0
          ? RACER_UI_THEME.minimap.rightCurve
          : RACER_UI_THEME.minimap.leftCurve;
      this.roundedPanel(ctx, slice.x, preview.y + 2, Math.max(2, slice.w - 1), preview.h - 4, fill);
    }

    const midX = preview.x + preview.w * 0.18;
    ctx.save();
    ctx.strokeStyle = RACER_UI_THEME.minimap.cursor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, preview.y - 2);
    ctx.lineTo(midX, preview.y + preview.h + 2);
    ctx.stroke();
    ctx.restore();
  }

  private buildPreviewSlices(state: RacerState, target: RacerRect): PreviewSlice[] {
    const sliceCount = 9;
    const segmentStep = 7;
    const baseIndex = state.findSegment(state.position).index;
    const sliceW = target.w / sliceCount;
    const slices: PreviewSlice[] = [];

    for (let i = 0; i < sliceCount; i += 1) {
      let curveSum = 0;
      for (let j = 0; j < segmentStep; j += 1) {
        const segment = state.segments[(baseIndex + i * segmentStep + j) % state.segments.length];
        curveSum += segment.curve;
      }
      slices.push({
        x: target.x + i * sliceW,
        w: sliceW,
        curve: curveSum / segmentStep
      });
    }

    return slices;
  }

  private drawTrafficDots(ctx: CanvasRenderingContext2D, state: RacerState, miniMap: RacerMiniMapLayout): void {
    const preview = miniMap.previewBar;
    const horizon = Math.min(state.trackLength * 0.16, 9000);
    let drawn = 0;

    ctx.save();
    for (const car of state.cars) {
      const distance = wrapDistance(state.position + state.playerZ, car.z, state.trackLength);
      if (distance <= 0 || distance > horizon) continue;

      const x = preview.x + clamp(distance / horizon, 0, 1) * preview.w;
      const y = preview.y + preview.h / 2 + clamp(car.offset, -1, 1) * preview.h * 0.32;
      this.circle(ctx, x, y, 2.4, RACER_UI_THEME.accent.traffic);
      drawn += 1;
      if (drawn >= 8) break;
    }
    ctx.restore();
  }

  private drawProgress(ctx: CanvasRenderingContext2D, miniMap: RacerMiniMapLayout, progress: number): void {
    const bar = miniMap.progressBar;
    const clamped = clamp(progress, 0, 1);

    this.roundedPanel(ctx, bar.x, bar.y, bar.w, bar.h, RACER_UI_THEME.panel.minimapProgressBg);
    this.roundedPanel(ctx, bar.x, bar.y, Math.max(5, bar.w * clamped), bar.h, RACER_UI_THEME.minimap.progress);

    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RACER_UI_THEME.text.muted;
    ctx.fillText(`${Math.round(clamped * 100)}%`, bar.x + bar.w, bar.y - 7);
    ctx.restore();
  }

  private circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private roundedPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke?: string): void {
    const r = Math.min(10, w / 4, h / 4);
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
