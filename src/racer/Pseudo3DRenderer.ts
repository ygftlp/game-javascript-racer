import type { Renderer, Texture } from 'lite-game-engine';
import { COLORS, RACER_CONFIG } from './config';
import type { RacerAssets } from './RacerAssets';
import type { Segment } from './RacerState';
import type { AtlasFrame } from './SpriteAtlas';
import { BACKGROUND, SPRITES, SPRITE_SCALE } from './SpriteAtlas';
import { buildRacerUiLayout, type RacerRect, type RacerUiLayout } from './RacerUiLayout';
import type { RacerState } from './RacerState';

export type RacerPhase = 'menu' | 'playing' | 'paused' | 'finished';

export interface RacerRenderOptions {
  phase: RacerPhase;
  targetLaps: number;
  audioMuted: boolean;
}

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

function percentRemaining(n: number, total: number): number {
  return (n % total) / total;
}

function interpolate(a: number, b: number, percent: number): number {
  return a + (b - a) * percent;
}

function exponentialFog(distance: number, density: number): number {
  return 1 / Math.pow(Math.E, distance * distance * density);
}

function formatSeconds(seconds: number): string {
  if (!seconds) return '--';
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds - minutes * 60);
  const tenths = Math.floor(10 * (seconds - Math.floor(seconds)));
  return minutes > 0 ? `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${tenths}` : `${wholeSeconds}.${tenths}`;
}

