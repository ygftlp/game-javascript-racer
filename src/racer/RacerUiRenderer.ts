import { RACER_CONFIG } from './config';
import type { RacerAssets } from './RacerAssets';
import type { RacerJoystickSnapshot } from './RacerJoystick';
import { RacerMiniMap } from './RacerMiniMap';
import type { RacerState } from './RacerState';
import { RACER_UI_FLAGS } from './RacerUiFlags';
import { RacerUiIcons, type RacerUiIconName } from './RacerUiIcons';
import { RacerUiLogo } from './RacerUiLogo';
import { RACER_UI_THEME } from './RacerUiTheme';
import type { RacerCircle, RacerRect, RacerUiLayout } from './RacerUiLayout';

export type RacerUiPhase = 'menu' | 'playing' | 'paused' | 'finished' | 'help' | 'trackSelect' | 'settings';
export type RacerTrackSelectPressedTarget = `track-select-${number}`;

export type RacerUiPressedTarget =
  | 'menu-start'
  | 'menu-track'
  | 'menu-leaderboard'
  | 'menu-help'
  | 'menu-settings'
  | RacerTrackSelectPressedTarget
  | 'track-back'
  | 'settings-audio'
  | 'settings-minimap'
  | 'settings-coach'
  | 'settings-sensitivity'
  | 'settings-reset-coach'
  | 'settings-back'
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

export interface RacerUiTrackOption {
  id: string;
  name: string;
  description: string;
  targetLaps: number;
}

export interface RacerUiRenderOptions {
  phase: RacerUiPhase;
  targetLaps: number;
  audioMuted: boolean;
  miniMapEnabled: boolean;
  controlCoachEnabled: boolean;
  controlCoachSeen: boolean;
  controlSensitivityLabel: string;
  controlSensitivityDescription: string;
  brakeActive: boolean;
  pressedTarget: RacerUiPressedTarget;
  controlCoachTimeLeft: number;
  joystick: RacerJoystickSnapshot;
  trackName: string;
  trackIndex: number;
  trackCount: number;
  selectedTrackId: string;
  tracks: readonly RacerUiTrackOption[];
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

function trackPressedTarget(index: number): RacerTrackSelectPressedTarget {
  return `track-select-${index}`;
}

export class RacerUiRenderer {
  private readonly miniMap = new RacerMiniMap();
  private readonly icons = new RacerUiIcons();
  private readonly logo = new RacerUiLogo();

  render(
    ctx: CanvasRenderingContext2D,
    state: RacerState,
    assets: RacerAssets | undefined,
    layout: RacerUiLayout,
    options: RacerUiRenderOptions
  ): void {
    this.drawHud(ctx, state, assets, options.targetLaps, options.audioMuted, layout);

    if (options.phase === 'playing') {
      if (RACER_UI_FLAGS.showMiniMap && options.miniMapEnabled) this.miniMap.render(ctx, state, layout);
      this.drawInRaceControls(ctx, layout, options.joystick, options.brakeActive);
      this.drawPauseButton(ctx, layout.pauseButton, options.pressedTarget === 'pause');
      if (options.controlCoachTimeLeft > 0) this.drawControlCoach(ctx, state, layout, options.controlCoachTimeLeft);
    }

    this.drawOverlay(ctx, state, assets, options, layout);
  }

  private drawHud(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, targetLaps: number, audioMuted: boolean, layout: RacerUiLayout): void {
    const mph = Math.round(state.speed / RACER_CONFIG.maxSpeed * 220);
    const hud = layout.hud.panel;
    const row = layout.hud.rowHeight;
    const progress = Math.min(1, (state.completedLaps + state.position / Math.max(1, state.trackLength)) / targetLaps);

    this.roundedPanel(ctx, hud.x, hud.y, hud.w, RACER_UI_FLAGS.showDebugHud ? hud.h : hud.h - row, RACER_UI_THEME.panel.hud, RACER_UI_THEME.panel.border);
    ctx.font = `${layout.fonts.hud}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText(`${mph} mph`, hud.x + 12, hud.y + 8);
    ctx.fillText(`圈数 ${state.completedLaps}/${targetLaps}`, hud.x + 12, hud.y + 8 + row);
    ctx.fillText(`时间 ${formatSeconds(state.currentLapTime)}`, hud.x + 12, hud.y + 8 + row * 2);
    ctx.fillText(`最佳 ${formatSeconds(state.bestLapTime)}`, hud.x + 12, hud.y + 8 + row * 3);

    if (RACER_UI_FLAGS.showDebugHud || RACER_UI_FLAGS.showAssetStatus) {
      ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'} · ${audioMuted ? 'Music off' : 'Music on'}`, hud.x + 12, hud.y + 8 + row * 4);
    }

