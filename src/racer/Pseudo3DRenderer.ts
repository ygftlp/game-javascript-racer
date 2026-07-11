import type { Renderer, Texture } from '../engine';
import { COLORS, RACER_CONFIG } from './config';
import type { RacerAssets } from './RacerAssets';
import { RacerFeedbackController } from './RacerFeedbackController';
import type { RacerPowerupType, RacerState, Segment } from './RacerState';
import type { AtlasFrame } from './SpriteAtlas';
import { BACKGROUND, SPRITES, SPRITE_SCALE } from './SpriteAtlas';
import { RACER_UI_FLAGS } from './RacerUiFlags';
import { buildRacerUiLayout } from './RacerUiLayout';
import { RacerUiRenderer, type RacerUiPhase, type RacerUiPressedTarget as UiPressedTarget, type RacerUiRenderOptions } from './RacerUiRenderer';

export type RacerPhase = RacerUiPhase;
export type RacerUiPressedTarget = UiPressedTarget;
export interface RacerRenderOptions extends RacerUiRenderOptions {}

interface ProjectedPoint {
  cameraZ: number;
  scale: number;
  x: number;
  y: number;
  w: number;
}

interface ProjectedSegment {
  segment: Segment;
  p1: ProjectedPoint;
  p2: ProjectedPoint;
  clipY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
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
  private readonly ui = new RacerUiRenderer();
  private readonly feedback = new RacerFeedbackController();

  render(renderer: Renderer, state: RacerState, assets: RacerAssets | undefined, options: RacerRenderOptions): void {
    const ctx = renderer.ctx;
    this.configureCanvas(ctx);

    const playing = options.phase === 'playing';
    this.feedback.syncAudio(state, assets, playing);

    const layout = buildRacerUiLayout(state.width, state.height);
    const projected: ProjectedSegment[] = [];
    const baseSegment = state.findSegment(state.position);
    const basePercent = percentRemaining(state.position, RACER_CONFIG.segmentLength);
    const playerSegment = state.findSegment(state.position + state.playerZ);
    const playerPercent = percentRemaining(state.position + state.playerZ, RACER_CONFIG.segmentLength);
    const playerY = interpolate(playerSegment.y1, playerSegment.y2, playerPercent);
    const cameraOffset = this.feedback.cameraOffset(state, playing);

    let maxY = state.height;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    this.drawBackdrop(ctx, state, assets?.background ?? null, playerY);

    for (let n = 0; n < state.tuning.drawDistance; n += 1) {
      const segment = state.segments[(baseSegment.index + n) % state.segments.length];
      const looped = segment.index < baseSegment.index;
      const fog = exponentialFog(n / state.tuning.drawDistance, 5);

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
      projected.push({ segment, p1, p2, clipY: maxY });
      maxY = p1.y;
    }

    this.drawWorldSprites(ctx, state, projected, assets?.sprites ?? null);
    this.drawPlayer(ctx, state, assets?.sprites ?? null, playerSegment, playerPercent);
    ctx.restore();

    this.feedback.drawMotionOverlay(ctx, state, playing);
    this.ui.render(ctx, state, assets, layout, options);
    if (playing) this.drawPowerupFeedback(ctx, state);
  }

