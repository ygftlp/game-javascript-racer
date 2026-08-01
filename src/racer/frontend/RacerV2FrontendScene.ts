import { Scene, type Renderer } from '../../engine';
import type { RacerScene } from '../../scenes/RacerScene';
import { racerBackgroundTheme } from '../RacerBackgroundTheme';
import type { RacerState } from '../RacerState';
import { RACER_TRACKS, racerTrackIndex, type RacerRoadsideTheme, type RacerTrackDefinition } from '../RacerTrackDefinition';
import type { RacerUiPhase, RacerUiPressedTarget } from '../RacerUiRenderer';
import { buildRacerUiLayout, type RacerRect, type RacerTrackCarouselLayout, type RacerUiLayout } from '../RacerUiLayout';
import { RacerHomeRenderer } from './home/RacerHomeRenderer';

interface DrawableRacerScene {
  draw(renderer: Renderer): void;
}

interface RacerSceneRuntimeView {
  phase: RacerUiPhase;
  state: RacerState;
  savedBestLapTime: number;
  audioMuted: boolean;
  miniMapEnabled: boolean;
  controlCoachEnabled: boolean;
  hasShownControlCoach: boolean;
  pressedTarget: RacerUiPressedTarget;
  targetLaps: number;
  menuCarouselOffset: number;
  activeTrack: {
    id: string;
    name: string;
    roadsideTheme?: RacerRoadsideTheme;
    targetLaps?: number;
  };
  controlSensitivity: {
    label: string;
    description: string;
  };
}

interface MenuButtonSpec {
  target: RacerUiPressedTarget;
  rect: RacerRect;
  label: string;
  icon: string;
  primary?: boolean;
  /** Medium circular secondary action (track select on home). */
  secondary?: boolean;
  /** Circular market-style utility icon (rank / help / etc). */
  iconOnly?: boolean;
  /** Wide capsule used by modal footers (返回 / 开始). */
  capsule?: boolean;
}