    const bar = layout.hud.progressBar;
    this.roundedPanel(ctx, bar.x, bar.y, bar.w, bar.h, RACER_UI_THEME.panel.barBg);
    this.roundedPanel(ctx, bar.x, bar.y, Math.max(6, bar.w * progress), bar.h, RACER_UI_THEME.accent.goldBar);
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
    this.drawCircle(ctx, { x: base.x, y: base.y, r: base.r + 10 }, RACER_UI_THEME.controls.shadow);
    this.drawCircle(ctx, base, joystick.active ? RACER_UI_THEME.controls.baseActive : RACER_UI_THEME.controls.baseIdle, RACER_UI_THEME.controls.stroke, 2);
    this.drawCircle(ctx, { x: knobX, y: knobY, r: layout.controls.joystickKnobRadius }, joystick.active ? RACER_UI_THEME.controls.knobActive : RACER_UI_THEME.controls.knobIdle, RACER_UI_THEME.controls.darkStroke, 2);
    if (RACER_UI_FLAGS.showControlLabels) {
      ctx.font = `${layout.fonts.note}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = RACER_UI_THEME.text.muted;
      ctx.fillText('STEER', base.x, base.y + base.r + 10);
    }
    ctx.restore();
  }

  private drawBrakeButton(ctx: CanvasRenderingContext2D, button: RacerCircle, active: boolean): void {
    const fill = active ? RACER_UI_THEME.accent.brakeActive : RACER_UI_THEME.accent.brake;
    this.drawCircle(ctx, { x: button.x, y: button.y, r: button.r + (active ? 11 : 8) }, active ? RACER_UI_THEME.controls.brakeGlow : RACER_UI_THEME.controls.shadow);
    this.drawCircle(ctx, button, fill, RACER_UI_THEME.controls.stroke, 2);
    ctx.save();
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('刹车', button.x, button.y);
    ctx.restore();
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, button: RacerCircle, pressed: boolean): void {
    const y = button.y + (pressed ? 2 : 0);
    this.drawCircle(ctx, { x: button.x, y, r: button.r + (pressed ? 2 : 6) }, pressed ? RACER_UI_THEME.controls.pauseGlow : RACER_UI_THEME.controls.shadow);
    this.drawCircle(ctx, { x: button.x, y, r: button.r }, pressed ? RACER_UI_THEME.controls.pausePressed : RACER_UI_THEME.controls.pauseBg, RACER_UI_THEME.controls.stroke, 2);
    ctx.save();
    ctx.fillStyle = pressed ? RACER_UI_THEME.text.buttonPrimary : RACER_UI_THEME.text.primary;
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
    this.roundedPanel(ctx, x, y, w, h, RACER_UI_THEME.panel.modal, RACER_UI_THEME.accent.gold);
    ctx.font = `bold ${layout.fonts.body}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('左下摇杆控制方向 · 右下按钮刹车', state.width / 2, y + h / 2);
    ctx.restore();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, options: RacerUiRenderOptions, layout: RacerUiLayout): void {
    if (options.phase === 'playing') return;

    this.drawVignette(ctx, state.width, state.height);
    const active = options.phase === 'menu'
      ? layout.menu
      : options.phase === 'paused'
        ? layout.paused
        : options.phase === 'help'
          ? layout.help
          : options.phase === 'trackSelect'
            ? layout.trackSelect
            : options.phase === 'settings'
              ? layout.settings
              : layout.finished;
    this.drawModalPanel(ctx, active.panel);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = RACER_UI_THEME.text.primary;

    if (options.phase === 'menu') {
      this.drawMenu(ctx, state, assets, options, layout);
    } else if (options.phase === 'trackSelect') {
      this.drawTrackSelect(ctx, state, options, layout);
    } else if (options.phase === 'settings') {
      this.drawSettings(ctx, state, options, layout);
    } else if (options.phase === 'help') {
      this.drawHelp(ctx, state, options.targetLaps, layout, options.pressedTarget);
    } else if (options.phase === 'paused') {
      this.drawPaused(ctx, state, options.audioMuted, layout, options.pressedTarget);
    } else {
      this.drawFinished(ctx, state, options.targetLaps, layout, options.pressedTarget);
    }

    ctx.textAlign = 'left';
  }