  private configureCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  private project(worldY: number, worldZ: number, cameraX: number, cameraY: number, cameraZ: number, state: RacerState): ProjectedPoint {
    const cameraRelativeY = worldY - cameraY;
    const cameraRelativeZ = worldZ - cameraZ;
    const scale = state.cameraDepth / cameraRelativeZ;

    return {
      cameraZ: cameraRelativeZ,
      scale,
      x: Math.round(state.width / 2 + scale * -cameraX * state.width / 2),
      y: Math.round(state.height / 2 - scale * cameraRelativeY * state.height / 2),
      w: Math.round(scale * RACER_CONFIG.roadWidth * state.width / 2)
    };
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, state: RacerState, texture: Texture | null, playerY: number): void {
    if (texture?.loaded) {
      const image = texture.image as unknown as CanvasImageSource;
      const skyOffset = state.resolution * 0.001 * playerY;
      const hillOffset = state.resolution * 0.002 * playerY;
      const treeOffset = state.resolution * 0.003 * playerY;
      this.drawBackgroundLayer(ctx, image, state, BACKGROUND.SKY, 0, skyOffset);
      this.drawBackgroundLayer(ctx, image, state, BACKGROUND.HILLS, 0, hillOffset);
      this.drawBackgroundLayer(ctx, image, state, BACKGROUND.TREES, 0, treeOffset);
      return;
    }

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

  private drawBackgroundLayer(ctx: CanvasRenderingContext2D, image: CanvasImageSource, state: RacerState, frame: AtlasFrame, rotation: number, offset: number): void {
    const imageW = frame.w / 2;
    const sourceX = frame.x + Math.floor(frame.w * rotation);
    const sourceW = Math.min(imageW, frame.x + frame.w - sourceX);
    const destW = Math.floor(state.width * (sourceW / imageW));

    ctx.drawImage(image, sourceX, frame.y, sourceW, frame.h, 0, Math.round(offset), destW, state.height);
    if (sourceW < imageW) {
      ctx.drawImage(image, frame.x, frame.y, imageW - sourceW, frame.h, destW - 1, Math.round(offset), state.width - destW, state.height);
    }
  }

  private drawSegment(ctx: CanvasRenderingContext2D, state: RacerState, segment: Segment, p1: ProjectedPoint, p2: ProjectedPoint, fog: number): void {
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
      ctx.fillStyle = state.activeTrack.roadTheme.fog;
      ctx.fillRect(0, p2.y, state.width, p1.y - p2.y);
      ctx.globalAlpha = 1;
    }
  }

  private drawWorldSprites(ctx: CanvasRenderingContext2D, state: RacerState, projected: ProjectedSegment[], texture: Texture | null): void {
    for (let n = projected.length - 1; n >= 0; n -= 1) {
      const current = projected[n];
      const segment = current.segment;

      for (const powerup of segment.powerups) {
        if (!powerup.active) continue;
        const powerupScale = interpolate(current.p1.scale, current.p2.scale, powerup.percent);
        const powerupX = interpolate(current.p1.x, current.p2.x, powerup.percent) + powerupScale * powerup.offset * RACER_CONFIG.roadWidth * state.width / 2;
        const powerupY = interpolate(current.p1.y, current.p2.y, powerup.percent);
        this.drawPowerup(ctx, powerup.type, powerupScale, powerupX, powerupY, current.clipY, state);
      }

      for (const car of segment.cars) {
        const spriteScale = interpolate(current.p1.scale, current.p2.scale, car.percent);
        const spriteX = interpolate(current.p1.x, current.p2.x, car.percent) + spriteScale * car.offset * RACER_CONFIG.roadWidth * state.width / 2;
        const spriteY = interpolate(current.p1.y, current.p2.y, car.percent);
        this.drawAtlasSprite(ctx, texture, car.frame, spriteScale, spriteX, spriteY, -0.5, -1, current.clipY, state, '#da4f49');
      }

      for (const sprite of segment.sprites) {
        const spriteScale = current.p1.scale;
        const spriteX = current.p1.x + spriteScale * sprite.offset * RACER_CONFIG.roadWidth * state.width / 2;
        const spriteY = current.p1.y;
        this.drawAtlasSprite(ctx, texture, sprite.frame, spriteScale, spriteX, spriteY, sprite.offset < 0 ? -1 : 0, -1, current.clipY, state, '#0d5f2a');
      }
    }
  }

