import type { Renderer, Texture } from '../engine';
import { COLORS, RACER_CONFIG } from './config';
import type { RacerAssets } from './RacerAssets';
import type { RacerJoystickSnapshot } from './RacerJoystick';
import type { Segment } from './RacerState';
import type { AtlasFrame } from './SpriteAtlas';
import { BACKGROUND, SPRITES, SPRITE_SCALE } from './SpriteAtlas';
import { buildRacerUiLayout, type RacerCircle, type RacerRect, type RacerUiLayout } from './RacerUiLayout';
import type { RacerState } from './RacerState';

export type RacerPhase = 'menu' | 'playing' | 'paused' | 'finished';

export interface RacerRenderOptions {
  phase: RacerPhase;
  targetLaps: number;
  audioMuted: boolean;
  brakeActive: boolean;
  joystick: RacerJoystickSnapshot;
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
    this.drawHud(ctx, state, assets, options.targetLaps, options.audioMuted, layout);
    if (options.phase === 'playing') this.drawInRaceControls(ctx, layout, options.joystick, options.brakeActive);
    if (options.phase === 'playing') this.drawPauseButton(ctx, layout.pauseButton);
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

  private drawHud(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, targetLaps: number, audioMuted: boolean, layout: RacerUiLayout): void {
    const mph = Math.round(state.speed / RACER_CONFIG.maxSpeed * 220);
    const hud = layout.hud.panel;
    const row = layout.hud.rowHeight;
    const progress = Math.min(1, (state.completedLaps + state.position / Math.max(1, state.trackLength)) / targetLaps);

    this.roundedPanel(ctx, hud.x, hud.y, hud.w, hud.h, 'rgba(12, 18, 24, 0.58)', 'rgba(255,255,255,0.24)');
    ctx.font = `${layout.fonts.hud}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${mph} mph`, hud.x + 12, hud.y + 8);
    ctx.fillText(`Lap ${state.completedLaps}/${targetLaps}`, hud.x + 12, hud.y + 8 + row);
    ctx.fillText(`Time ${formatSeconds(state.currentLapTime)}`, hud.x + 12, hud.y + 8 + row * 2);
    ctx.fillText(`Best ${formatSeconds(state.bestLapTime)}`, hud.x + 12, hud.y + 8 + row * 3);
    ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'} · ${audioMuted ? 'Music off' : 'Music on'}`, hud.x + 12, hud.y + 8 + row * 4);

    const bar = layout.hud.progressBar;
    this.roundedPanel(ctx, bar.x, bar.y, bar.w, bar.h, 'rgba(0, 0, 0, 0.42)');
    this.roundedPanel(ctx, bar.x, bar.y, Math.max(6, bar.w * progress), bar.h, 'rgba(255, 220, 88, 0.92)');
  }

  private drawInRaceControls(ctx: CanvasRenderingContext2D, layout: RacerUiLayout, joystick: RacerJoystickSnapshot, brakeActive: boolean): void {
    this.drawJoystick(ctx, layout, joystick);
    this.drawBrakeButton(ctx, layout.controls.brakeButton, brakeActive);
  }

  private drawJoystick(ctx: CanvasRenderingContext2D, layout: RacerUiLayout, joystick: RacerJoystickSnapshot): void {
    const base = layout.controls.joystickBase;
    const knobX = joystick.active ? joystick.knobX : base.x;
    const knobY = joystick.active ? joystick.knobY : base.y;

    ctx.save();
    this.drawCircle(ctx, base, joystick.active ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.13)', 'rgba(255,255,255,0.42)', 2);
    this.drawCircle(ctx, { x: base.x, y: base.y, r: Math.max(10, base.r * 0.18) }, 'rgba(255,255,255,0.16)');
    this.drawCircle(ctx, { x: knobX, y: knobY, r: layout.controls.joystickKnobRadius }, joystick.active ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.42)', 'rgba(20,24,32,0.62)', 2);
    ctx.font = `${layout.fonts.note}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText('STEER', base.x, base.y + base.r + 10);
    ctx.restore();
  }

  private drawBrakeButton(ctx: CanvasRenderingContext2D, button: RacerCircle, active: boolean): void {
    const fill = active ? 'rgba(255, 92, 60, 0.86)' : 'rgba(255, 92, 60, 0.58)';
    this.drawCircle(ctx, button, fill, 'rgba(255,255,255,0.56)', 2);
    ctx.save();
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BRAKE', button.x, button.y);
    ctx.restore();
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, button: RacerCircle): void {
    this.drawCircle(ctx, button, 'rgba(12, 18, 24, 0.62)', 'rgba(255,255,255,0.52)', 2);
    ctx.save();
    ctx.fillStyle = '#ffffff';
    const barW = Math.max(4, button.r * 0.18);
    const barH = button.r * 0.92;
    ctx.fillRect(button.x - barW * 1.7, button.y - barH / 2, barW, barH);
    ctx.fillRect(button.x + barW * 0.7, button.y - barH / 2, barW, barH);
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
      ctx.fillText('左下摇杆转向，右下按钮刹车', state.width / 2, layout.menu.line3Y);
      this.drawButton(ctx, layout.menu.startButton, '开始比赛', layout);
      this.drawButton(ctx, layout.menu.leaderboardButton, '排行榜', layout);
      this.drawButton(ctx, layout.menu.audioButton, audioMuted ? '音乐：关' : '音乐：开', layout);
    } else if (phase === 'paused') {
      ctx.font = `${layout.fonts.title}px sans-serif`;
      ctx.fillText('已暂停', state.width / 2, layout.paused.titleY);
      ctx.font = `${layout.fonts.body}px sans-serif`;
      ctx.fillText('继续比赛、重新开始，或切换音乐', state.width / 2, layout.paused.line1Y);
      this.drawButton(ctx, layout.paused.resumeButton, '继续', layout);
      this.drawButton(ctx, layout.paused.restartButton, '重新开始', layout);
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

  private drawCircle(ctx: CanvasRenderingContext2D, target: RacerCircle, fill: string, stroke?: string, lineWidth = 1): void {
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  private roundedPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke?: string): void {
    const r = Math.min(16, w / 4, h / 4);
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