  private drawMenu(ctx: CanvasRenderingContext2D, state: RacerState, assets: RacerAssets | undefined, options: RacerUiRenderOptions, layout: RacerUiLayout): void {
    this.logo.render(ctx, state.width / 2, layout.menu.titleY + (layout.small ? 23 : 29), {
      title: '极速公路',
      subtitle: 'RETRO RACER',
      small: layout.small,
      maxWidth: layout.menu.panel.w - 86,
      texture: assets?.brandLogo ?? null
    });
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.body;
    ctx.fillText('复古街机赛车', state.width / 2, layout.menu.line1Y);
    ctx.fillText(`当前赛道 · ${options.trackName}`, state.width / 2, layout.menu.line2Y);
    ctx.fillText(`目标 ${options.targetLaps} 圈 · ${options.audioMuted ? '音乐关闭' : '音乐开启'}`, state.width / 2, layout.menu.line3Y);
    if (RACER_UI_FLAGS.showAssetStatus) ctx.fillText(`${assets?.statusLabel ?? 'Assets idle'}`, state.width / 2, layout.menu.line3Y);
    this.drawButton(ctx, layout.menu.startButton, '开始比赛', layout, true, options.pressedTarget === 'menu-start', 'play');
    this.drawButton(ctx, layout.menu.trackButton, '选择赛道', layout, false, options.pressedTarget === 'menu-track', 'track');
    this.drawButton(ctx, layout.menu.leaderboardButton, '排行榜', layout, false, options.pressedTarget === 'menu-leaderboard', 'leaderboard');
    this.drawButton(ctx, layout.menu.helpButton, '操作说明', layout, false, options.pressedTarget === 'menu-help', 'help');
    this.drawButton(ctx, layout.menu.settingsButton, '设置', layout, false, options.pressedTarget === 'menu-settings', 'settings');
  }

  private drawTrackSelect(ctx: CanvasRenderingContext2D, state: RacerState, options: RacerUiRenderOptions, layout: RacerUiLayout): void {
    const select = layout.trackSelect;
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('选择赛道', state.width / 2, select.titleY);
    ctx.font = `${layout.fonts.note}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.note;
    ctx.fillText('选择后会保存，下次进入自动恢复', state.width / 2, select.line1Y);
    ctx.fillText(`当前 ${options.trackIndex + 1}/${options.trackCount} · ${options.trackName}`, state.width / 2, select.line2Y);

    const visibleTracks = options.tracks.slice(0, select.trackButtons.length);
    for (let index = 0; index < visibleTracks.length; index += 1) {
      const track = visibleTracks[index];
      const target = select.trackButtons[index];
      const selected = track.id === options.selectedTrackId;
      const pressed = options.pressedTarget === trackPressedTarget(index);
      this.drawTrackCard(ctx, target, track, index, selected, pressed, layout);
    }

    this.drawButton(ctx, select.backButton, '返回菜单', layout, false, options.pressedTarget === 'track-back', 'back');
  }

  private drawTrackCard(ctx: CanvasRenderingContext2D, target: RacerRect, track: RacerUiTrackOption, index: number, selected: boolean, pressed: boolean, layout: RacerUiLayout): void {
    const theme = RACER_UI_THEME.trackCard;
    const inset = pressed ? 3 : 0;
    const yOffset = pressed ? 3 : 0;
    const fill = selected
      ? pressed ? RACER_UI_THEME.accent.goldPressed : RACER_UI_THEME.accent.goldSoft
      : pressed ? RACER_UI_THEME.button.secondaryPressed : RACER_UI_THEME.button.secondary;
    const stroke = selected ? RACER_UI_THEME.accent.gold : RACER_UI_THEME.button.secondaryStroke;
    const x = target.x + inset;
    const y = target.y + yOffset + inset;
    const w = target.w - inset * 2;
    const h = target.h - inset * 2;
    const iconSize = layout.small ? theme.iconSmallSize : theme.iconSize;
    const textX = x + (layout.small ? theme.textSmallX : theme.textX);

    this.roundedPanel(ctx, x, y, w, h, fill, stroke);
    this.icons.render(ctx, 'track', x + theme.iconX, y + h / 2, iconSize, selected ? RACER_UI_THEME.icon.enabled : RACER_UI_THEME.icon.disabled, RACER_UI_THEME.icon.accent);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${layout.small ? theme.titleSmallSize : theme.titleSize}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText(`${index + 1}. ${track.name}`, textX, y + theme.titleY);
    ctx.font = `${layout.small ? theme.descriptionSmallSize : theme.descriptionSize}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.body;
    ctx.fillText(track.description, textX, y + (layout.small ? theme.descriptionSmallY : theme.descriptionY));
    ctx.textAlign = 'right';
    ctx.fillStyle = selected ? RACER_UI_THEME.accent.gold : RACER_UI_THEME.text.note;
    ctx.fillText(selected ? '已选择' : `${track.targetLaps} 圈`, x + w - theme.metaRightPadding, y + theme.metaY);
    ctx.textAlign = 'left';
  }

