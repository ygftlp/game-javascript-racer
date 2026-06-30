import { Engine, Scene, type Renderer, type TouchPoint } from '../engine';
import { RacerAssets } from '../racer/RacerAssets';
import { RacerJoystick } from '../racer/RacerJoystick';
import { createRacerServices, type RaceResult } from '../racer/RacerServices';
import { RacerSettings } from '../racer/RacerSettings';
import { RacerState } from '../racer/RacerState';
import { RacerStorage } from '../racer/RacerStorage';
import { ACTIVE_RACER_TRACK, findRacerTrackById, RACER_TRACKS, racerTrackIndex, type RacerTrackDefinition } from '../racer/RacerTrackDefinition';
import { resolveRacerTuning } from '../racer/RacerTuning';
import { RACER_UI_FLAGS } from '../racer/RacerUiFlags';
import { buildRacerUiLayout, pointInCircle, pointInRect } from '../racer/RacerUiLayout';
import { Pseudo3DRenderer, type RacerPhase, type RacerUiPressedTarget } from '../racer/Pseudo3DRenderer';

const CONTROL_COACH_SECONDS = 4.5;

type FinishedAction = 'restart' | 'share' | 'leaderboard' | 'none';

export class RacerScene extends Scene {
  private readonly assets = new RacerAssets();
  private readonly joystick = new RacerJoystick();
  private readonly services = createRacerServices();
  private readonly settings: RacerSettings;
  private readonly state: RacerState;
  private readonly storage: RacerStorage;
  private readonly pseudo3d = new Pseudo3DRenderer();
  private activeTrack: RacerTrackDefinition = ACTIVE_RACER_TRACK;
  private savedBestLapTime = 0;
  private touchActive = false;
  private brakeActive = false;
  private audioMuted = false;
  private lastCollisionCount = 0;
  private wasPlayingBeforeHidden = false;
  private phase: RacerPhase = 'menu';
  private pressedTarget: RacerUiPressedTarget = null;
  private controlCoachTimeLeft = 0;
  private hasShownControlCoach = false;

  constructor(private readonly gameEngine: Engine) {
    super();
    const screen = gameEngine.platform.getScreenInfo();
    const tuning = resolveRacerTuning(gameEngine.width, gameEngine.height, screen.pixelRatio);

    this.settings = new RacerSettings(gameEngine);
    this.storage = new RacerStorage(gameEngine);
    this.activeTrack = findRacerTrackById(this.settings.getSelectedTrackId() ?? ACTIVE_RACER_TRACK.id);
    this.state = new RacerState(gameEngine.width, gameEngine.height, tuning, this.activeTrack);
    this.savedBestLapTime = this.storage.getBestLapTime(this.activeTrack.id);
    this.audioMuted = this.settings.isAudioMuted();
    this.hasShownControlCoach = !RACER_UI_FLAGS.showFirstRaceCoach || this.settings.hasShownFirstRaceCoach();
    this.assets.setMuted(this.audioMuted);
    this.state.bestLapTime = this.savedBestLapTime;
    this.bindTouchControls();
    void this.assets.load(gameEngine);
    this.services.analytics.track('scene_ready', {
      tuning: tuning.profile,
      audioMuted: this.audioMuted,
      trackId: this.activeTrack.id,
      trackName: this.activeTrack.name,
      targetLaps: this.targetLaps
    });
  }

  private get targetLaps(): number {
    return this.activeTrack.targetLaps;
  }

  update(dt: number): void {
    super.update(dt);

    if (this.controlCoachTimeLeft > 0) {
      this.controlCoachTimeLeft = Math.max(0, this.controlCoachTimeLeft - dt);
    }

    if (this.phase !== 'playing') return;

    if (!this.touchActive) {
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }

    this.state.update(dt);
    this.playCollisionSfxIfNeeded();
    this.persistBestLapIfNeeded();

    if (this.state.completedLaps >= this.targetLaps) {
      this.finishRace();
    }
  }

  protected draw(renderer: Renderer): void {
    const layout = this.getUiLayout();
    this.pseudo3d.render(renderer, this.state, this.assets, {
      phase: this.phase,
      targetLaps: this.targetLaps,
      audioMuted: this.audioMuted,
      brakeActive: this.brakeActive,
      pressedTarget: this.pressedTarget,
      controlCoachTimeLeft: this.controlCoachTimeLeft,
      joystick: this.joystick.snapshot(layout.controls.joystickBase, layout.controls.joystickKnobRadius),
      trackName: this.activeTrack.name,
      trackIndex: racerTrackIndex(this.activeTrack.id),
      trackCount: RACER_TRACKS.length,
      selectedTrackId: this.activeTrack.id,
      tracks: RACER_TRACKS
    });
  }

