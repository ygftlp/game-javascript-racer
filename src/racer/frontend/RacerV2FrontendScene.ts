import { Scene, type Renderer } from '../../engine';
import type { RacerScene } from '../../scenes/RacerScene';
import type { RacerState } from '../RacerState';
import type { RacerUiPressedTarget } from '../RacerUiRenderer';
import { buildRacerUiLayout, type RacerRect, type RacerUiLayout } from '../RacerUiLayout';

interface DrawableRacerScene {
  draw(renderer: Renderer): void;
}

interface RacerSceneRuntimeView {
  phase: string;
  state: RacerState;
  savedBestLapTime: number;
  audioMuted: boolean;
  pressedTarget: RacerUiPressedTarget;
  targetLaps: number;
  activeTrack: {
    name: string;
  };
}

interface MenuButtonSpec {
  target: RacerUiPressedTarget;
  rect: RacerRect;
  label: string;
  icon: string;
  primary?: boolean;
}

const THEME = {
  sky: '#9bdde4',
  grass: '#75c52c',
  skylineDark: '#064b27',
  skylineLight: '#0a6a32',
  roadTop: '#858b88',
  roadBottom: '#3d4441',
  lane: '#eef0e9',
  panel: 'rgba(24, 36, 42, 0.94)',
  panelBorder: '#789099',
  primary: '#ffd452',
  primaryPressed: '#efbd34',
  secondary: '#263139',
  secondaryPressed: '#313e47',
  secondaryBorder: '#65757f',
  text: '#ffffff',
  textMuted: '#afbec2'
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(1).padStart(4, '0')}`;
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
  fill: string,
  stroke?: string
): void {
  roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export class RacerV2FrontendScene extends Scene {
  constructor(private readonly inner: RacerScene) {
    super();
  }

  update(dt: number): void {
    this.inner.update(dt);
  }

  protected draw(renderer: Renderer): void {
    const runtime = this.inner as unknown as RacerSceneRuntimeView;
    if (runtime.phase !== 'menu') {
      (this.inner as unknown as DrawableRacerScene).draw(renderer);
      return;
    }

    const layout = buildRacerUiLayout(runtime.state.width, runtime.state.height);
    this.drawMenu(renderer.ctx, runtime, layout);
  }

  private drawMenu(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const width = runtime.state.width;
    const height = runtime.state.height;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    this.drawBackdrop(ctx, width, height);
    this.drawStatusCard(ctx, runtime, width, height);
    this.drawBrandBanner(ctx, width, height);
    this.drawSystemBar(ctx, runtime, width, height);
    this.drawVehicleShowcase(ctx, width, height);
    this.drawMenuButtons(ctx, layout, runtime.pressedTarget);
    this.drawFooter(ctx, width, height);

    ctx.restore();
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const horizon = height * 0.51;
    const roadTop = height * 0.56;

    ctx.fillStyle = THEME.sky;
    ctx.fillRect(0, 0, width, horizon);

    ctx.fillStyle = THEME.grass;
    ctx.fillRect(0, height * 0.18, width, roadTop - height * 0.18);

    ctx.fillStyle = THEME.skylineDark;
    for (let index = 0; index < 16; index += 1) {
      const blockW = width / 16;
      const x = index * blockW;
      const top = height * (0.34 + (index % 3) * 0.025);
      ctx.fillRect(x, top, blockW * 0.74, roadTop - top);
    }

    ctx.fillStyle = THEME.skylineLight;
    for (let index = 0; index < 11; index += 1) {
      const blockW = width / 11;
      const x = index * blockW + blockW * 0.25;
      const top = height * (0.39 + (index % 2) * 0.035);
      ctx.fillRect(x, top, blockW * 0.58, roadTop - top);
    }

    ctx.fillStyle = THEME.roadTop;
    ctx.fillRect(0, roadTop, width, height - roadTop);

    const roadGradient = ctx.createLinearGradient(0, roadTop, 0, height);
    roadGradient.addColorStop(0, THEME.roadTop);
    roadGradient.addColorStop(1, THEME.roadBottom);
    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, roadTop, width, height - roadTop);

    ctx.fillStyle = THEME.lane;
    const laneY = height * 0.72;
    for (let index = 0; index < 5; index += 1) {
      const x = width * (0.38 + index * 0.1);
      ctx.fillRect(x, laneY, width * 0.045, Math.max(4, height * 0.012));
    }
  }

  private drawStatusCard(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, width: number, height: number): void {
    const rect: RacerRect = {
      x: width * 0.045,
      y: height * 0.085,
      w: clamp(width * 0.18, 132, 190),
      h: clamp(height * 0.24, 82, 112)
    };

    fillRoundedRect(ctx, rect, 12, THEME.panel, THEME.panelBorder);

    const titleSize = clamp(width / 48, 16, 22);
    const bodySize = clamp(width / 72, 12, 16);
    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${titleSize}px sans-serif`;
    ctx.fillText('最佳成绩', rect.x + 14, rect.y + 12);

    ctx.fillStyle = THEME.primary;
    ctx.font = `bold ${titleSize + 3}px sans-serif`;
    ctx.fillText(formatSeconds(runtime.savedBestLapTime), rect.x + 14, rect.y + 37);

    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${bodySize}px sans-serif`;
    ctx.fillText(`赛道  ${runtime.activeTrack.name}`, rect.x + 14, rect.y + 67);
    ctx.fillText(`目标  ${runtime.targetLaps} 圈`, rect.x + 14, rect.y + 88);
  }

  private drawBrandBanner(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const banner: RacerRect = {
      x: width * 0.34,
      y: height * 0.085,
      w: width * 0.32,
      h: clamp(height * 0.135, 48, 70)
    };

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;
    fillRoundedRect(ctx, banner, 13, '#17242b', THEME.primary);
    ctx.restore();

    const iconR = banner.h * 0.26;
    const iconX = banner.x + banner.h * 0.52;
    const iconY = banner.y + banner.h / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
    ctx.fillStyle = THEME.primary;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(iconX - iconR * 0.25, iconY - iconR * 0.42);
    ctx.lineTo(iconX + iconR * 0.5, iconY);
    ctx.lineTo(iconX - iconR * 0.25, iconY + iconR * 0.42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(width / 34, 22, 32)}px sans-serif`;
    ctx.fillText('极速公路', banner.x + banner.h, banner.y + banner.h * 0.2);
    ctx.fillStyle = THEME.primary;
    ctx.font = `bold ${clamp(width / 105, 9, 12)}px sans-serif`;
    ctx.fillText('RETRO RACER', banner.x + banner.h, banner.y + banner.h * 0.66);

    ctx.fillStyle = THEME.primary;
    ctx.fillRect(banner.x + banner.w - 44, banner.y, 12, banner.h);
    ctx.fillStyle = '#ff9f1c';
    ctx.fillRect(banner.x + banner.w - 30, banner.y, 7, banner.h);
  }

  private drawSystemBar(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, width: number, height: number): void {
    const rect: RacerRect = {
      x: width - clamp(width * 0.13, 96, 132),
      y: height * 0.085,
      w: clamp(width * 0.095, 82, 108),
      h: clamp(height * 0.09, 36, 48)
    };
    fillRoundedRect(ctx, rect, rect.h / 2, 'rgba(32, 55, 62, 0.9)', '#7f979e');
    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(width / 55, 14, 18)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('•••', rect.x + rect.w * 0.35, rect.y + rect.h / 2 - 2);
    ctx.fillText(runtime.audioMuted ? '○' : '◉', rect.x + rect.w * 0.75, rect.y + rect.h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawMenuButtons(ctx: CanvasRenderingContext2D, layout: RacerUiLayout, pressed: RacerUiPressedTarget): void {
    const buttons: MenuButtonSpec[] = [
      { target: 'menu-start', rect: layout.menu.startButton, label: '开始比赛', icon: '▶', primary: true },
      { target: 'menu-track', rect: layout.menu.trackButton, label: '选择赛道', icon: '⌁' },
      { target: 'menu-leaderboard', rect: layout.menu.leaderboardButton, label: '排行榜', icon: '▥' },
      { target: 'menu-help', rect: layout.menu.helpButton, label: '操作说明', icon: '?' },
      { target: 'menu-settings', rect: layout.menu.settingsButton, label: '设置', icon: '⚙' }
    ];

    for (const button of buttons) {
      const isPressed = pressed === button.target;
      const offsetY = isPressed ? 2 : 0;
      const rect = { ...button.rect, y: button.rect.y + offsetY };
      const fill = button.primary
        ? isPressed ? THEME.primaryPressed : THEME.primary
        : isPressed ? THEME.secondaryPressed : THEME.secondary;
      const stroke = button.primary ? '#fff1a8' : THEME.secondaryBorder;

      fillRoundedRect(ctx, rect, 8, fill, stroke);
      ctx.fillStyle = button.primary ? '#1d2a30' : THEME.text;
      ctx.font = `bold ${clamp(rect.h * 0.42, 15, 21)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.label, rect.x + rect.w / 2 + 8, rect.y + rect.h / 2);
      ctx.fillStyle = button.primary ? '#43616a' : THEME.primary;
      ctx.font = `bold ${clamp(rect.h * 0.34, 13, 18)}px sans-serif`;
      ctx.fillText(button.icon, rect.x + rect.w * 0.12, rect.y + rect.h / 2);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawVehicleShowcase(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const carW = clamp(width * 0.32, 220, 360);
    const carH = carW * 0.42;
    const x = width * 0.69;
    const y = height * 0.67;

    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#111817';
    ctx.beginPath();
    ctx.ellipse(x, y + carH * 0.62, carW * 0.52, carH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#58735f';
    fillRoundedRect(ctx, { x: x - carW / 2, y: y - carH * 0.35, w: carW, h: carH * 0.58 }, 12, '#58735f');
    ctx.fillStyle = '#778d7d';
    fillRoundedRect(ctx, { x: x - carW * 0.25, y: y - carH * 0.72, w: carW * 0.5, h: carH * 0.42 }, 8, '#778d7d');
    ctx.fillStyle = '#bde6ea';
    ctx.fillRect(x - carW * 0.18, y - carH * 0.64, carW * 0.36, carH * 0.23);

    ctx.fillStyle = '#e8efcf';
    ctx.fillRect(x - carW * 0.42, y - carH * 0.12, carW * 0.13, carH * 0.13);
    ctx.fillRect(x + carW * 0.29, y - carH * 0.12, carW * 0.13, carH * 0.13);

    ctx.fillStyle = '#11191c';
    ctx.fillRect(x - carW * 0.16, y + carH * 0.02, carW * 0.32, carH * 0.22);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${clamp(carW / 18, 13, 20)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R-07', x, y + carH * 0.13);

    const wheelR = carH * 0.18;
    for (const wheelX of [x - carW * 0.34, x + carW * 0.34]) {
      ctx.beginPath();
      ctx.arc(wheelX, y + carH * 0.28, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = '#101518';
      ctx.fill();
      ctx.strokeStyle = '#8b969b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const footerH = clamp(height * 0.065, 24, 34);
    ctx.fillStyle = 'rgba(18, 29, 32, 0.92)';
    ctx.fillRect(0, height - footerH, width, footerH);
    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${clamp(width / 90, 10, 14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('左下摇杆转向 · 右下刹车 · 拾取蓝色 N 后按住氮气', width / 2, height - footerH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }
}