  private drawSettings(ctx: CanvasRenderingContext2D, state: RacerState, options: RacerUiRenderOptions, layout: RacerUiLayout): void {
    const settings = layout.settings;
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('设置', state.width / 2, settings.titleY);
    ctx.font = `${layout.small ? 14 : layout.fonts.note}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.note;
    ctx.fillText('调整驾驶、显示和新手引导', state.width / 2, settings.line1Y);

    this.drawSettingCard(ctx, settings.audioButton, '音乐', options.audioMuted ? '关闭' : '开启', '背景音乐和音效', !options.audioMuted, options.pressedTarget === 'settings-audio', layout, 'music');
    this.drawSettingCard(ctx, settings.miniMapButton, '赛道雷达', options.miniMapEnabled ? '开启' : '关闭', '弯道预告和车辆提示', options.miniMapEnabled, options.pressedTarget === 'settings-minimap', layout, 'minimap');
    this.drawSettingCard(ctx, settings.coachButton, '操作引导', options.controlCoachEnabled ? '开启' : '关闭', '首次比赛显示驾驶提示', options.controlCoachEnabled, options.pressedTarget === 'settings-coach', layout, 'coach');
    this.drawSettingCard(ctx, settings.sensitivityButton, '控制手感', options.controlSensitivityLabel, options.controlSensitivityDescription, true, options.pressedTarget === 'settings-sensitivity', layout, 'sensitivity');
    this.drawSettingCard(ctx, settings.resetCoachButton, '重看引导', options.controlCoachSeen ? '可重置' : '已准备', options.controlCoachSeen ? '下局重新显示教学' : '下局会显示教学', !options.controlCoachSeen, options.pressedTarget === 'settings-reset-coach', layout, 'reset');
    this.drawButton(ctx, settings.backButton, '返回菜单', layout, true, options.pressedTarget === 'settings-back', 'back');
  }

  private drawSettingCard(ctx: CanvasRenderingContext2D, target: RacerRect, title: string, value: string, description: string, enabled: boolean, pressed: boolean, layout: RacerUiLayout, icon: RacerUiIconName): void {
    const theme = RACER_UI_THEME.settingCard;
    const pill = RACER_UI_THEME.statusPill;
    const inset = pressed ? 3 : 0;
    const yOffset = pressed ? 3 : 0;
    const x = target.x + inset;
    const y = target.y + yOffset + inset;
    const w = target.w - inset * 2;
    const h = target.h - inset * 2;
    const fill = pressed ? RACER_UI_THEME.button.secondaryPressed : RACER_UI_THEME.button.secondary;
    const stroke = enabled ? RACER_UI_THEME.accent.gold : RACER_UI_THEME.button.secondaryStroke;
    const iconSize = layout.small ? theme.iconSmallSize : theme.iconSize;
    const iconX = x + (layout.small ? theme.iconSmallX : theme.iconX);
    const textX = x + (layout.small ? theme.textSmallX : theme.textX);
    const pillW = layout.small ? pill.smallWidth : pill.width;
    const pillH = layout.small ? pill.smallHeight : pill.height;
    const pillX = x + w - (layout.small ? pill.smallRightOffset : pill.rightOffset);
    const pillY = y + (layout.small ? pill.smallY : pill.y);

    this.roundedPanel(ctx, x, y, w, h, fill, stroke);
    this.icons.render(ctx, icon, iconX, y + h / 2, iconSize, enabled ? RACER_UI_THEME.icon.enabled : RACER_UI_THEME.icon.disabled, RACER_UI_THEME.icon.accent);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${layout.small ? theme.titleSmallSize : theme.titleSize}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText(title, textX, y + (layout.small ? theme.titleSmallY : theme.titleY));

    ctx.font = `${layout.small ? theme.descriptionSmallSize : theme.descriptionSize}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.note;
    ctx.fillText(description, textX, y + (layout.small ? theme.descriptionSmallY : theme.descriptionY));

    this.drawStatusPill(ctx, pillX, pillY, pillW, pillH, value, enabled, pressed, layout);
    ctx.textAlign = 'left';
  }

