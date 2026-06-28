import type { Renderer } from 'lite-game-engine';
import { COLORS, RACER_CONFIG } from './config';
import type { RacerState, Segment } from './RacerState';

interface ProjectedPoint {
  cameraZ: number;
  x: number;
  y: number;
  w: number;
}

function percentRemaining(n: number, total: number): number {
  return (n % total) / total;
}

function interpolate(a: number, b: number, percent: number): number {
  return a + (b - a) * percent;
}

function exponentialFog(distance: number, density: number): number {
  return 1 / Math.pow(Math.E, distance * distance * density);
}

export class Pseudo3DRenderer {
  render(renderer: Renderer, state: RacerState): void {
    const ctx = renderer.ctx;
    const baseSegment = state.findSegment(state.position);
    const basePercent = percentRemaining(state.position, RACER_CONFIG.segmentLength);
    const playerSegment = state.findSegment(state.position + state.playerZ);
    const playerPercent = percentRemaining(state.position + state.playerZ, RACER_CONFIG.segmentLength);
    const playerY = interpolate(playerSegment.y1, playerSegment.y2, playerPercent);

    let maxY = state.height;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

    this.drawBackdrop(ctx, state);

    for (let n = 0; n < RACER_CONFIG.drawDistance; n += 1) {
      const segment = state.segments[(baseSegment.index + n) % state.segments.length];
      const looped = segment.index < baseSegment.index;
      const fog = exponentialFog(n / RACER_CONFIG.drawDistance, 5);

      const p1 = this.project(
        segment.y1,
        segment.z1 - (looped ? state.trackLength : 0),
        state.playerX * RACER_CONFIG.roadWidth - x,
        playerY + RACER_CONFIG.cameraHeight,
        state.position,
        state
      );
      const p2 = this.project(
        segment.y2,
        segment.z2 - (looped ? state.trackLength : 0),
        state.playerX * RACER_CONFIG.roadWidth - x - dx,
        playerY + RACER_CONFIG.cameraHeight,
        state.position,
        state
      );

      x += dx;
      dx += segment.curve;

      if (p1.cameraZ <= state.cameraDepth || p2.y >= p1.y || p2.y >= maxY) continue;

      this.drawSegment(ctx, state, segment, p1, p2, fog);
      maxY = p1.y;
    }

    this.drawPlayer(ctx, state);
    this.drawHud(ctx, state);
  }

  private project(
    worldY: number,
    worldZ: number,
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    state: RacerState
  ): ProjectedPoint {
    const cameraRelativeY = worldY - cameraY;
    const cameraRelativeZ = worldZ - cameraZ;
    const scale = state.cameraDepth / cameraRelativeZ;

    return {
      cameraZ: cameraRelativeZ,
      x: Math.round(state.width / 2 + scale * -cameraX * state.width / 2),
      y: Math.round(state.height / 2 - scale * cameraRelativeY * state.height / 2),
      w: Math.round(scale * RACER_CONFIG.roadWidth * state.width / 2)
    };
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, state: RacerState): void {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.fillStyle = COLORS.farHill;
    ctx.beginPath();
    ctx.moveTo(0, state.height * 0.42);
    ctx.lineTo(state.width * 0.18, state.height * 0.28);
    ctx.lineTo(state.width * 0.38, state.height * 0.42);
    ctx.lineTo(state.width * 0.58, state.height * 0.24);
    ctx.lineTo(state.width * 0.82, state.height * 0.43);
    ctx.lineTo(state.width, state.height * 0.32);
    ctx.lineTo(state.width, state.height);
    ctx.lineTo(0, state.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLORS.nearHill;
    ctx.fillRect(0, state.height * 0.42, state.width, state.height * 0.12);
  }

  private drawSegment(
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    segment: Segment,
    p1: ProjectedPoint,
    p2: ProjectedPoint,
    fog: number
  ): void {
    const rumble1 = p1.w / Math.max(6, 2 * RACER_CONFIG.lanes);
    const rumble2 = p2.w / Math.max(6, 2 * RACER_CONFIG.lanes);
    const lane1 = p1.w / Math.max(32, 8 * RACER_CONFIG.lanes);
    const lane2 = p2.w / Math.max(32, 8 * RACER_CONFIG.lanes);

    ctx.fillStyle = segment.color.grass;
    ctx.fillRect(0, p2.y, state.width, p1.y - p2.y);

    this.polygon(ctx, p1.x - p1.w - rumble1, p1.y, p1.x + p1.w + rumble1, p1.y, p2.x + p2.w + rumble2, p2.y, p2.x - p2.w - rumble2, p2.y, segment.color.rumble);
    this.polygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, segment.color.road);

    if (segment.color.lane) {
      let lanex1 = p1.x - p1.w + p1.w * 2 / RACER_CONFIG.lanes;
      let lanex2 = p2.x - p2.w + p2.w * 2 / RACER_CONFIG.lanes;
      for (let lane = 1; lane < RACER_CONFIG.lanes; lane += 1) {
        this.polygon(ctx, lanex1 - lane1 / 2, p1.y, lanex1 + lane1 / 2, p1.y, lanex2 + lane2 / 2, p2.y, lanex2 - lane2 / 2, p2.y, segment.color.lane);
        lanex1 += p1.w * 2 / RACER_CONFIG.lanes;
        lanex2 += p2.w * 2 / RACER_CONFIG.lanes;
      }
    }

    if (fog < 1) {
      ctx.globalAlpha = 1 - fog;
      ctx.fillStyle = COLORS.fog;
      ctx.fillRect(0, p2.y, state.width, p1.y - p2.y);
      ctx.globalAlpha = 1;
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, state: RacerState): void {
    const carW = Math.max(72, state.width * 0.1);
    const carH = carW * 0.58;
    const x = state.width / 2;
    const y = state.height * 0.84;
    const lean = state.input.steer * carW * 0.08;

    this.polygon(ctx, x - carW * 0.5 + lean, y + carH * 0.45, x + carW * 0.5 + lean, y + carH * 0.45, x + carW * 0.28 - lean, y - carH * 0.45, x - carW * 0.28 - lean, y - carH * 0.45, COLORS.player);
    this.polygon(ctx, x - carW * 0.22 - lean, y - carH * 0.2, x + carW * 0.22 - lean, y - carH * 0.2, x + carW * 0.1 - lean, y - carH * 0.42, x - carW * 0.1 - lean, y - carH * 0.42, COLORS.playerTrim);
  }

  private drawHud(ctx: CanvasRenderingContext2D, state: RacerState): void {
    const mph = Math.round(state.speed / RACER_CONFIG.maxSpeed * 220);
    const lap = state.currentLapTime.toFixed(1);
    const best = state.bestLapTime ? state.bestLapTime.toFixed(1) : '--';

    ctx.font = '24px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = COLORS.hudShadow;
    ctx.fillRect(16, 16, 260, 112);
    ctx.fillStyle = COLORS.hud;
    ctx.fillText(`Speed ${mph} mph`, 32, 30);
    ctx.fillText(`Lap ${lap}s`, 32, 62);
    ctx.fillText(`Best ${best}s`, 32, 94);

    ctx.font = '18px sans-serif';
    ctx.fillText('触摸左/右转向，底部区域刹车', state.width - 300, 30);
  }

  private polygon(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }
}
