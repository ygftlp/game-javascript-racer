import { RACER_CONFIG } from './config';
import type { RacerAssets } from './RacerAssets';
import type { RacerJoystickSnapshot } from './RacerJoystick';
import type { RacerState } from './RacerState';
import { RACER_UI_FLAGS } from './RacerUiFlags';
import type { RacerCircle, RacerRect, RacerUiLayout } from './RacerUiLayout';

export type RacerUiPhase = 'menu' | 'playing' | 'paused' | 'finished' | 'help';

export type RacerUiPressedTarget =
  | 'menu-start'
  | 'menu-leaderboard'
  | 'menu-help'
  | 'menu-audio'
  | 'help-start'
  | 'help-back'
  | 'paused-resume'
  | 'paused-restart'
  | 'paused-audio'
  | 'paused-menu'
  | 'finished-restart'
  | 'finished-share'
  | 'finished-leaderboard'
  | 'pause'
  | null;

export interface RacerUiRenderOptions {
  phase: RacerUiPhase;
  targetLaps: number;
  audioMuted: boolean;
  brakeActive: boolean;
  pressedTarget: RacerUiPressedTarget;
  controlCoachTimeLeft: number;
  joystick: RacerJoystickSnapshot;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function formatSeconds(seconds: number): string {
  if (!seconds) return '--';
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds - minutes * 60);
  const tenths = Math.floor(10 * (seconds - Math.floor(seconds)));
  return minutes > 0 ? `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${tenths}` : `${wholeSeconds}.${tenths}`;
}