  private drawStatusPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, enabled: boolean, pressed: boolean, layout: RacerUiLayout): void {
    const theme = RACER_UI_THEME.statusPill;
    const fill = enabled
      ? pressed ? RACER_UI_THEME.accent.goldPressed : RACER_UI_THEME.accent.goldSoft
      : pressed ? RACER_UI_THEME.button.secondaryPressed : RACER_UI_THEME.panel.barBg;
    const stroke = enabled ? RACER_UI_THEME.accent.gold : RACER_UI_THEME.button.secondaryStroke;
    this.roundedPanel(ctx, x, y, w, h, fill, stroke);
    ctx.font = `bold ${layout.small ? theme.fontSmallSize : theme.fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = enabled ? RACER_UI_THEME.accent.gold : RACER_UI_THEME.text.note;
    ctx.fillText(text, x + w / 2, y + h / 2 + theme.textYOffset);
  }

  private drawHelp(ctx: CanvasRenderingContext2D, state: RacerState, targetLaps: number, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('操作说明', state.width / 2, layout.help.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.bodyStrong;
    ctx.fillText('左下摇杆：控制赛车方向', state.width / 2, layout.help.line1Y);
    ctx.fillText('右下刹车：过弯和避让时减速', state.width / 2, layout.help.line2Y);
    ctx.fillText('右侧暂停：暂停、重开或返回菜单', state.width / 2, layout.help.line3Y);
    ctx.fillText(`目标：完成 ${targetLaps} 圈，刷新最佳圈速`, state.width / 2, layout.help.line4Y);
    this.drawButton(ctx, layout.help.startButton, '开始比赛', layout, true, pressedTarget === 'help-start', 'play');
    this.drawButton(ctx, layout.help.backButton, '返回菜单', layout, false, pressedTarget === 'help-back', 'back');
  }

  private drawPaused(ctx: CanvasRenderingContext2D, state: RacerState, audioMuted: boolean, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('比赛暂停', state.width / 2, layout.paused.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.body;
    ctx.fillText('调整状态后继续冲刺', state.width / 2, layout.paused.line1Y);
    this.drawButton(ctx, layout.paused.resumeButton, '继续比赛', layout, true, pressedTarget === 'paused-resume', 'play');
    this.drawButton(ctx, layout.paused.restartButton, '重新开始', layout, false, pressedTarget === 'paused-restart', 'reset');
    this.drawButton(ctx, layout.paused.audioButton, audioMuted ? '开启音乐' : '关闭音乐', layout, false, pressedTarget === 'paused-audio', 'music');
    this.drawButton(ctx, layout.paused.menuButton, '返回菜单', layout, false, pressedTarget === 'paused-menu', 'back');
  }

  private drawFinished(ctx: CanvasRenderingContext2D, state: RacerState, targetLaps: number, layout: RacerUiLayout, pressedTarget: RacerUiPressedTarget): void {
    const grade = this.raceGrade(state);
    ctx.font = `bold ${layout.fonts.title}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.primary;
    ctx.fillText('比赛完成', state.width / 2, layout.finished.titleY);
    ctx.font = `${layout.fonts.body}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.bodyStrong;
    ctx.fillText(`完成圈数 ${state.completedLaps}/${targetLaps}`, state.width / 2, layout.finished.line1Y);
    ctx.fillText(`总用时 ${formatSeconds(state.totalRaceTime)} · 评级 ${grade}`, state.width / 2, layout.finished.line2Y);
    ctx.fillText(`最佳圈速 ${formatSeconds(state.bestLapTime)}`, state.width / 2, layout.finished.line3Y);
    this.drawButton(ctx, layout.finished.restartButton, '再来一局', layout, true, pressedTarget === 'finished-restart', 'reset');
    this.drawButton(ctx, layout.finished.shareButton, '分享', layout, false, pressedTarget === 'finished-share', 'share');
    this.drawButton(ctx, layout.finished.leaderboardButton, '排行榜', layout, false, pressedTarget === 'finished-leaderboard', 'leaderboard');
    ctx.font = `${layout.fonts.note}px sans-serif`;
    ctx.fillStyle = RACER_UI_THEME.text.note;
    ctx.fillText('刷新成绩，冲击排行榜', state.width / 2, layout.finished.noteY);
  }

  private raceGrade(state: RacerState): string {
    if (state.collisionCount === 0 && state.totalRaceTime > 0 && state.totalRaceTime < 140) return 'S';
    if (state.collisionCount <= 2) return 'A';
    if (state.collisionCount <= 5) return 'B';
    return 'C';
  }

  private drawButton(ctx: CanvasRenderingContext2D, target: RacerRect, text: string, layout: RacerUiLayout, primary = false, pressed = false, icon?: RacerUiIconName): void {
    const theme = RACER_UI_THEME.buttonIcon;
    const inset = pressed ? 3 : 0;
    const yOffset = pressed ? 3 : 0;
    const fill = primary
      ? pressed ? RACER_UI_THEME.accent.goldPressed : RACER_UI_THEME.accent.gold
      : pressed ? RACER_UI_THEME.button.secondaryPressed : RACER_UI_THEME.button.secondary;
    const stroke = primary ? RACER_UI_THEME.button.primaryStroke : RACER_UI_THEME.button.secondaryStroke;
    const x = target.x + inset;
    const y = target.y + yOffset + inset;
    const w = target.w - inset * 2;
    const h = target.h - inset * 2;
    const iconSize = layout.small ? theme.smallSize : theme.size;
    const iconX = x + (layout.small ? theme.smallOffsetX : theme.offsetX);
    const textX = icon ? x + w / 2 + iconSize * theme.textOffsetRatio : x + w / 2;
    const iconColor = primary ? RACER_UI_THEME.icon.primary : RACER_UI_THEME.text.primary;
    const iconAccent = primary ? RACER_UI_THEME.icon.primary : RACER_UI_THEME.icon.accent;

    if (primary && !pressed) this.roundedPanel(ctx, target.x - 5, target.y - 5, target.w + 10, target.h + 10, RACER_UI_THEME.accent.goldSoft);
    this.roundedPanel(ctx, x, y, w, h, fill, stroke);
    if (icon) this.icons.render(ctx, icon, iconX, y + h / 2, iconSize, iconColor, iconAccent);
    ctx.font = `bold ${layout.fonts.button}px sans-serif`;
    ctx.fillStyle = primary ? RACER_UI_THEME.text.buttonPrimary : RACER_UI_THEME.text.primary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, textX, y + h / 2 + yOffset);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  private drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = RACER_UI_THEME.overlay.shade;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = RACER_UI_THEME.overlay.topTint;
    ctx.fillRect(0, 0, width, Math.max(8, height * 0.04));
    ctx.fillStyle = RACER_UI_THEME.overlay.bottomShade;
    ctx.fillRect(0, height * 0.78, width, height * 0.22);
  }

  private drawModalPanel(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    this.roundedPanel(ctx, target.x + 10, target.y + 12, target.w, target.h, RACER_UI_THEME.panel.modalShadow);
    this.roundedPanel(ctx, target.x - 2, target.y - 2, target.w + 4, target.h + 4, RACER_UI_THEME.panel.modalOuterGlow);
    this.roundedPanel(ctx, target.x, target.y, target.w, target.h, RACER_UI_THEME.panel.modal, RACER_UI_THEME.panel.modalBorder);
    this.roundedPanel(ctx, target.x + 22, target.y + 18, target.w - 44, 6, RACER_UI_THEME.accent.gold);
    this.roundedPanel(ctx, target.x + 22, target.y + target.h - 24, target.w - 44, 2, RACER_UI_THEME.panel.divider);
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