  handleAppHidden(): void {
    this.wasPlayingBeforeHidden = this.phase === 'playing';
    this.pressedTarget = null;
    if (!this.wasPlayingBeforeHidden) return;

    this.pauseRace('app_hide');
  }

  handleAppShown(): void {
    if (!this.wasPlayingBeforeHidden || this.phase !== 'paused') return;

    this.wasPlayingBeforeHidden = false;
    this.resumeRace('app_show');
  }

  private bindTouchControls(): void {
    this.gameEngine.input.onStart((touches: TouchPoint[] = []) => this.handleTouchStart(touches), { persistent: true });
    this.gameEngine.input.onMove((touches: TouchPoint[] = []) => {
      if (this.phase === 'playing') this.applyTouches(touches);
      else this.updatePressedTarget(touches[0]);
    }, { persistent: true });
    this.gameEngine.input.onEnd((touches: TouchPoint[] = []) => this.handleTouchEnd(touches), { persistent: true });
  }

  private handleTouchStart(touches: TouchPoint[] = []): void {
    const point = touches[0];
    if (!point) return;

    if (this.phase !== 'playing') {
      this.pressedTarget = this.resolvePressedTarget(point);
      return;
    }

    if (this.isPauseButton(point)) {
      this.pressedTarget = 'pause';
      return;
    }

    if (this.controlCoachTimeLeft > 0) this.controlCoachTimeLeft = 0;
    this.applyTouches(touches);
  }

  private handleTouchEnd(touches: TouchPoint[] = []): void {
    const point = touches[0];
    const target = this.pressedTarget;

    if (target) {
      this.pressedTarget = null;
      this.executePressedTarget(target, point);
      this.resetTouchControls();
      return;
    }

    this.resetTouchControls();
  }

  private updatePressedTarget(point: TouchPoint | undefined): void {
    if (!this.pressedTarget || !point) return;

    const resolved = this.resolvePressedTarget(point);
    if (resolved !== this.pressedTarget) this.pressedTarget = null;
  }

  private resolvePressedTarget(point: TouchPoint): RacerUiPressedTarget {
    if (this.phase === 'menu') {
      if (this.isMenuStartButton(point)) return 'menu-start';
      if (this.isMenuTrackButton(point)) return 'menu-track';
      if (this.isMenuLeaderboardButton(point)) return 'menu-leaderboard';
      if (this.isMenuHelpButton(point)) return 'menu-help';
      if (this.isMenuAudioButton(point)) return 'menu-audio';
      return null;
    }

    if (this.phase === 'trackSelect') {
      const trackIndex = this.trackSelectIndex(point);
      if (trackIndex !== null) return this.trackPressedTarget(trackIndex);
      if (this.isTrackSelectBackButton(point)) return 'track-back';
      return null;
    }

    if (this.phase === 'help') {
      if (this.isHelpStartButton(point)) return 'help-start';
      if (this.isHelpBackButton(point)) return 'help-back';
      return null;
    }

    if (this.phase === 'paused') {
      if (this.isPausedResumeButton(point)) return 'paused-resume';
      if (this.isPausedRestartButton(point)) return 'paused-restart';
      if (this.isPausedAudioButton(point)) return 'paused-audio';
      if (this.isPausedMenuButton(point)) return 'paused-menu';
      return null;
    }

    if (this.phase === 'finished') {
      const action = this.finishedAction(point);
      if (action === 'restart') return 'finished-restart';
      if (action === 'share') return 'finished-share';
      if (action === 'leaderboard') return 'finished-leaderboard';
      return null;
    }

    if (this.phase === 'playing' && this.isPauseButton(point)) return 'pause';
    return null;
  }

  private executePressedTarget(target: RacerUiPressedTarget, point: TouchPoint | undefined): void {
    if (!target) return;
    if (point && this.resolvePressedTarget(point) !== target) return;

    this.assets.playMenuConfirm();

    if (target === 'menu-start' || target === 'help-start') {
      this.startRace();
      return;
    }
    if (target === 'menu-track') {
      this.openTrackSelect();
      return;
    }
    const selectedTrackIndex = this.trackIndexFromPressedTarget(target);
    if (selectedTrackIndex !== null) {
      this.selectTrack(selectedTrackIndex);
      return;
    }
    if (target === 'track-back') {
      this.returnToMenu('track_select_back');
      return;
    }
    if (target === 'menu-help') {
      this.openHelp();
      return;
    }
    if (target === 'help-back') {
      this.returnToMenu('help_back');
      return;
    }
    if (target === 'menu-leaderboard') {
      void this.showLeaderboard('menu');
      return;
    }
    if (target === 'menu-audio' || target === 'paused-audio') {
      this.toggleAudio();
      return;
    }
    if (target === 'paused-resume') {
      this.resumeRace('touch');
      return;
    }
    if (target === 'paused-restart' || target === 'finished-restart') {
      this.restartRace();
      return;
    }
    if (target === 'paused-menu') {
      this.returnToMenu('pause_menu');
      return;
    }
    if (target === 'finished-share') {
      void this.shareResult();
      return;
    }
    if (target === 'finished-leaderboard') {
      void this.showLeaderboard('result');
      return;
    }
    if (target === 'pause') {
      this.pauseRace('touch');
    }
  }