export class RacerUiRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    assets: RacerAssets | undefined,
    layout: RacerUiLayout,
    options: RacerUiRenderOptions
  ): void {
    this.drawHud(ctx, state, assets, options.targetLaps, options.audioMuted, layout);

    if (options.phase === 'playing') {
      this.drawInRaceControls(ctx, layout, options.joystick, options.brakeActive);
      this.drawPauseButton(ctx, layout.pauseButton, options.pressedTarget === 'pause');
      if (options.controlCoachTimeLeft > 0) this.drawControlCoach(ctx, state, layout, options.controlCoachTimeLeft);
    }

    this.drawOverlay(ctx, state, assets, options.phase, options.targetLaps, options.audioMuted, layout, options.pressedTarget);
  }

  private drawHud(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, targetLaps: number, audioMuted: boolean, layout: RacerUiLayout): void {
    const mph = Math.round(state.speed / RACER_CONFIG.maxSpeed * 220);
    const hud = layout.hud.panel;
    const row = layout.hud.rowHeight;
    const progress = Math.min(1, (state.completedLaps + state.position / Math.max(1, state.trackLength)) / targetLaps);

    this.roundedPanel(ctx, hud.x, hud.y, hud.w, RACER_UI_FLAGS.showDebugHud ? hud.h : hud.h - row, 'rgba(12, 18, 24, 0.52)', 'rgba(255,255,255,0.2)');
    ctx.font = `${layout.fonts.hud}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${mph} mph`, hud.x + 12, hud.y + 8);
    ctx.fillText(`圈数 ${state.completedLaps}/${targetLaps}`, hud.x + 12, hud.y + 8 + row);
    ctx.fillText(`时间 ${formatSeconds(state.currentLapTime)}`, hud.x + 12, hud.y + 8 + row * 2);
    ctx.fillText(`最佳 ${formatSeconds(state.bestLapTime)}`, hud.x + 12, hud.y + 8 + row * 3);

    if (RACER_UI_FLAGS.showDebugHud || RACER_UI_FLAGS.showAssetStatus) {
      ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'} · ${audioMuted ? 'Music off' : 'Music on'}`, hud.x + 12, hud.y + 8 + row * 4);
    }

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
    this.drawCircle(ctx, { x: base.x, y: base.y, r: base.r + 10 }, 'rgba(0,0,0,0.18)');
    this.drawCircle(ctx, base, joystick.active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.48)', 2);
    this.drawCircle(ctx, { x: knobX, y: knobY, r: layout.controls.joystickKnobRadius }, joystick.active ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.48)', 'rgba(20,24,32,0.62)', 2);
    if (RACER_UI_FLAGS.showControlLabels) {
      ctx.font = `${layout.fonts.note}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText('STEER', base.x, base.y + base.r + 10);
    }
    ctx.restore();
  }

  private drawBrakeButton(ctx: CanvasRenderingContext2D, button: RacerCircle, active: boolean): void {
    const fill = active ? 'rgba(255, 92, 60, 0.9)' : 'rgba(255, 92, 60, 0.62)';
    this.drawCircle(ctx, { x: button.x, y: button.y, r: button.r + (active ? 11 : 8) }, active ? 'rgba(255,92,60,0.22)' : 'rgba(0,0,0,0.18)');
    this.drawCircle(ctx, button, fill, 'rgba(255,255,255,0.62)', 2);
    ctx.save();
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('刹车', button.x, button.y);
    ctx.restore();
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, button: RacerCircle, pressed: boolean): void {
    const y = button.y + (pressed ? 2 : 0);
    this.drawCircle(ctx, { x: button.x, y, r: button.r + (pressed ? 2 : 6) }, pressed ? 'rgba(255,207,74,0.28)' : 'rgba(0,0,0,0.18)');
    this.drawCircle(ctx, { x: button.x, y, r: button.r }, pressed ? 'rgba(255, 207, 74, 0.82)' : 'rgba(12, 18, 24, 0.68)', 'rgba(255,255,255,0.58)', 2);
    ctx.save();
    ctx.fillStyle = pressed ? 'rgba(20,24,32,0.96)' : '#ffffff';
    const barW = Math.max(4, button.r * 0.18);
    const barH = button.r * 0.9;
    ctx.fillRect(button.x - barW * 1.7, y - barH / 2, barW, barH);
    ctx.fillRect(button.x + barW * 0.7, y - barH / 2, barW, barH);
    ctx.restore();
  }

  private drawControlCoach(ctx: CanvasRenderingContext2D, state: RacerState, layout: RacerUiLayout, secondsLeft: number): void {
    const alpha = clamp(secondsLeft / 1.4, 0, 1);
    const w = Math.min(460, state.width * 0.72);
    const h = layout.small ? 58 : 66;
    const x = (state.width - w) / 2;
    const y = state.height * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    this.roundedPanel(ctx, x, y, w, h, 'rgba(18,24,32,0.82)', 'rgba(255,207,74,0.62)');
    ctx.font = `bold ${layout.fonts.body}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('左下摇杆控制方向 · 右下按钮刹车', state.width / 2, y + h / 2);
    ctx.restore();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, phase: RacerUiPhase, targetLaps: number, audioMuted: boolean, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    if (phase === 'playing') return;

    this.drawVignette(ctx, state.width, state.height);
    const active = phase === 'menu' ? layout.menu : phase === 'paused' ? layout.paused : phase === 'help' ? layout.help : layout.finished;
    this.drawModalPanel(ctx, active.panel);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';

    if (phase === 'menu') {
      this.drawMenu(ctx, state, assets, audioMuted, layout, pressedTarget);
    } else if (phase === 'help') {
      this.drawHelp(ctx, state, layout, pressedTarget);
    } else if (phase === 'paused') {
      this.drawPaused(ctx, state, audioMuted, layout, pressedTarget);
    } else {
      this.drawFinished(ctx, state, targetLaps, layout, pressedTarget);
    }

    ctx.textAlign = 'left';
  }

  private drawMenu(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, audioMuted: boolean, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillText('极速公路', state.width / 2, layout.menu.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.fillText('复古街机赛车', state.width / 2, layout.menu.line1Y);
    ctx.fillText('左下摇杆控制方向，右下按钮刹车', state.width / 2, layout.menu.line2Y);
    ctx.fillText(audioMuted ? '音乐已关闭' : '音乐已开启', state.width / 2, layout.menu.line3Y);
    if (RACER_UI_FLAGS.showAssetStatus) ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'}`, state.width / 2, layout.menu.line3Y);
    this.drawButton(ctx, layout.menu.startButton, '开始比赛', layout, true, pressedTarget === 'menu-start');
    this.drawButton(ctx, layout.menu.leaderboardButton, '排行榜', layout, false, pressedTarget === 'menu-leaderboard');
    this.drawButton(ctx, layout.menu.helpButton, '操作说明', layout, false, pressedTarget === 'menu-help');
    this.drawButton(ctx, layout.menu.audioButton, audioMuted ? '开启音乐' : '关闭音乐', layout, false, pressedTarget === 'menu-audio');
  }

  private drawHelp(ctx: CanvasRenderingContext2D, state: RacerState, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillText('操作说明', state.width / 2, layout.help.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('左下摇杆：控制赛车方向', state.width / 2, layout.help.line1Y);
    ctx.fillText('右下刹车：过弯和避让时减速', state.width / 2, layout.help.line2Y);
    ctx.fillText('右侧暂停：暂停、重开或返回菜单', state.width / 2, layout.help.line3Y);
    ctx.fillText('目标：完成 3 圈，刷新最佳圈速', state.width / 2, layout.help.line4Y);
    this.drawButton(ctx, layout.help.startButton, '开始比赛', layout, true, pressedTarget === 'help-start');
    this.drawButton(ctx, layout.help.backButton, '返回菜单', layout, false, pressedTarget === 'help-back');
  }

  private drawPaused(ctx: CanvasRenderingContext2D, state: RacerState, audioMuted: boolean, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillText('比赛暂停', state.width / 2, layout.paused.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.fillText('调整状态后继续冲刺', state.width / 2, layout.paused.line1Y);
    this.drawButton(ctx, layout.paused.resumeButton, '继续比赛', layout, true, pressedTarget === 'paused-resume');
    this.drawButton(ctx, layout.paused.restartButton, '重新开始', layout, false, pressedTarget === 'paused-restart');
    this.drawButton(ctx, layout.paused.audioButton, audioMuted ? '开启音乐' : '关闭音乐', layout, false, pressedTarget === 'paused-audio');
    this.drawButton(ctx, layout.paused.menuButton, '返回菜单', layout, false, pressedTarget === 'paused-menu');
  }

  private drawFinished(ctx: CanvasRenderingContext2D, state: RacerState, targetLaps: number, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    const grade = this.raceGrade(state);
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillText('比赛完成', state.width / 2, layout.finished.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(`完成圈数 ${state.completedLaps}/${targetLaps}`, state.width / 2, layout.finished.line1Y);
    ctx.fillText(`总用时 ${formatSeconds(state.totalRaceTime)} · 评级 ${grade}`, state.width / 2, layout.finished.line2Y);
    ctx.fillText(`最佳圈速 ${formatSeconds(state.bestLapTime)}`, state.width / 2, layout.finished.line3Y);
    this.drawButton(ctx, layout.finished.restartButton, '再来一局', layout, true, pressedTarget === 'finished-restart');
    this.drawButton(ctx, layout.finished.shareButton, '分享', layout, false, pressedTarget === 'finished-share');
    this.drawButton(ctx, layout.finished.leaderboardButton, '排行榜', layout, false, pressedTarget === 'finished-leaderboard');
    ctx.font = `${layout.fonts.note}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText('刷新成绩，冲击排行榜', state.width / 2, layout.finished.noteY);
  }

  private raceGrade(state: RacerState): string {
    if (state.collisionCount === 0 && state.totalRaceTime > 0 && state.totalRaceTime < 140) return 'S';
    if (state.collisionCount <= 2) return 'A';
    if (state.collisionCount <= 5) return 'B';
    return 'C';
  }

  private drawButton(ctx: CanvasRenderingContext2D, target: RacerRect, text: string, layout: RacerUiLayout, primary = false, pressed = false): void {
    const inset = pressed ? 3 : 0;
    const yOffset = pressed ? 3 : 0;
    const fill = primary ? pressed ? 'rgba(235, 178, 48, 0.96)' : 'rgba(255, 207, 74, 0.94)' : pressed ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.14)';
    const stroke = primary ? 'rgba(255, 255, 255, 0.84)' : 'rgba(255,255,255,0.42)';
    if (primary && !pressed) this.roundedPanel(ctx, target.x - 5, target.y - 5, target.w + 10, target.h + 10, 'rgba(255, 207, 74, 0.12)');
    this.roundedPanel(ctx, target.x + inset, target.y + yOffset + inset, target.w - inset * 2, target.h - inset * 2, fill, stroke);
    ctx.font = `bold ${layout.fonts.button}px sans-serif`;
    ctx.fillStyle = primary ? 'rgba(20,24,32,0.96)' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, target.x + target.w / 2, target.y + target.h / 2 + yOffset);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 207, 74, 0.07)';
    ctx.fillRect(0, 0, width, Math.max(8, height * 0.04));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, height * 0.78, width, height * 0.22);
  }

  private drawModalPanel(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    this.roundedPanel(ctx, target.x + 10, target.y + 12, target.w, target.h, 'rgba(0,0,0,0.3)');
    this.roundedPanel(ctx, target.x - 2, target.y - 2, target.w + 4, target.h + 4, 'rgba(255,255,255,0.06)');
    this.roundedPanel(ctx, target.x, target.y, target.w, target.h, 'rgba(18, 24, 32, 0.95)', 'rgba(255,255,255,0.52)');
    this.roundedPanel(ctx, target.x + 22, target.y + 18, target.w - 44, 6, 'rgba(255, 207, 74, 0.94)');
    this.roundedPanel(ctx, target.x + 22, target.y + target.h - 24, target.w - 44, 2, 'rgba(255, 255, 255, 0.12)');
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
    const r = Math.min(18, w / 4, h / 4);
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
