import { Scene, type Renderer } from '../../engine';
import type { RacerScene } from '../../scenes/RacerScene';
import type { RacerState } from '../RacerState';
import { RACER_TRACKS } from '../RacerTrackDefinition';
import type { RacerUiPhase, RacerUiPressedTarget } from '../RacerUiRenderer';
import { buildRacerUiLayout, type RacerRect, type RacerUiLayout } from '../RacerUiLayout';

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
  activeTrack: {
    id: string;
    name: string;
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
}

const THEME = {
  backgroundTop: '#edf6f7',
  backgroundBottom: '#cbdadd',
  stage: '#b9c8ca',
  stageEdge: '#8fa1a5',
  glow: 'rgba(255, 255, 255, 0.4)',
  panel: 'rgba(24, 36, 42, 0.94)',
  panelStrong: 'rgba(17, 31, 37, 0.97)',
  panelBorder: '#789099',
  primary: '#ffd452',
  primaryPressed: '#efbd34',
  primarySoft: 'rgba(255, 212, 82, 0.19)',
  secondary: '#263139',
  secondaryPressed: '#313e47',
  secondaryBorder: '#65757f',
  text: '#ffffff',
  textBody: '#d5e0e2',
  textMuted: '#afbec2',
  danger: '#ff6b7d',
  nitro: '#48dbfb'
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
  private frontendTime = 0;

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
      this.drawStatusCard(ctx, runtime, width, height);
      this.drawBrandBanner(ctx, width, height);
      this.drawSystemBar(ctx, layout.menu.settingsButton, runtime.pressedTarget === 'menu-settings');
      this.drawVehicleShowcase(ctx, width, height);
      this.drawMenuButtons(ctx, layout, runtime.pressedTarget);
      this.drawFooter(ctx, width, height);
    } else if (runtime.phase === 'trackSelect') {
      this.drawTrackSelect(ctx, runtime, layout);
    } else if (runtime.phase === 'settings') {
      this.drawSettings(ctx, runtime, layout);
    } else {
      this.drawHelp(ctx, runtime, layout);
    }

    ctx.restore();
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Product-style frontend: no race scenery, sprite background, grass, trees or road.
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, THEME.backgroundTop);
    background.addColorStop(1, THEME.backgroundBottom);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = THEME.glow;
    ctx.beginPath();
    ctx.arc(width * 0.72, height * 0.24, Math.max(width, height) * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const stageY = height * 0.57;
    const stageGradient = ctx.createLinearGradient(0, stageY, 0, height);
    stageGradient.addColorStop(0, THEME.stage);
    stageGradient.addColorStop(1, THEME.stageEdge);
    ctx.fillStyle = stageGradient;
    ctx.fillRect(0, stageY, width, height - stageY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.fillRect(0, stageY, width, 2);
  }

  private drawStatusCard(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, width: number, height: number): void {
    const card: RacerRect = {
      x: width * 0.045,
      y: height * 0.085,
      w: clamp(width * 0.18, 132, 190),
      h: clamp(height * 0.24, 82, 112)
    };

    fillRoundedRect(ctx, card, 12, THEME.panel, THEME.panelBorder);
    const titleSize = clamp(width / 48, 16, 22);
    const bodySize = clamp(width / 72, 12, 16);

    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${titleSize}px sans-serif`;
    ctx.fillText('最佳成绩', card.x + 14, card.y + 12);
    ctx.fillStyle = THEME.primary;
    ctx.font = `bold ${titleSize + 3}px sans-serif`;
    ctx.fillText(formatSeconds(runtime.savedBestLapTime), card.x + 14, card.y + 37);
    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${bodySize}px sans-serif`;
    ctx.fillText(`赛道  ${runtime.activeTrack.name}`, card.x + 14, card.y + 67);
    ctx.fillText(`目标  ${runtime.targetLaps} 圈`, card.x + 14, card.y + 87);
  }

  private drawBrandBanner(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const banner: RacerRect = {
      x: width * 0.34,
      y: height * 0.085,
      w: width * 0.32,
      h: clamp(height * 0.135, 48, 70)
    };

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
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
    ctx.fillRect(banner.x + banner.w - 44, banner.y, 12, banner.h);
    ctx.fillStyle = '#ff9f1c';
    ctx.fillRect(banner.x + banner.w - 30, banner.y, 7, banner.h);
  }

  private drawSystemBar(ctx: CanvasRenderingContext2D, rect: RacerRect, pressed: boolean): void {
    const target = { ...rect, y: rect.y + (pressed ? 2 : 0) };
    const centerX = target.x + target.w / 2;
    const centerY = target.y + target.h / 2;
    const radius = Math.min(target.w, target.h) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.24)';
    ctx.shadowBlur = pressed ? 2 : 6;
    ctx.shadowOffsetY = pressed ? 1 : 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = pressed ? THEME.secondaryPressed : 'rgba(32, 55, 62, 0.94)';
    ctx.fill();
    ctx.strokeStyle = THEME.primary;
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
    const buttons: MenuButtonSpec[] = [
      { target: 'menu-start', rect: layout.menu.startButton, label: '开始比赛', icon: '▶', primary: true },
      { target: 'menu-track', rect: layout.menu.trackButton, label: '选择赛道', icon: '⌁' },
      { target: 'menu-leaderboard', rect: layout.menu.leaderboardButton, label: '排行榜', icon: '▥' },
      { target: 'menu-help', rect: layout.menu.helpButton, label: '操作说明', icon: '?' }
    ];
    for (const button of buttons) this.drawActionButton(ctx, button, pressed === button.target);
  }

  private drawActionButton(ctx: CanvasRenderingContext2D, button: MenuButtonSpec, pressed: boolean): void {
    const rect = { ...button.rect, y: button.rect.y + (pressed ? 2 : 0) };
    const fill = button.primary
      ? pressed ? THEME.primaryPressed : THEME.primary
      : pressed ? THEME.secondaryPressed : THEME.secondary;
    fillRoundedRect(ctx, rect, 8, fill, button.primary ? '#fff1a8' : THEME.secondaryBorder);

    ctx.fillStyle = button.primary ? '#1d2a30' : THEME.text;
    ctx.font = `bold ${clamp(rect.h * 0.42, 15, 21)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.label, rect.x + rect.w / 2 + 8, rect.y + rect.h / 2);
    ctx.fillStyle = button.primary ? '#43616a' : THEME.primary;
    ctx.font = `bold ${clamp(rect.h * 0.34, 13, 18)}px sans-serif`;
    ctx.fillText(button.icon, rect.x + rect.w * 0.12, rect.y + rect.h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawVehicleShowcase(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const carW = clamp(width * 0.32, 220, 360);
    const carH = carW * 0.42;
    const x = width * 0.69;
    const floatY = Math.sin(this.frontendTime * 1.8) * 1.5;
    const y = height * 0.67 + floatY;
    const shadowScale = 1 - Math.sin(this.frontendTime * 1.8) * 0.015;

    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = '#111817';
    ctx.beginPath();
    ctx.ellipse(x, y + carH * 0.62, carW * 0.52 * shadowScale, carH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    fillRoundedRect(ctx, { x: x - carW / 2, y: y - carH * 0.35, w: carW, h: carH * 0.58 }, 12, '#58735f');
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

  private drawTrackSelect(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.trackSelect;
    this.drawPagePanel(ctx, page.panel, '选择赛道', '选择后立即保存，并返回首页');

    for (let index = 0; index < Math.min(page.trackButtons.length, RACER_TRACKS.length); index += 1) {
      const track = RACER_TRACKS[index];
      const rect = page.trackButtons[index];
      if (!track || !rect) continue;
      const selected = track.id === runtime.activeTrack.id;
      const pressed = runtime.pressedTarget === `track-select-${index}`;
      const target = { ...rect, y: rect.y + (pressed ? 2 : 0) };
      fillRoundedRect(
        ctx,
        target,
        10,
        selected ? THEME.primarySoft : pressed ? THEME.secondaryPressed : THEME.secondary,
        selected ? THEME.primary : THEME.secondaryBorder
      );
      ctx.fillStyle = selected ? THEME.primary : THEME.text;
      ctx.font = `bold ${clamp(target.h * 0.3, 16, 22)}px sans-serif`;
      ctx.fillText(`${index + 1}. ${track.name}`, target.x + 18, target.y + 10);
      ctx.fillStyle = THEME.textMuted;
      ctx.font = `${clamp(target.h * 0.2, 12, 16)}px sans-serif`;
      ctx.fillText(track.description, target.x + 18, target.y + target.h * 0.55);
      ctx.textAlign = 'right';
      ctx.fillStyle = selected ? THEME.primary : THEME.textBody;
      ctx.fillText(selected ? '已选择' : `${track.targetLaps} 圈`, target.x + target.w - 18, target.y + target.h * 0.36);
      ctx.textAlign = 'left';
    }

    this.drawActionButton(
      ctx,
      { target: 'track-back', rect: page.backButton, label: '返回菜单', icon: '‹', primary: true },
      runtime.pressedTarget === 'track-back'
    );
  }

  private drawSettings(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.settings;
    this.drawPagePanel(ctx, page.panel, '设置', '驾驶、显示与引导选项');
    this.drawSettingRow(ctx, page.audioButton, '音乐与音效', runtime.audioMuted ? '关闭' : '开启', 'settings-audio', runtime.pressedTarget, !runtime.audioMuted);
    this.drawSettingRow(ctx, page.miniMapButton, '赛道雷达', runtime.miniMapEnabled ? '开启' : '关闭', 'settings-minimap', runtime.pressedTarget, runtime.miniMapEnabled);
    this.drawSettingRow(ctx, page.coachButton, '操作引导', runtime.controlCoachEnabled ? '开启' : '关闭', 'settings-coach', runtime.pressedTarget, runtime.controlCoachEnabled);
    this.drawSettingRow(ctx, page.sensitivityButton, '控制手感', runtime.controlSensitivity.label, 'settings-sensitivity', runtime.pressedTarget, true, runtime.controlSensitivity.description);
    this.drawSettingRow(ctx, page.resetCoachButton, '重看教学', runtime.hasShownControlCoach ? '点击重置' : '已准备', 'settings-reset-coach', runtime.pressedTarget, !runtime.hasShownControlCoach);
    this.drawActionButton(
      ctx,
      { target: 'settings-back', rect: page.backButton, label: '返回菜单', icon: '‹', primary: true },
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
    fillRoundedRect(ctx, targetRect, 9, pressed ? THEME.secondaryPressed : THEME.secondary, enabled ? THEME.primary : THEME.secondaryBorder);
    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(targetRect.h * 0.3, 14, 19)}px sans-serif`;
    ctx.fillText(title, targetRect.x + 18, targetRect.y + 8);
    if (description) {
      ctx.fillStyle = THEME.textMuted;
      ctx.font = `${clamp(targetRect.h * 0.2, 10, 13)}px sans-serif`;
      ctx.fillText(description, targetRect.x + 18, targetRect.y + targetRect.h * 0.58);
    }

    const pillW = clamp(targetRect.w * 0.24, 86, 132);
    const pill: RacerRect = {
      x: targetRect.x + targetRect.w - pillW - 14,
      y: targetRect.y + 7,
      w: pillW,
      h: Math.max(18, targetRect.h - 14)
    };
    fillRoundedRect(ctx, pill, pill.h / 2, enabled ? THEME.primarySoft : 'rgba(7, 17, 23, 0.7)', enabled ? THEME.primary : THEME.secondaryBorder);
    ctx.fillStyle = enabled ? THEME.primary : THEME.textMuted;
    ctx.font = `bold ${clamp(pill.h * 0.36, 11, 15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, pill.x + pill.w / 2, pill.y + pill.h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawHelp(ctx: CanvasRenderingContext2D, runtime: RacerSceneRuntimeView, layout: RacerUiLayout): void {
    const page = layout.help;
    this.drawPagePanel(ctx, page.panel, '操作与道具', `完成 ${runtime.targetLaps} 圈，刷新最佳成绩`);
    const lines = [
      { y: page.line1Y, text: '左下摇杆：控制方向', color: THEME.textBody },
      { y: page.line2Y, text: '右下刹车 · 氮气按钮：按住释放', color: THEME.textBody },
      { y: page.line3Y, text: '黄色 ≫：立即加速', color: THEME.primary },
      { y: page.line4Y, text: '蓝色 N：补充 50% 氮气，最多 100%', color: THEME.nitro },
      { y: page.line5Y, text: '红黑地面：减速陷阱，需要躲避', color: THEME.danger },
      { y: page.line6Y, text: '氮气在减速期间会暂时失效', color: THEME.textMuted }
    ];
    ctx.textAlign = 'center';
    ctx.font = `${layout.small ? 15 : layout.fonts.body}px sans-serif`;
    for (const line of lines) {
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, runtime.state.width / 2, line.y);
    }
    ctx.textAlign = 'left';
    this.drawActionButton(
      ctx,
      { target: 'help-start', rect: page.startButton, label: '开始比赛', icon: '▶', primary: true },
      runtime.pressedTarget === 'help-start'
    );
    this.drawActionButton(
      ctx,
      { target: 'help-back', rect: page.backButton, label: '返回菜单', icon: '‹' },
      runtime.pressedTarget === 'help-back'
    );
  }

  private drawPagePanel(ctx: CanvasRenderingContext2D, panel: RacerRect, title: string, subtitle: string): void {
    fillRoundedRect(ctx, panel, 16, THEME.panelStrong, THEME.panelBorder);
    ctx.fillStyle = THEME.primary;
    ctx.fillRect(panel.x + 20, panel.y + 16, Math.min(118, panel.w * 0.22), 4);
    ctx.fillStyle = THEME.text;
    ctx.font = `bold ${clamp(panel.w / 16, 26, 40)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, panel.x + panel.w / 2, panel.y + 22);
    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${clamp(panel.w / 34, 13, 18)}px sans-serif`;
    ctx.fillText(subtitle, panel.x + panel.w / 2, panel.y + 70);
    ctx.textAlign = 'left';
  }

  private drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const footerH = clamp(height * 0.065, 24, 34);
    const bottomInset = Math.max(10, height * 0.025);
    const footerY = height - footerH - bottomInset;
    ctx.fillStyle = 'rgba(18, 29, 32, 0.9)';
    ctx.fillRect(0, footerY, width, footerH);
    ctx.fillStyle = THEME.textMuted;
    ctx.font = `${clamp(width / 90, 10, 14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('左下摇杆转向 · 右下刹车 · 拾取蓝色 N 后按住氮气', width / 2, footerY + footerH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }
}