  private openHelp(): void {
    this.phase = 'help';
    this.pressedTarget = null;
    this.resetTouchControls();
    this.services.analytics.track('help_open');
  }

  private openTrackSelect(): void {
    this.phase = 'trackSelect';
    this.pressedTarget = null;
    this.resetTouchControls();
    this.services.analytics.track('track_select_open', {
      trackId: this.activeTrack.id,
      trackName: this.activeTrack.name,
      trackCount: RACER_TRACKS.length
    });
  }

  private returnToMenu(source: string): void {
    this.phase = 'menu';
    this.wasPlayingBeforeHidden = false;
    this.pressedTarget = null;
    this.controlCoachTimeLeft = 0;
    this.resetTouchControls();
    this.assets.stopMusic();
    this.services.analytics.track('return_menu', { source });
  }

  private selectTrack(trackIndex: number): void {
    if (this.phase !== 'trackSelect') return;

    const nextTrack = RACER_TRACKS[trackIndex];
    if (!nextTrack) return;

    this.activeTrack = nextTrack;
    this.settings.setSelectedTrackId(this.activeTrack.id);
    this.savedBestLapTime = this.storage.getBestLapTime(this.activeTrack.id);
    this.state.setTrack(this.activeTrack, this.savedBestLapTime);
    this.lastCollisionCount = this.state.collisionCount;
    this.phase = 'menu';
    this.pressedTarget = null;
    this.resetTouchControls();
    this.services.analytics.track('track_select_confirm', {
      trackId: this.activeTrack.id,
      trackName: this.activeTrack.name,
      trackIndex: racerTrackIndex(this.activeTrack.id),
      targetLaps: this.targetLaps,
      bestLapTime: this.savedBestLapTime
    });
  }

  private startRace(): void {
    this.phase = 'playing';
    this.wasPlayingBeforeHidden = false;
    this.pressedTarget = null;
    this.resetTouchControls();
    this.lastCollisionCount = this.state.collisionCount;
    if (RACER_UI_FLAGS.showFirstRaceCoach && !this.hasShownControlCoach) {
      this.controlCoachTimeLeft = CONTROL_COACH_SECONDS;
      this.hasShownControlCoach = true;
      this.settings.setFirstRaceCoachShown(true);
    }
    this.assets.playMusic();
    this.services.analytics.track('race_start', {
      tuning: this.state.tuning.profile,
      audioMuted: this.audioMuted,
      trackId: this.activeTrack.id,
      trackName: this.activeTrack.name,
      targetLaps: this.targetLaps
    });
  }

  private restartRace(): void {
    this.state.resetRace(this.savedBestLapTime);
    this.lastCollisionCount = this.state.collisionCount;
    this.services.analytics.track('race_restart');
    this.startRace();
  }

  private pauseRace(source: string): void {
    this.phase = 'paused';
    this.pressedTarget = null;
    this.controlCoachTimeLeft = 0;
    this.resetTouchControls();
    this.assets.pauseMusic();
    this.services.analytics.track('race_pause', { source });
  }

  private resumeRace(source: string): void {
    this.phase = 'playing';
    this.pressedTarget = null;
    this.resetTouchControls();
    this.lastCollisionCount = this.state.collisionCount;
    this.assets.playMusic();
    this.services.analytics.track('race_resume', { source, audioMuted: this.audioMuted });
  }

  private finishRace(): void {
    this.phase = 'finished';
    this.wasPlayingBeforeHidden = false;
    this.pressedTarget = null;
    this.controlCoachTimeLeft = 0;
    this.resetTouchControls();
    this.persistBestLapIfNeeded();
    this.assets.stopMusic();

    const result = this.buildRaceResult();
    this.services.analytics.track('race_finish', result);
    void this.services.leaderboard.submitScore(result);
    void this.services.ads.showInterstitial('race_finish');
  }

  private toggleAudio(): void {
    this.audioMuted = !this.audioMuted;
    this.settings.setAudioMuted(this.audioMuted);
    this.assets.setMuted(this.audioMuted);
    if (!this.audioMuted && this.phase === 'playing') this.assets.playMusic();
    this.services.analytics.track('audio_toggle', { muted: this.audioMuted, phase: this.phase });
  }

