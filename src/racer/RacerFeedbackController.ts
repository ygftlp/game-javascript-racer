import type { RacerAssets } from './RacerAssets';
import type { RacerState } from './RacerState';

export interface RacerCameraOffset {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export class RacerFeedbackController {
  private lastPowerupCount = 0;
  private lastNitroActive = false;

  syncAudio(state: RacerState, assets: RacerAssets | undefined, playing: boolean): void {
    if (!assets) return;

    if (!playing) {
      if (this.lastNitroActive) assets.stopNitroLoop();
      this.lastNitroActive = false;
      this.lastPowerupCount = state.powerupCount;
      return;
    }

    if (state.powerupCount < this.lastPowerupCount) {
      this.lastPowerupCount = state.powerupCount;
    }

    if (state.powerupCount > this.lastPowerupCount) {
      this.lastPowerupCount = state.powerupCount;
      if (state.lastPowerupType === 'boost') assets.playBoostPickup();
      if (state.lastPowerupType === 'nitro') assets.playNitroPickup();
      if (state.lastPowerupType === 'slow') assets.playSlowHit();
    }

    if (state.nitroActive !== this.lastNitroActive) {
      this.lastNitroActive = state.nitroActive;
      if (state.nitroActive) assets.playNitroLoop();
      else assets.stopNitroLoop();
    }
  }

  cameraOffset(state: RacerState, playing: boolean): RacerCameraOffset {
    if (!playing) return { x: 0, y: 0 };

    const impact = clamp(state.collisionCooldown / 0.6, 0, 1);
    const nitro = state.nitroActive ? 1 : 0;
    const time = state.totalRaceTime;

    return {
      x: Math.sin(time * 92) * impact * 6 + Math.sin(time * 48) * nitro * 1.2,
      y: Math.cos(time * 117) * impact * 3 + Math.cos(time * 61) * nitro * 0.8
    };
  }

  drawMotionOverlay(ctx: CanvasRenderingContext2D, state: RacerState, playing: boolean): void {
    if (!playing) return;
    if (state.nitroActive) this.drawNitroSpeedLines(ctx, state);
    if (state.collisionCooldown > 0) this.drawImpactVignette(ctx, state);
  }

  private drawNitroSpeedLines(ctx: CanvasRenderingContext2D, state: RacerState): void {
    const centerX = state.width / 2;
    const centerY = state.height * 0.46;
    const maxRadius = Math.hypot(state.width, state.height) * 0.62;

    ctx.save();
    ctx.globalAlpha = 0.52;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.5, state.width / 640);

    for (let index = 0; index < 20; index += 1) {
      const angle = index / 20 * Math.PI * 2 + Math.sin(index * 2.17) * 0.08;
      const phase = (state.totalRaceTime * 1.9 + index * 0.137) % 1;
      const inner = 32 + phase * maxRadius * 0.58;
      const outer = Math.min(maxRadius, inner + 42 + phase * 88);
      const stretchX = 1.28;
      const stretchY = 0.72;

      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * inner * stretchX,
        centerY + Math.sin(angle) * inner * stretchY
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * outer * stretchX,
        centerY + Math.sin(angle) * outer * stretchY
      );
      ctx.strokeStyle = index % 3 === 0 ? '#ffffff' : '#48dbfb';
      ctx.stroke();
    }

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#48dbfb';
    const edge = Math.max(12, state.width * 0.026);
    ctx.fillRect(0, 0, edge, state.height);
    ctx.fillRect(state.width - edge, 0, edge, state.height);
    ctx.restore();
  }

  private drawImpactVignette(ctx: CanvasRenderingContext2D, state: RacerState): void {
    const strength = clamp(state.collisionCooldown / 0.6, 0, 1);
    const edge = Math.max(16, state.width * 0.04);

    ctx.save();
    ctx.globalAlpha = strength * 0.18;
    ctx.fillStyle = '#ff365d';
    ctx.fillRect(0, 0, state.width, edge);
    ctx.fillRect(0, state.height - edge, state.width, edge);
    ctx.fillRect(0, edge, edge, state.height - edge * 2);
    ctx.fillRect(state.width - edge, edge, edge, state.height - edge * 2);
    ctx.restore();
  }
}