  private drawPowerup(ctx: CanvasRenderingContext2D, type: RacerPowerupType, scale: number, destX: number, destY: number, clipY: number, state: RacerState): void {
    if (type === 'slow') {
      this.drawSlowHazard(ctx, scale, destX, destY, clipY, state);
      return;
    }

    const size = Math.round(clamp(scale * RACER_CONFIG.roadWidth * state.width * 0.018, 10, 58));
    const y = Math.round(destY - size * 1.1);
    if (clipY && y + size > clipY) return;

    const fill = type === 'nitro' ? '#22b8ff' : '#ffd43b';
    const label = type === 'nitro' ? 'N' : '≫';

    ctx.save();
    ctx.translate(Math.round(destX), y + size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(-size * 0.58 + 3, -size * 0.58 + 5, size * 1.16, size * 1.16);
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, size * 0.08);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#07111f';
    ctx.font = `bold ${Math.max(9, Math.round(size * 0.46))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  private drawSlowHazard(ctx: CanvasRenderingContext2D, scale: number, destX: number, destY: number, clipY: number, state: RacerState): void {
    const width = Math.round(clamp(scale * RACER_CONFIG.roadWidth * state.width * 0.032, 18, 92));
    const height = Math.max(7, Math.round(width * 0.34));
    const x = Math.round(destX - width / 2);
    const y = Math.round(destY - height * 0.42);
    if (clipY && y + height > clipY) return;

    ctx.save();
    ctx.fillStyle = 'rgba(10, 4, 8, 0.78)';
    ctx.beginPath();
    ctx.ellipse(destX, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff365d';
    ctx.lineWidth = Math.max(2, Math.round(height * 0.16));
    ctx.stroke();
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = Math.max(1, Math.round(height * 0.12));
    for (let stripe = -1; stripe <= 1; stripe += 1) {
      const stripeX = destX + stripe * width * 0.22;
      ctx.beginPath();
      ctx.moveTo(stripeX - width * 0.1, y + height * 0.2);
      ctx.lineTo(stripeX + width * 0.08, y + height * 0.5);
      ctx.lineTo(stripeX - width * 0.1, y + height * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawAtlasSprite(ctx: CanvasRenderingContext2D, texture: Texture | null, frame: AtlasFrame, scale: number, destX: number, destY: number, offsetX: number, offsetY: number, clipY: number, state: RacerState, fallbackColor: string): void {
    const destW = Math.round(frame.w * scale * state.width / 2 * (SPRITE_SCALE * RACER_CONFIG.roadWidth));
    const destH = Math.round(frame.h * scale * state.width / 2 * (SPRITE_SCALE * RACER_CONFIG.roadWidth));
    const x = Math.round(destX + destW * offsetX);
    const y = Math.round(destY + destH * offsetY);
    const clipH = clipY ? Math.max(0, y + destH - clipY) : 0;

    if (clipH >= destH || destW <= 0 || destH <= 0) return;

    if (texture?.loaded) {
      try {
        const image = texture.image as unknown as CanvasImageSource;
        const visibleSourceH = Math.max(1, frame.h - frame.h * clipH / destH);
        const visibleDestH = Math.max(1, destH - clipH);
        ctx.drawImage(image, frame.x, frame.y, frame.w, visibleSourceH, x, y, destW, visibleDestH);
        return;
      } catch (error) {
        console.warn('[racer] sprite draw failed, using fallback shape', error);
      }
    }

    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, destW, destH - clipH);
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, state: RacerState, texture: Texture | null, playerSegment: Segment, playerPercent: number): void {
    const frame = state.input.steer < -0.08 ? SPRITES.PLAYER_LEFT : state.input.steer > 0.08 ? SPRITES.PLAYER_RIGHT : SPRITES.PLAYER_STRAIGHT;
    const carW = Math.round(Math.max(96, state.width * 0.118));
    const carH = Math.round(carW * (frame.h / frame.w));
    const roadY = state.height / 2 - (state.cameraDepth / state.playerZ * interpolate(playerSegment.y1, playerSegment.y2, playerPercent) * state.height / 2);
    const bounce = 1.2 * Math.random() * state.speed / RACER_CONFIG.maxSpeed * state.resolution;
    const carTopY = Math.round(clamp(roadY + bounce, state.height * 0.5, state.height - carH - 24));
    const x = Math.round(state.width / 2);

    if (state.nitroTime > 0) this.drawNitroTrail(ctx, x, carTopY, carW, carH);
    this.drawPlayerFallback(ctx, x, carTopY, carW, carH, state.input.steer);

    if (texture?.loaded) {
      try {
        const image = texture.image as unknown as CanvasImageSource;
        ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, Math.round(x - carW / 2), carTopY, carW, carH);
      } catch (error) {
        console.warn('[racer] player sprite draw failed, fallback body remains visible', error);
      }
    }

    if (RACER_UI_FLAGS.showPlayerVisibilityMarker) this.drawPlayerVisibilityMarker(ctx, x, carTopY, carW, carH, state.input.steer);
  }

  private drawNitroTrail(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.globalAlpha = 0.76;
    ctx.fillStyle = '#48dbfb';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.2, y + h * 0.82);
    ctx.lineTo(x - w * 0.04, y + h * 0.82);
    ctx.lineTo(x - w * 0.12, y + h * 1.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h * 0.82);
    ctx.lineTo(x + w * 0.2, y + h * 0.82);
    ctx.lineTo(x + w * 0.12, y + h * 1.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawPowerupFeedback(ctx: CanvasRenderingContext2D, state: RacerState): void {
    const message = state.powerupMessage || state.activePowerupLabel;
    if (!message) return;

    const activeTime = state.activePowerupTime;
    const text = activeTime > 0 ? `${message}  ${activeTime.toFixed(1)}s` : message;
    const y = Math.max(18, state.height * 0.045);

    ctx.save();
    ctx.font = `bold ${state.width < 760 ? 17 : 20}px sans-serif`;
    const width = Math.min(state.width * 0.62, Math.max(190, ctx.measureText(text).width + 42));
    const x = (state.width - width) / 2;
    ctx.fillStyle = 'rgba(5, 12, 24, 0.82)';
    ctx.strokeStyle = state.nitroTime > 0 ? '#48dbfb' : state.slowTime > 0 ? '#ef476f' : '#ffd43b';
    ctx.lineWidth = 2;
    this.roundedRectPath(ctx, x, y, width, 42, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, state.width / 2, y + 21);
    ctx.restore();
  }

  private drawPlayerFallback(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, steer: number): void {
    const centerY = y + h / 2;
    const lean = steer * w * 0.06;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.92, w * 0.46, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    this.polygon(ctx, x - w * 0.5 + lean, centerY + h * 0.45, x + w * 0.5 + lean, centerY + h * 0.45, x + w * 0.28 - lean, centerY - h * 0.45, x - w * 0.28 - lean, centerY - h * 0.45, '#1f6fff');
    this.polygon(ctx, x - w * 0.22 - lean, centerY - h * 0.12, x + w * 0.22 - lean, centerY - h * 0.12, x + w * 0.11 - lean, centerY - h * 0.38, x - w * 0.11 - lean, centerY - h * 0.38, '#d9f2ff');
    ctx.restore();
  }

  private drawPlayerVisibilityMarker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, steer: number): void {
    const centerY = y + h / 2;
    const lean = steer * w * 0.06;

    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, Math.round(w * 0.018));
    this.strokePolygon(ctx, x - w * 0.48 + lean, centerY + h * 0.42, x + w * 0.48 + lean, centerY + h * 0.42, x + w * 0.26 - lean, centerY - h * 0.42, x - w * 0.26 - lean, centerY - h * 0.42);
    ctx.restore();
  }

  private roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
    const r = Math.min(radius, w / 2, h / 2);
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
  }

  private polygon(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  private strokePolygon(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.stroke();
  }
}