const THEME = {
  // Premium commercial night-racing palette: deep navy, warm gold, cool cyan accents.
  backgroundTop: '#050b14',
  backgroundUpper: '#0b1730',
  backgroundMid: '#132742',
  backgroundHorizon: '#1c3550',
  backgroundBottom: '#0d1824',
  stage: '#0b141d',
  stageEdge: '#060b10',
  moon: 'rgba(220, 236, 255, 0.9)',
  moonGlow: 'rgba(140, 190, 255, 0.18)',
  goldGlow: 'rgba(255, 196, 74, 0.14)',
  cyanGlow: 'rgba(72, 190, 255, 0.1)',
  hillFar: 'rgba(10, 20, 34, 0.88)',
  hillNear: 'rgba(7, 14, 24, 0.94)',
  panel: 'rgba(10, 18, 28, 0.9)',
  panelStrong: 'rgba(9, 16, 24, 0.96)',
  panelBorder: 'rgba(255, 255, 255, 0.14)',
  primary: '#ffcc3d',
  primaryPressed: '#e8b428',
  primarySoft: 'rgba(255, 204, 61, 0.16)',
  primaryGlow: 'rgba(255, 204, 61, 0.28)',
  secondary: 'rgba(20, 32, 46, 0.92)',
  secondaryPressed: 'rgba(34, 50, 66, 0.96)',
  secondaryBorder: 'rgba(255, 255, 255, 0.18)',
  chip: 'rgba(12, 22, 34, 0.78)',
  chipPressed: 'rgba(28, 42, 56, 0.9)',
  chipBorder: 'rgba(255, 255, 255, 0.14)',
  text: '#f5f8fa',
  textBody: 'rgba(224, 234, 240, 0.9)',
  textMuted: 'rgba(168, 186, 196, 0.74)',
  danger: '#ff6b7d',
  nitro: '#48dbfb',
  carBody: '#3a8f78',
  carCabin: '#5fb396',
  carGlass: '#c4eef4',
  carLight: '#fff0b0'
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '暂无记录';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(1).padStart(4, '0')}`;
}

function isFrontendPhase(phase: RacerUiPhase): boolean {
  return phase === 'menu' || phase === 'trackSelect' || phase === 'settings' || phase === 'help';
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  rect: RacerRect,
  radius: number,
  fill: string | CanvasGradient,
  stroke?: string,
  lineWidth = 2
): void {
  roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function fillRoundedGradient(
  ctx: CanvasRenderingContext2D,
  rect: RacerRect,
  radius: number,
  top: string,
  bottom: string,
  stroke?: string
): void {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  fillRoundedRect(ctx, rect, radius, gradient, stroke);
}

export class RacerV2FrontendScene extends Scene {
  private frontendTime = 0;
  private readonly homeRenderer = new RacerHomeRenderer();

  constructor(private readonly inner: RacerScene) {
    super();
  }

  update(dt: number): void {
    this.frontendTime += dt;
    this.inner.update(dt);
  }

  protected draw(renderer: Renderer): void {
    const runtime = this.inner as unknown as RacerSceneRuntimeView;
    if (!isFrontendPhase(runtime.phase)) {
      (this.inner as unknown as DrawableRacerScene).draw(renderer);
      return;
    }

    const layout = buildRacerUiLayout(runtime.state.width, runtime.state.height);
    this.drawFrontend(renderer.ctx, runtime, layout);
  }

  private drawFrontend(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const width = runtime.state.width;
    const height = runtime.state.height;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    this.drawBackdrop(ctx, width, height);

    if (runtime.phase === 'menu') {
      this.homeRenderer.draw(ctx, runtime, width, height, this.frontendTime);
    } else if (runtime.phase === 'trackSelect') {
      this.drawModalScrim(ctx, width, height);
      this.drawTrackSelect(ctx, runtime, layout);
    } else if (runtime.phase === 'settings') {
      this.drawModalScrim(ctx, width, height);
      this.drawSettings(ctx, runtime, layout);
    } else {
      this.drawModalScrim(ctx, width, height);
      this.drawHelp(ctx, runtime, layout);
    }

    ctx.restore();
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Product-style frontend: premium night backdrop (sky → soft hills → stage floor).
    // Keep it atmospheric and quiet so UI hierarchy stays readable.
    const stageY = height * 0.56;

    // 1) Sky depth
    const sky = ctx.createLinearGradient(0, 0, 0, stageY);
    sky.addColorStop(0, THEME.backgroundTop);
    sky.addColorStop(0.35, THEME.backgroundUpper);
    sky.addColorStop(0.72, THEME.backgroundMid);
    sky.addColorStop(1, THEME.backgroundHorizon);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2) Moon + ambient glows (right side hero light)
    const moonX = width * 0.78;
    const moonY = height * 0.18;
    const moonR = Math.max(18, height * 0.045);
    ctx.save();
    const moonHalo = ctx.createRadialGradient(moonX, moonY, moonR * 0.2, moonX, moonY, moonR * 6);
    moonHalo.addColorStop(0, THEME.moonGlow);
    moonHalo.addColorStop(0.45, 'rgba(120, 170, 255, 0.08)');
    moonHalo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = moonHalo;
    ctx.fillRect(0, 0, width, stageY);

    const goldPool = ctx.createRadialGradient(width * 0.72, height * 0.42, 8, width * 0.72, height * 0.55, width * 0.28);
    goldPool.addColorStop(0, THEME.goldGlow);
    goldPool.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = goldPool;
    ctx.fillRect(0, 0, width, height);

    const cyanPool = ctx.createRadialGradient(width * 0.18, height * 0.7, 4, width * 0.18, height * 0.7, width * 0.22);
    cyanPool.addColorStop(0, THEME.cyanGlow);
    cyanPool.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cyanPool;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = THEME.moon;
    ctx.fill();
    ctx.restore();

    // 3) Stable star field (deterministic, no per-frame randomness / no flicker)
    ctx.save();
    for (let i = 0; i < 42; i += 1) {
      const sx = ((i * 97 + 13) % 1000) / 1000 * width;
      const sy = ((i * 53 + 29) % 1000) / 1000 * stageY * 0.72;
      const twinkle = 0.35 + 0.25 * Math.sin(this.frontendTime * 1.4 + i * 0.7);
      const size = i % 7 === 0 ? 1.8 : 1.1;
      ctx.globalAlpha = twinkle * (i % 5 === 0 ? 0.9 : 0.55);
      ctx.fillStyle = i % 4 === 0 ? '#fff4c8' : '#e8f2ff';
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.restore();

    // 4) Neon city silhouette: commercial arcade backdrop without bitmap assets.
    this.drawHillSilhouette(ctx, width, stageY, 0.42, height * 0.12, 'rgba(9, 18, 34, 0.78)');
    this.drawNeonCity(ctx, width, height, stageY);

    // 5) Horizon haze
    const haze = ctx.createLinearGradient(0, stageY - height * 0.1, 0, stageY + height * 0.04);
    haze.addColorStop(0, 'rgba(120, 170, 220, 0)');
    haze.addColorStop(0.55, 'rgba(120, 170, 220, 0.1)');
    haze.addColorStop(1, 'rgba(10, 18, 28, 0.35)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, stageY - height * 0.1, width, height * 0.14);

    // 6) Stage floor
    const stage = ctx.createLinearGradient(0, stageY, 0, height);
    stage.addColorStop(0, THEME.stage);
    stage.addColorStop(0.55, '#0d1722');
    stage.addColorStop(1, THEME.stageEdge);
    ctx.fillStyle = stage;
    ctx.fillRect(0, stageY, width, height - stageY);

    // Subtle floor sheen under the car only
    const sheen = ctx.createRadialGradient(width * 0.72, height * 0.78, 4, width * 0.72, height * 0.8, width * 0.22);
    sheen.addColorStop(0, 'rgba(255, 204, 61, 0.16)');
    sheen.addColorStop(0.45, 'rgba(72, 190, 255, 0.05)');
    sheen.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, stageY, width, height - stageY);

    // Stage edge line
    const edge = ctx.createLinearGradient(width * 0.15, stageY, width * 0.9, stageY);
    edge.addColorStop(0, 'rgba(255,255,255,0)');
    edge.addColorStop(0.45, 'rgba(255, 204, 61, 0.42)');
    edge.addColorStop(0.7, 'rgba(120, 190, 255, 0.22)');
    edge.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, stageY, width, 2);

    // 7) Edge vignette — focuses attention on center content
    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.48, height * 0.2, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  private drawHillSilhouette(
    ctx: CanvasRenderingContext2D,
    width: number,
    baseY: number,
    phase: number,
    amplitude: number,
    fill: string
  ): void {
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    const steps = 8;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = width * t;
      const wave = Math.sin((t + phase) * Math.PI * 2.2) * 0.55 + Math.sin((t + phase * 1.7) * Math.PI * 1.3) * 0.45;
      const y = baseY - amplitude * (0.35 + (wave + 1) * 0.32);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(width, baseY);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private drawNeonCity(ctx: CanvasRenderingContext2D, width: number, height: number, baseY: number): void {
    ctx.save();
    const leftSafe = clamp(width * 0.075, 52, 84);
    const skylineY = baseY - height * 0.23;
    for (let i = 0; i < 28; i += 1) {
      const lane = i < 13 ? i : i + 5;
      const x = leftSafe + lane * width * 0.03;
      if (x > width - 80) continue;
      const w = 8 + (i % 4) * 5;
      const h = height * (0.08 + (i % 7) * 0.014);
      const y = baseY - h;
      const g = ctx.createLinearGradient(x, y, x, baseY);
      g.addColorStop(0, i % 3 === 0 ? 'rgba(105, 226, 255, 0.45)' : 'rgba(225, 75, 255, 0.38)');
      g.addColorStop(1, 'rgba(10, 17, 34, 0.92)');
      fillRoundedRect(ctx, { x, y, w, h }, 2, g, 'rgba(255,255,255,0.08)', 1);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 204, 61, 0.5)' : 'rgba(91, 218, 255, 0.55)';
      ctx.fillRect(x + 2, y + 5, Math.max(2, w - 4), 2);
      if (i % 5 === 0) ctx.fillRect(x + w / 2 - 1, y - 16, 2, 16);
    }

    const scan = ctx.createLinearGradient(width * 0.18, skylineY, width * 0.72, skylineY);
    scan.addColorStop(0, 'rgba(255, 75, 180, 0)');
    scan.addColorStop(0.3, 'rgba(255, 75, 180, 0.55)');
    scan.addColorStop(0.62, 'rgba(91, 218, 255, 0.5)');
    scan.addColorStop(1, 'rgba(255, 204, 61, 0)');
    ctx.fillStyle = scan;
    for (let i = 0; i < 3; i += 1) ctx.fillRect(width * 0.2 + i * 24, skylineY + i * 10, width * 0.45, 2);
    ctx.restore();
  }

  private drawStatusCard(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, width: number, height: number): void {
    // Metal trophy card like the reference: compact but premium.
    const leftSafe = clamp(width * 0.075, 52, 84);
    const card: RacerRect = {
      x: leftSafe + 8,
      y: height * 0.035,
      w: clamp(width * 0.22, 178, 230),
      h: clamp(height * 0.13, 58, 76)
    };
    const bestText = formatSeconds(runtime.savedBestLapTime);
    const trophyX = card.x + card.w - card.h * 0.52;
    const trophyY = card.y + card.h * 0.54;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 205, 124, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    const metal = ctx.createLinearGradient(card.x, card.y, card.x + card.w, card.y + card.h);
    metal.addColorStop(0, 'rgba(232, 217, 190, 0.92)');
    metal.addColorStop(0.45, 'rgba(112, 122, 132, 0.88)');
    metal.addColorStop(1, 'rgba(42, 48, 58, 0.94)');
    fillRoundedRect(ctx, card, 8, metal, 'rgba(255, 220, 160, 0.82)', 2);
    ctx.restore();

    fillRoundedRect(ctx, { x: card.x + 4, y: card.y + 4, w: card.w - 8, h: card.h - 8 }, 6, 'rgba(0,0,0,0)', 'rgba(255,255,255,0.2)', 1);

    ctx.fillStyle = '#151b24';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${clamp(card.h * 0.18, 10, 13)}px sans-serif`;
    ctx.fillText('最佳成绩:', card.x + 14, card.y + 10);
    ctx.font = `bold ${clamp(card.h * 0.25, 13, 18)}px sans-serif`;
    ctx.fillText(bestText, card.x + 14, card.y + card.h * 0.36);
    ctx.font = `${clamp(card.h * 0.15, 9, 11)}px sans-serif`;
    ctx.fillText(`${runtime.activeTrack.name} · ${runtime.targetLaps}圈`, card.x + 14, card.y + card.h * 0.72);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 230, 158, 0.85)';
    ctx.fillStyle = 'rgba(255, 204, 61, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trophyX - 16, trophyY - 12);
    ctx.lineTo(trophyX + 16, trophyY - 12);
    ctx.quadraticCurveTo(trophyX + 13, trophyY + 8, trophyX, trophyY + 10);
    ctx.quadraticCurveTo(trophyX - 13, trophyY + 8, trophyX - 16, trophyY - 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(trophyX - 8, trophyY + 11);
    ctx.lineTo(trophyX + 8, trophyY + 11);
    ctx.lineTo(trophyX + 12, trophyY + 23);
    ctx.lineTo(trophyX - 12, trophyY + 23);
    ctx.closePath();
    ctx.stroke();
    ctx.font = `bold ${clamp(card.h * 0.2, 10, 14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 230, 158, 0.9)';
    ctx.fillText('★', trophyX, trophyY - 2);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawBrandBanner(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Neon logo lockup: title + speed streaks, not a button.
    const centerX = width * 0.52;
    const topY = height * 0.035;
    const titleY = topY + clamp(height * 0.035, 16, 22);

    ctx.save();
    ctx.shadowColor = 'rgba(255, 143, 82, 0.7)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd47a';
    ctx.font = `bold ${clamp(width / 36, 22, 34)}px sans-serif`;
    ctx.fillText('极速公路', centerX, titleY);
    ctx.shadowColor = 'rgba(178, 88, 255, 0.55)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff0b0';
    ctx.font = `bold ${clamp(width / 108, 10, 13)}px sans-serif`;
    ctx.fillText('(复古街机赛车)', centerX, titleY + clamp(height * 0.042, 18, 24));

    const lineY = titleY;
    const streak = ctx.createLinearGradient(centerX - 180, lineY, centerX + 180, lineY);
    streak.addColorStop(0, 'rgba(255, 76, 190, 0)');
    streak.addColorStop(0.32, 'rgba(255, 76, 190, 0.7)');
    streak.addColorStop(0.5, 'rgba(255, 204, 61, 0)');
    streak.addColorStop(0.68, 'rgba(91, 218, 255, 0.7)');
    streak.addColorStop(1, 'rgba(91, 218, 255, 0)');
    ctx.fillStyle = streak;
    ctx.fillRect(centerX - 190, lineY - 3, 130, 3);
    ctx.fillRect(centerX + 60, lineY - 3, 130, 3);
    ctx.fillRect(centerX - 165, lineY + 9, 95, 2);
    ctx.fillRect(centerX + 70, lineY + 9, 95, 2);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawSystemBar(ctx: CanvasRenderingContext2D, rect: RacerRect, pressed: boolean): void {
    const target = { ...rect, y: rect.y + (pressed ? 2 : 0) };
    const centerX = target.x + target.w / 2;
    const centerY = target.y + target.h / 2;
    const radius = Math.min(target.w, target.h) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 204, 61, 0.28)';
    ctx.shadowBlur = pressed ? 4 : 10;
    ctx.shadowOffsetY = pressed ? 1 : 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / 3;
      const x = centerX + Math.cos(angle) * (radius - 1);
      const y = centerY + Math.sin(angle) * (radius - 1);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = pressed ? THEME.secondaryPressed : 'rgba(28, 38, 50, 0.96)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 204, 61, 0.82)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(target.h * 0.48, 18, 22)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚙', centerX, centerY + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawMenuButtons(ctx: CanvasRenderingContext2D, layout: RacerUiLayout, pressed: RacerUiPressedTarget): void {
    // Circular market home: play orb + small utilities (track pick is the carousel).
    const buttons: MenuButtonSpec[] = [
      { target: 'menu-start', rect: layout.menu.startButton, label: '开始比赛', icon: '▶', primary: true },
      { target: 'menu-leaderboard', rect: layout.menu.leaderboardButton, label: '排行榜', icon: '♛', iconOnly: true },
      { target: 'menu-help', rect: layout.menu.helpButton, label: '说明', icon: '?', iconOnly: true }
    ];
    for (const button of buttons) this.drawActionButton(ctx, button, pressed === button.target);
  }

  private drawTrackCarousel(
    ctx: CanvasRenderingContext2D,
    runtime: RacerSceneRuntimeView,
    carousel: RacerTrackCarouselLayout
  ): void {
    const activeIndex = Math.max(0, racerTrackIndex(runtime.activeTrack.id));
    const dragOffset = Number.isFinite(runtime.menuCarouselOffset) ? runtime.menuCarouselOffset : 0;

    ctx.save();
    // Clip to hit band so peer cards peek without painting into chrome.
    roundedRectPath(
      ctx,
      carousel.hitRect.x,
      carousel.hitRect.y,
      carousel.hitRect.w,
      carousel.hitRect.h,
      16
    );
    ctx.clip();

    // Draw far cards first so the active card sits on top.
    const order = RACER_TRACKS.map((_, index) => index).sort((a, b) => {
      const da = Math.abs(a - activeIndex + dragOffset / Math.max(1, carousel.stepX));
      const db = Math.abs(b - activeIndex + dragOffset / Math.max(1, carousel.stepX));
      return db - da;
    });

    for (const index of order) {
      const track = RACER_TRACKS[index];
      if (!track) continue;
      const delta = index - activeIndex;
      const centerX = carousel.centerX + delta * carousel.stepX + dragOffset;
      const distance = Math.abs(delta + dragOffset / Math.max(1, carousel.stepX));
      const scale = clamp(1 - distance * 0.1, 0.86, 1);
      const alpha = clamp(1 - distance * 0.28, 0.42, 1);
      this.drawTrackCarouselCard(ctx, track, centerX, carousel.centerY, carousel.cardW, carousel.cardH, scale, alpha, distance < 0.35);
    }
    ctx.restore();

    // Page dots under the strip.
    const dotCount = RACER_TRACKS.length;
    const dotGap = 14;
    const dotsW = (dotCount - 1) * dotGap;
    const dotsStartX = carousel.centerX - dotsW / 2;
    for (let i = 0; i < dotCount; i += 1) {
      const selected = i === activeIndex;
      const dx = dotsStartX + i * dotGap;
      ctx.beginPath();
      ctx.arc(dx, carousel.dotsY, selected ? 4.2 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = selected ? THEME.primary : 'rgba(255,255,255,0.28)';
      ctx.fill();
    }
  }

  private drawTrackCarouselCard(
    ctx: CanvasRenderingContext2D,
    track: RacerTrackDefinition,
    centerX: number,
    centerY: number,
    cardW: number,
    cardH: number,
    scale: number,
    alpha: number,
    active: boolean
  ): void {
    const w = cardW * scale;
    const h = cardH * scale;
    const rect: RacerRect = { x: centerX - w / 2, y: centerY - h / 2, w, h };
    const radius = Math.min(18, rect.h * 0.14);
    const mood = racerBackgroundTheme(track.roadsideTheme);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.shadowColor = active ? 'rgba(255, 168, 76, 0.5)' : 'rgba(91, 218, 255, 0.22)';
    ctx.shadowBlur = active ? 22 : 10;
    ctx.shadowOffsetY = active ? 4 : 2;

    const glass = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    glass.addColorStop(0, active ? 'rgba(41, 63, 76, 0.72)' : 'rgba(30, 82, 112, 0.35)');
    glass.addColorStop(0.5, active ? 'rgba(83, 119, 130, 0.42)' : 'rgba(18, 48, 82, 0.3)');
    glass.addColorStop(1, active ? 'rgba(12, 21, 34, 0.88)' : mood.fallbackNear);
    fillRoundedRect(ctx, rect, radius, glass, active ? 'rgba(255, 190, 92, 0.95)' : 'rgba(91, 218, 255, 0.45)', active ? 2.4 : 1.4);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Wireframe terrain grid.
    ctx.save();
    roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.clip();
    ctx.strokeStyle = active ? 'rgba(120, 240, 255, 0.38)' : 'rgba(120, 240, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i += 1) {
      const y = rect.y + rect.h * (0.18 + i * 0.07);
      ctx.beginPath();
      ctx.moveTo(rect.x + 18, y);
      ctx.quadraticCurveTo(rect.x + rect.w * 0.44, y - Math.sin(i) * 18, rect.x + rect.w - 18, y + Math.cos(i) * 10);
      ctx.stroke();
    }
    for (let i = 0; i < 8; i += 1) {
      const x = rect.x + rect.w * (0.12 + i * 0.1);
      ctx.beginPath();
      ctx.moveTo(x, rect.y + rect.h * 0.15);
      ctx.quadraticCurveTo(x + Math.sin(i * 1.7) * 18, rect.y + rect.h * 0.5, x + Math.cos(i) * 10, rect.y + rect.h * 0.86);
      ctx.stroke();
    }

    // Track outline stroke on the card.
    ctx.strokeStyle = active ? 'rgba(240, 255, 220, 0.88)' : 'rgba(220, 255, 255, 0.45)';
    ctx.lineWidth = active ? 4 : 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w * 0.22, rect.y + rect.h * 0.36);
    ctx.bezierCurveTo(rect.x + rect.w * 0.34, rect.y + rect.h * 0.05, rect.x + rect.w * 0.66, rect.y + rect.h * 0.14, rect.x + rect.w * 0.68, rect.y + rect.h * 0.34);
    ctx.bezierCurveTo(rect.x + rect.w * 0.71, rect.y + rect.h * 0.58, rect.x + rect.w * 0.35, rect.y + rect.h * 0.62, rect.x + rect.w * 0.42, rect.y + rect.h * 0.78);
    ctx.stroke();
    ctx.restore();

    // Energy core / gem.
    const coreX = rect.x + rect.w * 0.67;
    const coreY = rect.y + rect.h * 0.48;
    const coreR = rect.h * (active ? 0.28 : 0.22);
    const core = ctx.createRadialGradient(coreX, coreY, 2, coreX, coreY, coreR * 1.8);
    core.addColorStop(0, 'rgba(255, 246, 160, 1)');
    core.addColorStop(0.35, 'rgba(255, 170, 42, 0.86)');
    core.addColorStop(1, 'rgba(255, 128, 42, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreR * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 225, 102, 0.92)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = -Math.PI / 2 + i * Math.PI / 4;
      const r = i % 2 === 0 ? coreR : coreR * 0.58;
      const x = coreX + Math.cos(a) * r;
      const y = coreY + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Bottom title scrim.
    const scrim = ctx.createLinearGradient(rect.x, rect.y + rect.h * 0.55, rect.x, rect.y + rect.h);
    scrim.addColorStop(0, 'rgba(4, 8, 14, 0)');
    scrim.addColorStop(1, 'rgba(4, 8, 14, 0.72)');
    fillRoundedRect(ctx, { x: rect.x, y: rect.y + rect.h * 0.52, w: rect.w, h: rect.h * 0.48 }, radius, scrim);

    if (active) fillRoundedRect(ctx, { x: rect.x + 8, y: rect.y + rect.h * 0.22, w: 4, h: rect.h * 0.32 }, 2, THEME.primary);

    ctx.fillStyle = active ? THEME.text : THEME.textBody;
    ctx.font = `bold ${clamp(rect.h * 0.17, 15, 23)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(track.name, rect.x + 20, rect.y + rect.h - 34);

    ctx.fillStyle = active ? THEME.primary : THEME.textMuted;
    ctx.font = `${clamp(rect.h * 0.12, 11, 15)}px sans-serif`;
    ctx.fillText(`${track.targetLaps} 圈`, rect.x + 20, rect.y + rect.h - 14);

    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawCircleButton(
    ctx: CanvasRenderingContext2D,
    rect: RacerRect,
    label: string,
    icon: string,
    pressed: boolean,
    tone: 'primary' | 'secondary' | 'utility'
  ): void {
    const size = Math.min(rect.w, rect.h);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + size / 2;
    const r = size / 2 - 1;

    if (tone === 'primary') {
      ctx.save();
      const flame = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.45);
      flame.addColorStop(0, pressed ? '#ffd45c' : '#fff1a6');
      flame.addColorStop(0.42, pressed ? '#ff9f1c' : '#ffb72e');
      flame.addColorStop(0.74, 'rgba(255, 88, 36, 0.82)');
      flame.addColorStop(1, 'rgba(255, 90, 30, 0)');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 221, 112, 0.42)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i += 1) {
        const a = i * Math.PI * 2 / 14 + this.frontendTime * 0.35;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.84, cy + Math.sin(a) * r * 0.84);
        ctx.lineTo(cx + Math.cos(a) * r * (1.08 + (i % 3) * 0.07), cy + Math.sin(a) * r * (1.08 + (i % 3) * 0.07));
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(cx, cy - r * 0.18, r * 0.05, cx, cy, r * 0.82);
      core.addColorStop(0, '#fff4b8');
      core.addColorStop(0.55, '#ffd45c');
      core.addColorStop(1, '#ff9f1c');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.62)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#172337';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.26, cy - r * 0.42);
      ctx.lineTo(cx + r * 0.42, cy);
      ctx.lineTo(cx - r * 0.26, cy + r * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = THEME.text;
      ctx.font = `bold ${clamp(size * 0.15, 11, 14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, rect.y + size + 16);
      ctx.restore();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      return;
    }

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.34)';
    ctx.shadowBlur = pressed ? 2 : 12;
    ctx.shadowOffsetY = pressed ? 1 : 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (tone === 'secondary') {
      const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
      g.addColorStop(0, pressed ? 'rgba(56, 78, 96, 0.98)' : 'rgba(34, 52, 68, 0.98)');
      g.addColorStop(1, pressed ? THEME.secondaryPressed : 'rgba(16, 28, 40, 0.98)');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = pressed ? THEME.chipPressed : 'rgba(14, 24, 36, 0.94)';
    }
    ctx.fill();
    ctx.strokeStyle = tone === 'secondary' ? 'rgba(255, 204, 61, 0.72)' : pressed ? THEME.primary : 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Inner ring for depth.
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.74, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 204, 61, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (tone === 'secondary') {
      // Mini track mark: two curved lanes so it reads without relying on rare glyphs.
      ctx.strokeStyle = THEME.primary;
      ctx.lineWidth = Math.max(2.5, r * 0.12);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.42, -0.9, 2.2);
      ctx.stroke();
      ctx.lineWidth = Math.max(1.8, r * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.22, -0.7, 2.0);
      ctx.stroke();
      ctx.fillStyle = THEME.primary;
      ctx.beginPath();
      ctx.arc(cx + r * 0.28, cy - r * 0.18, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = THEME.primary;
      ctx.font = `bold ${clamp(r * 0.72, 16, 22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, cx, cy + 0.5);
    }

    // Label sits in the reserved band under the orb (layout hitH includes this clearance).
    const labelOffset = tone === 'secondary' ? 14 : 13;
    ctx.fillStyle = tone === 'secondary' ? THEME.textBody : THEME.textMuted;
    ctx.font = `bold ${clamp(size * 0.17, 11, 12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, rect.y + size + labelOffset);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawActionButton(ctx: CanvasRenderingContext2D, button: MenuButtonSpec, pressed: boolean): void {
    const rect = { ...button.rect, y: button.rect.y + (pressed ? 2 : 0) };

    // Modal footer and commercial home capsules stay rectangular so labels remain readable.
    if (button.capsule) {
      if (button.primary) {
        if (!pressed) {
          ctx.save();
          ctx.shadowColor = THEME.primaryGlow;
          ctx.shadowBlur = 18;
          fillRoundedRect(ctx, { x: rect.x - 1, y: rect.y - 1, w: rect.w + 2, h: rect.h + 2 }, rect.h / 2 + 1, THEME.primarySoft);
          ctx.restore();
        }
        fillRoundedGradient(
          ctx,
          rect,
          rect.h / 2,
          pressed ? THEME.primaryPressed : '#ffe27a',
          pressed ? '#d9a61f' : THEME.primary,
          'rgba(255,255,255,0.5)'
        );
        ctx.fillStyle = '#142033';
        ctx.font = `bold ${clamp(rect.h * 0.42, 18, 23)}px sans-serif`;
      } else {
        fillRoundedGradient(
          ctx,
          rect,
          rect.h / 2,
          pressed ? 'rgba(48, 66, 82, 0.98)' : 'rgba(18, 30, 44, 0.9)',
          pressed ? THEME.secondaryPressed : 'rgba(9, 18, 28, 0.9)',
          pressed ? THEME.primary : 'rgba(255,255,255,0.16)'
        );
        ctx.fillStyle = button.iconOnly ? THEME.textMuted : THEME.text;
        ctx.font = `bold ${clamp(rect.h * 0.38, 12, 15)}px sans-serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 0.5);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      return;
    }

    if (button.primary) {
      this.drawCircleButton(ctx, rect, button.label, button.icon, pressed, 'primary');
      return;
    }
    if (button.secondary) {
      this.drawCircleButton(ctx, rect, button.label, button.icon, pressed, 'secondary');
      return;
    }
    this.drawCircleButton(ctx, rect, button.label, button.icon, pressed, 'utility');
  }

  private drawVehicleShowcase(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Hero car is the commercial home focal point; bottom controls stay below it.
    const carW = clamp(width * 0.32, 230, 360);
    const carH = carW * 0.44;
    const x = width * 0.68;
    const floatY = Math.sin(this.frontendTime * 1.6) * 2.4;
    const y = height * 0.5 + floatY;
    const shadowScale = 1 - Math.sin(this.frontendTime * 1.6) * 0.03;
    const body: RacerRect = { x: x - carW / 2, y: y - carH * 0.28, w: carW, h: carH * 0.56 };
    const cabin: RacerRect = { x: x - carW * 0.28, y: y - carH * 0.72, w: carW * 0.56, h: carH * 0.48 };

    // Ground spotlight under the car.
    ctx.save();
    const ground = ctx.createRadialGradient(x, y + carH * 0.55, 4, x, y + carH * 0.55, carW * 0.62);
    ground.addColorStop(0, 'rgba(255, 204, 61, 0.22)');
    ground.addColorStop(0.35, 'rgba(72, 190, 255, 0.08)');
    ground.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ground;
    ctx.fillRect(x - carW, y, carW * 2, carH);

    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + carH * 0.58, carW * 0.5 * shadowScale, carH * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Soft ambient halo behind body.
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = THEME.primary;
    ctx.beginPath();
    ctx.ellipse(x, y + carH * 0.12, carW * 0.42, carH * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Lower chassis / bumper plate for depth.
    fillRoundedGradient(
      ctx,
      { x: x - carW * 0.46, y: y + carH * 0.08, w: carW * 0.92, h: carH * 0.28 },
      12,
      '#2f6f5e',
      '#1d4a3f',
      'rgba(255,255,255,0.08)'
    );

    fillRoundedGradient(ctx, body, 16, '#5fb396', THEME.carBody, 'rgba(255,255,255,0.2)');

    // Body top highlight.
    fillRoundedRect(
      ctx,
      { x: body.x + body.w * 0.08, y: body.y + 4, w: body.w * 0.84, h: body.h * 0.18 },
      8,
      'rgba(255,255,255,0.12)'
    );

    // Side stripe.
    fillRoundedRect(
      ctx,
      { x: body.x + body.w * 0.08, y: body.y + body.h * 0.42, w: body.w * 0.84, h: 4 },
      2,
      'rgba(255, 204, 61, 0.55)'
    );

    fillRoundedGradient(ctx, cabin, 12, '#8ecdb0', THEME.carCabin, 'rgba(255,255,255,0.14)');

    // Windshield with slight cyan reflection.
    fillRoundedGradient(
      ctx,
      { x: x - carW * 0.2, y: y - carH * 0.64, w: carW * 0.4, h: carH * 0.26 },
      6,
      'rgba(214, 246, 250, 0.95)',
      'rgba(120, 190, 210, 0.72)',
      'rgba(255,255,255,0.25)'
    );

    // Headlights with bloom.
    for (const hx of [x - carW * 0.4, x + carW * 0.28]) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 240, 176, 0.65)';
      ctx.shadowBlur = 12;
      fillRoundedRect(ctx, { x: hx, y: y - carH * 0.08, w: carW * 0.14, h: carH * 0.14 }, 4, THEME.carLight);
      ctx.restore();
    }

    // Number plate.
    fillRoundedRect(
      ctx,
      { x: x - carW * 0.17, y: y + carH * 0.04, w: carW * 0.34, h: carH * 0.2 },
      5,
      '#0d1418',
      'rgba(255,255,255,0.18)'
    );
    ctx.fillStyle = THEME.primary;
    ctx.font = `bold ${clamp(carW / 17, 14, 21)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R-07', x, y + carH * 0.14);

    const wheelR = carH * 0.19;
    for (const wheelX of [x - carW * 0.34, x + carW * 0.34]) {
      const wy = y + carH * 0.3;
      ctx.beginPath();
      ctx.arc(wheelX, wy, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = '#0b1014';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.36)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(wheelX, wy, wheelR * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 204, 61, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(wheelX, wy, wheelR * 0.34, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 204, 61, 0.32)';
      ctx.fill();
    }

    // Tiny roof antenna / detail so silhouette isn't a pure box.
    ctx.strokeStyle = 'rgba(230, 240, 245, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + carW * 0.08, y - carH * 0.72);
    ctx.lineTo(x + carW * 0.08, y - carH * 0.88);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + carW * 0.08, y - carH * 0.9, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = THEME.nitro;
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawTrackSelect(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.trackSelect;
    this.drawPagePanel(
      ctx,
      page.panel,
      '选择赛道',
      '点选后自动保存',
      page.closeButton,
      runtime.pressedTarget === 'track-back'
    );

    for (let index = 0; index < Math.min(page.trackButtons.length, RACER_TRACKS.length); index += 1) {
      const track = RACER_TRACKS[index];
      const rect = page.trackButtons[index];
      if (!track || !rect) continue;
      const selected = track.id === runtime.activeTrack.id;
      const pressed = runtime.pressedTarget === `track-select-${index}`;
      const target = { ...rect, y: rect.y + (pressed ? 2 : 0) };

      if (selected) {
        fillRoundedGradient(ctx, target, 14, 'rgba(255, 212, 82, 0.22)', 'rgba(255, 212, 82, 0.08)', THEME.primary);
      } else {
        fillRoundedGradient(
          ctx,
          target,
          14,
          pressed ? 'rgba(56, 74, 86, 0.98)' : 'rgba(28, 42, 54, 0.94)',
          pressed ? THEME.secondaryPressed : 'rgba(14, 24, 34, 0.94)',
          'rgba(255,255,255,0.12)'
        );
      }

      // Rank badge
      const badgeSize = clamp(target.h * 0.46, 26, 34);
      fillRoundedRect(
        ctx,
        { x: target.x + 16, y: target.y + (target.h - badgeSize) / 2, w: badgeSize, h: badgeSize },
        10,
        selected ? THEME.primary : 'rgba(255,255,255,0.1)'
      );
      ctx.fillStyle = selected ? '#1a2430' : THEME.textBody;
      ctx.font = `bold ${clamp(badgeSize * 0.52, 13, 17)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), target.x + 16 + badgeSize / 2, target.y + target.h / 2 + 0.5);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const textX = target.x + 16 + badgeSize + 16;
      ctx.fillStyle = selected ? THEME.primary : THEME.text;
      ctx.font = `bold ${clamp(target.h * 0.3, 16, 20)}px sans-serif`;
      ctx.fillText(track.name, textX, target.y + target.h * 0.2);
      ctx.fillStyle = THEME.textMuted;
      ctx.font = `${clamp(target.h * 0.22, 12, 14)}px sans-serif`;
      ctx.fillText(track.description, textX, target.y + target.h * 0.56);
      ctx.textAlign = 'right';
      ctx.fillStyle = selected ? THEME.primary : THEME.textBody;
      ctx.font = `bold ${clamp(target.h * 0.24, 12, 15)}px sans-serif`;
      ctx.fillText(selected ? '已选择' : `${track.targetLaps} 圈`, target.x + target.w - 20, target.y + target.h * 0.38);
      ctx.textAlign = 'left';
    }

    this.drawActionButton(
      ctx,
      { target: 'track-back', rect: page.backButton, label: '返回', icon: '‹', capsule: true },
      runtime.pressedTarget === 'track-back'
    );
  }

  private drawSettings(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.settings;
    this.drawPagePanel(
      ctx,
      page.panel,
      '设置',
      '驾驶与显示',
      page.closeButton,
      runtime.pressedTarget === 'settings-back'
    );
    this.drawSettingRow(ctx, page.audioButton, '音乐与音效', runtime.audioMuted ? '关闭' : '开启', 'settings-audio', runtime.pressedTarget, !runtime.audioMuted);
    this.drawSettingRow(ctx, page.miniMapButton, '赛道小地图', runtime.miniMapEnabled ? '开启' : '关闭', 'settings-minimap', runtime.pressedTarget, runtime.miniMapEnabled);
    this.drawSettingRow(ctx, page.coachButton, '操作引导', runtime.controlCoachEnabled ? '开启' : '关闭', 'settings-coach', runtime.pressedTarget, runtime.controlCoachEnabled);
    this.drawSettingRow(ctx, page.sensitivityButton, '控制手感', runtime.controlSensitivity.label, 'settings-sensitivity', runtime.pressedTarget, true, runtime.controlSensitivity.description);
    this.drawSettingRow(ctx, page.resetCoachButton, '重看教学', runtime.hasShownControlCoach ? '点击重置' : '已准备', 'settings-reset-coach', runtime.pressedTarget, !runtime.hasShownControlCoach);
    this.drawActionButton(
      ctx,
      { target: 'settings-back', rect: page.backButton, label: '返回', icon: '‹', capsule: true },
      runtime.pressedTarget === 'settings-back'
    );
  }

  private drawSettingRow(
    ctx: CanvasRenderingContext2D,
    rect: RacerRect,
    title: string,
    value: string,
    target: RacerUiPressedTarget,
    pressedTarget: RacerUiPressedTarget,
    enabled: boolean,
    description = ''
  ): void {
    const pressed = target === pressedTarget;
    const targetRect = { ...rect, y: rect.y + (pressed ? 2 : 0) };
    fillRoundedGradient(
      ctx,
      targetRect,
      12,
      pressed ? 'rgba(56, 74, 86, 0.98)' : 'rgba(28, 42, 54, 0.94)',
      pressed ? THEME.secondaryPressed : 'rgba(14, 24, 34, 0.94)',
      enabled ? 'rgba(255, 204, 61, 0.45)' : 'rgba(255,255,255,0.1)'
    );

    const hasDesc = Boolean(description);
    const titleY = hasDesc ? targetRect.y + targetRect.h * 0.18 : targetRect.y + targetRect.h * 0.3;
    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(targetRect.h * 0.28, 14, 18)}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(title, targetRect.x + 18, titleY);
    if (hasDesc) {
      ctx.fillStyle = THEME.textMuted;
      ctx.font = `${clamp(targetRect.h * 0.2, 11, 13)}px sans-serif`;
      ctx.fillText(description, targetRect.x + 18, targetRect.y + targetRect.h * 0.55);
    }

    const pillW = clamp(targetRect.w * 0.22, 78, 118);
    const pillH = Math.max(24, Math.min(34, targetRect.h - 16));
    const pill: RacerRect = {
      x: targetRect.x + targetRect.w - pillW - 14,
      y: targetRect.y + (targetRect.h - pillH) / 2,
      w: pillW,
      h: pillH
    };
    fillRoundedRect(
      ctx,
      pill,
      pill.h / 2,
      enabled ? THEME.primarySoft : 'rgba(7, 17, 23, 0.7)',
      enabled ? THEME.primary : 'rgba(255,255,255,0.14)'
    );
    ctx.fillStyle = enabled ? THEME.primary : THEME.textMuted;
    ctx.font = `bold ${clamp(pill.h * 0.38, 11, 14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, pill.x + pill.w / 2, pill.y + pill.h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawHelp(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.help;
    this.drawPagePanel(
      ctx,
      page.panel,
      '操作说明',
      `目标 ${runtime.targetLaps} 圈 · 刷新最佳成绩`,
      page.closeButton,
      runtime.pressedTarget === 'help-back'
    );
    const lines = [
      { y: page.line1Y, text: '左下摇杆控制方向', color: THEME.textBody },
      { y: page.line2Y, text: '右下刹车 · 氮气按钮按住释放', color: THEME.textBody },
      { y: page.line3Y, text: '黄色 ≫ 立即加速', color: THEME.primary },
      { y: page.line4Y, text: '蓝色 N 补充 50% 氮气', color: THEME.nitro },
      { y: page.line5Y, text: '红黑地面是减速陷阱', color: THEME.danger },
      { y: page.line6Y, text: '减速期间氮气暂时失效', color: THEME.textMuted }
    ];
    ctx.textAlign = 'left';
    ctx.font = `${layout.small ? 15 : 17}px sans-serif`;
    const rowW = Math.min(page.panel.w - 64, 480);
    const rowX = runtime.state.width / 2 - rowW / 2;
    for (const line of lines) {
      const rowH = clamp(layout.fonts.body + 14, 28, 36);
      fillRoundedRect(
        ctx,
        { x: rowX, y: line.y - 2, w: rowW, h: rowH },
        10,
        'rgba(255,255,255,0.04)'
      );
      // Color accent dot
      ctx.beginPath();
      ctx.arc(rowX + 18, line.y + rowH / 2 - 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = line.color;
      ctx.fill();
      ctx.fillStyle = line.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(line.text, rowX + 34, line.y + rowH / 2 - 2);
    }
    ctx.textBaseline = 'top';
    this.drawActionButton(
      ctx,
      { target: 'help-start', rect: page.startButton, label: '开始比赛', icon: '▶', primary: true, capsule: true },
      runtime.pressedTarget === 'help-start'
    );
    this.drawActionButton(
      ctx,
      { target: 'help-back', rect: page.backButton, label: '返回', icon: '‹', capsule: true },
      runtime.pressedTarget === 'help-back'
    );
  }

  private drawModalScrim(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillRect(0, 0, width, height);
  }

  private drawCloseButton(ctx: CanvasRenderingContext2D, rect: RacerRect, pressed: boolean): void {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const r = Math.min(rect.w, rect.h) / 2 - 1;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = pressed ? 2 : 8;
    ctx.shadowOffsetY = pressed ? 1 : 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = pressed ? 'rgba(48, 64, 78, 0.98)' : 'rgba(18, 28, 40, 0.92)';
    ctx.fill();
    ctx.strokeStyle = pressed ? THEME.primary : 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // X mark
    const arm = r * 0.38;
    ctx.strokeStyle = THEME.textBody;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy - arm);
    ctx.lineTo(cx + arm, cy + arm);
    ctx.moveTo(cx + arm, cy - arm);
    ctx.lineTo(cx - arm, cy + arm);
    ctx.stroke();
  }

  private drawPagePanel(
    ctx: CanvasRenderingContext2D,
    panel: RacerRect,
    title: string,
    subtitle: string,
    closeButton?: RacerRect,
    closePressed = false
  ): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    fillRoundedGradient(ctx, panel, 20, 'rgba(22, 36, 48, 0.98)', THEME.panelStrong, 'rgba(255,255,255,0.14)');
    ctx.restore();

    // Compact left title accent (not a full-width header block).
    fillRoundedRect(
      ctx,
      { x: panel.x + 22, y: panel.y + 22, w: 4, h: 28 },
      2,
      THEME.primary
    );

    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(panel.w / 20, 20, 28)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, panel.x + 36, panel.y + 18);
    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${clamp(panel.w / 42, 12, 14)}px sans-serif`;
    ctx.fillText(subtitle, panel.x + 36, panel.y + 48);

    if (closeButton) {
      this.drawCloseButton(ctx, closeButton, closePressed);
    }
  }

  private drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Curved HUD tip bar: decorative arc, text remains straight for Canvas performance/readability.
    const centerX = width * 0.5;
    const y = height - clamp(height * 0.12, 48, 68);
    const barW = clamp(width * 0.44, 380, 560);
    const barH = clamp(height * 0.07, 28, 40);
    const rect: RacerRect = { x: centerX - barW / 2, y, w: barW, h: barH };

    ctx.save();
    ctx.translate(centerX, y + barH * 0.85);
    ctx.rotate(-0.035);
    ctx.translate(-centerX, -(y + barH * 0.85));
    ctx.shadowColor = 'rgba(255, 204, 61, 0.26)';
    ctx.shadowBlur = 10;
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, 'rgba(255, 190, 98, 0.08)');
    g.addColorStop(0.5, 'rgba(255, 204, 130, 0.28)');
    g.addColorStop(1, 'rgba(91, 218, 255, 0.08)');
    roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 212, 120, 0.52)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 226, 166, 0.82)';
    ctx.font = `bold ${clamp(width / 95, 10, 13)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♟  左下摇杆转向 · 右下刹车 · 拾取蓝色N后按住氮气  ❯', centerX, y + barH * 0.54);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }
}