  private playCollisionSfxIfNeeded(): void {
    if (this.state.collisionCount <= this.lastCollisionCount) return;
    this.lastCollisionCount = this.state.collisionCount;
    this.assets.playCrash();
    this.services.analytics.track('collision', { collisionCount: this.state.collisionCount });
  }

  private applyTouches(touches: TouchPoint[]): void {
    const layout = this.getUiLayout();
    const joystickTouch = this.findJoystickTouch(touches);
    const brakeTouch = touches.find((touch) => pointInRect(touch, layout.controls.brakeTouchArea) || pointInCircle(touch, layout.controls.brakeButton, 18));

    this.touchActive = touches.length > 0;
    this.brakeActive = Boolean(brakeTouch);
    this.state.input.accelerate = true;
    this.state.input.brake = this.brakeActive;

    if (joystickTouch) {
      this.joystick.begin(joystickTouch, layout.controls.joystickBase, layout.controls.joystickKnobRadius);
      this.joystick.update(joystickTouch);
      this.state.input.steer = this.joystick.steer();
    } else {
      this.joystick.end();
      this.state.input.steer = 0;
    }
  }

  private findJoystickTouch(touches: TouchPoint[]): TouchPoint | undefined {
    const layout = this.getUiLayout();
    return touches.find((touch) => pointInRect(touch, layout.controls.joystickTouchArea) || pointInCircle(touch, layout.controls.joystickBase, 28));
  }

  private resetTouchControls(): void {
    this.touchActive = false;
    this.brakeActive = false;
    this.joystick.end();
    this.state.input.steer = 0;
    this.state.input.brake = false;
  }

  private isPauseButton(point: TouchPoint): boolean {
    return pointInCircle(point, this.getUiLayout().pauseButton, 10);
  }

  private isMenuStartButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.startButton);
  }

  private isMenuTrackButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.trackButton);
  }

  private isMenuLeaderboardButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.leaderboardButton);
  }

  private isMenuHelpButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.helpButton);
  }

  private isMenuAudioButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.audioButton);
  }

  private trackSelectIndex(point: TouchPoint): number | null {
    const buttons = this.getUiLayout().trackSelect.trackButtons;
    for (let index = 0; index < Math.min(buttons.length, RACER_TRACKS.length); index += 1) {
      if (pointInRect(point, buttons[index])) return index;
    }
    return null;
  }

  private trackPressedTarget(index: number): RacerUiPressedTarget {
    return `track-select-${index}` as RacerUiPressedTarget;
  }

  private trackIndexFromPressedTarget(target: RacerUiPressedTarget): number | null {
    if (!target || !target.startsWith('track-select-')) return null;
    const index = Number(target.replace('track-select-', ''));
    return Number.isInteger(index) && index >= 0 ? index : null;
  }

  private isTrackSelectBackButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().trackSelect.backButton);
  }

  private isHelpStartButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().help.startButton);
  }

  private isHelpBackButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().help.backButton);
  }

  private isPausedResumeButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().paused.resumeButton);
  }

  private isPausedRestartButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().paused.restartButton);
  }

  private isPausedAudioButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().paused.audioButton);
  }

  private isPausedMenuButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().paused.menuButton);
  }

  private finishedAction(point: TouchPoint): FinishedAction {
    const layout = this.getUiLayout().finished;

    if (pointInRect(point, layout.restartButton)) return 'restart';
    if (pointInRect(point, layout.shareButton)) return 'share';
    if (pointInRect(point, layout.leaderboardButton)) return 'leaderboard';
    return 'none';
  }

  private getUiLayout() {
    return buildRacerUiLayout(this.gameEngine.width, this.gameEngine.height);
  }

  private buildRaceResult(): RaceResult {
    return {
      trackId: this.activeTrack.id,
      trackName: this.activeTrack.name,
      completedLaps: this.state.completedLaps,
      targetLaps: this.targetLaps,
      totalRaceTime: this.state.totalRaceTime,
      bestLapTime: this.state.bestLapTime
    };
  }

  private async shareResult(): Promise<void> {
    const result = this.buildRaceResult();
    this.services.analytics.track('share_result_tap', result);
    await this.services.social.shareResult(result);
  }

  private async showLeaderboard(source: string): Promise<void> {
    this.services.analytics.track('leaderboard_tap', { source });
    await this.services.leaderboard.showLeaderboard();
  }

  private persistBestLapIfNeeded(): void {
    if (this.state.bestLapTime > 0 && this.state.bestLapTime !== this.savedBestLapTime) {
      this.savedBestLapTime = this.state.bestLapTime;
      this.storage.setBestLapTime(this.savedBestLapTime, this.activeTrack.id);
    }
  }
}