export class Pseudo3DRenderer {
  render(renderer: Renderer, state: RacerState, assets: RacerAssets | undefined, options: RacerRenderOptions): void {
    const ctx = renderer.ctx;
    const layout = buildRacerUiLayout(state.width, state.height);
    const projected: ProjectedSegment[] = [];
    const baseSegment = state.findSegment(state.position);
    const basePercent = percentRemaining(state.position, RACER_CONFIG.segmentLength);
    const playerSegment = state.findSegment(state.position + state.playerZ);
    const playerPercent = percentRemaining(state.position + state.playerZ, RACER_CONFIG.segmentLength);
    const playerY = interpolate(playerSegment.y1, playerSegment.y2, playerPercent);

    let maxY = state.height;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

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

    this.drawWorldSprites(ctx, state, projected, assets?.sprites ?? null, playerSegment, playerPercent);
    this.drawHud(ctx, state, assets, options.targetLaps, options.phase === 'playing', options.audioMuted, layout);
    if (options.phase === 'playing') this.drawTouchHints(ctx, layout);
    this.drawOverlay(ctx, state, assets, options.phase, options.targetLaps, options.audioMuted, layout);
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

  private drawBackgroundLayer(
    ctx: CanvasRenderingContext2D,
    image: CanvasImageSource,
    state: RacerState,
    frame: AtlasFrame,
    rotation: number,
    offset: number
  ): void {
    const imageW = frame.w / 2;
    const sourceX = frame.x + Math.floor(frame.w * rotation);
    const sourceW = Math.min(imageW, frame.x + frame.w - sourceX);
    const destW = Math.floor(state.width * (sourceW / imageW));

    ctx.drawImage(image, sourceX, frame.y, sourceW, frame.h, 0, offset, destW, state.height);
    if (sourceW < imageW) {
      ctx.drawImage(image, frame.x, frame.y, imageW - sourceW, frame.h, destW - 1, offset, state.width - destW, state.height);
    }
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

  private drawWorldSprites(
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    projected: ProjectedSegment[],
    texture: Texture | null,
    playerSegment: Segment,
    playerPercent: number
  ): void {
    for (let n = projected.length - 1; n >= 0; n -= 1) {
      const current = projected[n];
      const segment = current.segment;

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

      if (segment === playerSegment) {
        this.drawPlayer(ctx, state, texture, playerSegment, playerPercent);
      }
    }
  }

  private drawAtlasSprite(
    ctx: CanvasRenderingContext2D,
    texture: Texture | null,
    frame: AtlasFrame,
    scale: number,
    destX: number,
    destY: number,
    offsetX: number,
    offsetY: number,
    clipY: number,
    state: RacerState,
    fallbackColor: string
  ): void {
    const destW = frame.w * scale * state.width / 2 * (SPRITE_SCALE * RACER_CONFIG.roadWidth);
    const destH = frame.h * scale * state.width / 2 * (SPRITE_SCALE * RACER_CONFIG.roadWidth);
    const x = destX + destW * offsetX;
    const y = destY + destH * offsetY;
    const clipH = clipY ? Math.max(0, y + destH - clipY) : 0;

    if (clipH >= destH) return;

    if (texture?.loaded) {
      const image = texture.image as unknown as CanvasImageSource;
      ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h - frame.h * clipH / destH, x, y, destW, destH - clipH);
      return;
    }

    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, destW, destH - clipH);
  }

  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    texture: Texture | null,
    playerSegment: Segment,
    playerPercent: number
  ): void {
    const frame = state.input.steer < 0 ? SPRITES.PLAYER_LEFT : state.input.steer > 0 ? SPRITES.PLAYER_RIGHT : SPRITES.PLAYER_STRAIGHT;
    const x = state.width / 2;
    const y = state.height / 2 - (state.cameraDepth / state.playerZ * interpolate(playerSegment.y1, playerSegment.y2, playerPercent) * state.height / 2);
    const carW = Math.max(72, state.width * 0.1);
    const carH = carW * (frame.h / frame.w);
    const bounce = 1.5 * Math.random() * state.speed / RACER_CONFIG.maxSpeed * state.resolution;

    if (texture?.loaded) {
      const image = texture.image as unknown as CanvasImageSource;
      ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, x - carW / 2, y + bounce, carW, carH);
      return;
    }

    const lean = state.input.steer * carW * 0.08;
    this.polygon(ctx, x - carW * 0.5 + lean, y + carH * 0.45, x + carW * 0.5 + lean, y + carH * 0.45, x + carW * 0.28 - lean, y - carH * 0.45, x - carW * 0.28 - lean, y - carH * 0.45, COLORS.player);
    this.polygon(ctx, x - carW * 0.22 - lean, y - carH * 0.2, x + carW * 0.22 - lean, y - carH * 0.2, x + carW * 0.1 - lean, y - carH * 0.42, x - carW * 0.1 - lean, y - carH * 0.42, COLORS.playerTrim);
  }

  private drawHud(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, targetLaps: number, showPause: boolean, audioMuted: boolean, layout: RacerUiLayout): void {
    const mph = Math.round(state.speed / RACER_CONFIG.maxSpeed * 220);
    const hudW = layout.small ? 316 : 380;
    const hudH = layout.small ? 196 : 236;
    const row = layout.small ? 26 : 32;

    ctx.font = `${layout.fonts.hud}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = COLORS.hudShadow;
    ctx.fillRect(16, 16, hudW, hudH);
    ctx.fillStyle = COLORS.hud;
    ctx.fillText(`Speed ${mph} mph`, 32, 30);
    ctx.fillText(`Lap ${state.completedLaps}/${targetLaps}`, 32, 30 + row);
    ctx.fillText(`Time ${formatSeconds(state.currentLapTime)}`, 32, 30 + row * 2);
    ctx.fillText(`Best ${formatSeconds(state.bestLapTime)}`, 32, 30 + row * 3);
    ctx.fillText(`Perf ${state.tuning.label}`, 32, 30 + row * 4);
    ctx.fillText(assets?.statusLabel ?? 'Assets idle', 32, 30 + row * 5);
    if (!layout.small) ctx.fillText(`Music ${audioMuted ? 'Off' : 'On'}`, 32, 30 + row * 6);

    if (showPause) {
      this.drawButton(ctx, layout.pauseButton, '暂停', layout);
    }
  }

  private drawTouchHints(ctx: CanvasRenderingContext2D, layout: RacerUiLayout): void {
    const { left, right, brake } = layout.touchZones;

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#ffffff';
    this.fillRect(ctx, left);
    this.fillRect(ctx, right);
    this.fillRect(ctx, brake);
    ctx.globalAlpha = 1;

    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('左转', left.x + left.w / 2, left.y + left.h * 0.64);
    ctx.fillText('右转', right.x + right.w / 2, right.y + right.h * 0.64);
    ctx.fillText('刹车', brake.x + brake.w / 2, brake.y + brake.h / 2);
    ctx.restore();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, phase: RacerPhase, targetLaps: number, audioMuted: boolean, layout: RacerUiLayout): void {
    if (phase === 'playing') return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
    ctx.fillRect(0, 0, state.width, state.height);

    const active = phase === 'menu' ? layout.menu : phase === 'paused' ? layout.paused : layout.finished;
    this.roundedPanel(ctx, active.panel.x, active.panel.y, active.panel.w, active.panel.h, 'rgba(18, 24, 30, 0.92)', '#ffffff');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';

    if (phase === 'menu') {
      ctx.font = `${layout.fonts.title}px sans-serif`;
      ctx.fillText('Retro Racer', state.width / 2, layout.menu.titleY);
      ctx.font = `${layout.fonts.body}px sans-serif`;
      ctx.fillText(`资源包：${assets?.packLabel ?? 'Unknown'}`, state.width / 2, layout.menu.line1Y);
      ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'} / ${assets?.commercialSafe ? 'Commercial-safe' : 'Legacy assets'}`, state.width / 2, layout.menu.line2Y);
      ctx.fillText('左/右半屏转向，底部区域刹车', state.width / 2, layout.menu.line3Y);
      this.drawButton(ctx, layout.menu.startButton, '开始游戏', layout);
      this.drawButton(ctx, layout.menu.leaderboardButton, '排行榜', layout);
      this.drawButton(ctx, layout.menu.audioButton, audioMuted ? '音乐：关' : '音乐：开', layout);
    } else if (phase === 'paused') {
      ctx.font = `${layout.fonts.title}px sans-serif`;
      ctx.fillText('已暂停', state.width / 2, layout.paused.titleY);
      ctx.font = `${layout.fonts.body}px sans-serif`;
      ctx.fillText('点击继续，或切换音乐', state.width / 2, layout.paused.line1Y);
      this.drawButton(ctx, layout.paused.resumeButton, '继续', layout);
      this.drawButton(ctx, layout.paused.audioButton, audioMuted ? '音乐：关' : '音乐：开', layout);
    } else {
      ctx.font = `${layout.fonts.title}px sans-serif`;
      ctx.fillText('比赛完成', state.width / 2, layout.finished.titleY);
      ctx.font = `${layout.fonts.body}px sans-serif`;
      ctx.fillText(`圈数 ${state.completedLaps}/${targetLaps}`, state.width / 2, layout.finished.line1Y);
      ctx.fillText(`总时间 ${formatSeconds(state.totalRaceTime)}`, state.width / 2, layout.finished.line2Y);
      ctx.fillText(`最快圈 ${formatSeconds(state.bestLapTime)}`, state.width / 2, layout.finished.line3Y);
      this.drawButton(ctx, layout.finished.restartButton, '再来一局', layout);
      this.drawButton(ctx, layout.finished.shareButton, '分享', layout);
      this.drawButton(ctx, layout.finished.leaderboardButton, '排行榜', layout);
      ctx.font = `${layout.fonts.note}px sans-serif`;
      ctx.fillText('分享/排行榜当前为平台服务占位，后续接微信能力', state.width / 2, layout.finished.noteY);
    }

    ctx.textAlign = 'left';
  }

  private drawButton(ctx: CanvasRenderingContext2D, target: RacerRect, text: string, layout: RacerUiLayout): void {
    this.roundedPanel(ctx, target.x, target.y, target.w, target.h, 'rgba(255, 255, 255, 0.16)', '#ffffff');
    ctx.font = `${layout.fonts.button}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, target.x + target.w / 2, target.y + target.h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private fillRect(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    ctx.fillRect(target.x, target.y, target.w, target.h);
  }

  private roundedPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke?: string): void {
    const r = 16;
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
