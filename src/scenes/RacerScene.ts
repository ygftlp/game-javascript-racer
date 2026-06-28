import { Engine, Scene, type Renderer, type TouchPoint } from 'lite-game-engine';
import { RacerAssets } from '../racer/RacerAssets';
import { createRacerServices, type RaceResult } from '../racer/RacerServices';
import { RacerSettings } from '../racer/RacerSettings';
import { RacerState } from '../racer/RacerState';
import { RacerStorage } from '../racer/RacerStorage';
import { resolveRacerTuning } from '../racer/RacerTuning';
import { buildRacerUiLayout, pointInRect } from '../racer/RacerUiLayout';
import { Pseudo3DRenderer, type RacerPhase } from '../racer/Pseudo3DRenderer';

const TARGET_LAPS = 3;

type FinishedAction = 'restart' | 'share' | 'leaderboard' | 'none';

export class RacerScene extends Scene {
  private readonly assets = new RacerAssets();
  private readonly services = createRacerServices();
  private readonly settings: RacerSettings;
  private readonly state: RacerState;
  private readonly storage: RacerStorage;
  private readonly pseudo3d = new Pseudo3DRenderer();
  private savedBestLapTime = 0;
  private touchActive = false;
  private audioMuted = false;
  private lastCollisionCount = 0;
  private wasPlayingBeforeHidden = false;
  private phase: RacerPhase = 'menu';

  constructor(private readonly gameEngine: Engine) {
    super();
    const screen = gameEngine.platform.getScreenInfo();
    const tuning = resolveRacerTuning(gameEngine.width, gameEngine.height, screen.pixelRatio);

    this.settings = new RacerSettings(gameEngine);
    this.storage = new RacerStorage(gameEngine);
    this.state = new RacerState(gameEngine.width, gameEngine.height, tuning);
    this.savedBestLapTime = this.storage.getBestLapTime();
    this.audioMuted = this.settings.isAudioMuted();
    this.assets.setMuted(this.audioMuted);
    this.state.bestLapTime = this.savedBestLapTime;
    this.bindTouchControls();
    void this.assets.load(gameEngine);
    this.services.analytics.track('scene_ready', { tuning: tuning.profile, audioMuted: this.audioMuted });
  }

  update(dt: number): void {
    super.update(dt);

    if (this.phase !== 'playing') return;

    if (!this.touchActive) {
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }

    this.state.update(dt);
    this.playCollisionSfxIfNeeded();
    this.persistBestLapIfNeeded();

    if (this.state.completedLaps >= TARGET_LAPS) {
      this.finishRace();
    }
  }

  protected draw(renderer: Renderer): void {
    this.pseudo3d.render(renderer, this.state, this.assets, {
      phase: this.phase,
      targetLaps: TARGET_LAPS,
      audioMuted: this.audioMuted
    });
  }

  handleAppHidden(): void {
    this.wasPlayingBeforeHidden = this.phase === 'playing';
    if (!this.wasPlayingBeforeHidden) return;

    this.pauseRace('app_hide');
  }

  handleAppShown(): void {
    if (!this.wasPlayingBeforeHidden || this.phase !== 'paused') return;

    this.wasPlayingBeforeHidden = false;
    this.resumeRace('app_show');
  }

  private bindTouchControls(): void {
    this.gameEngine.input.onStart((touches) => this.handleTouchStart(touches), { persistent: true });
    this.gameEngine.input.onMove((touches) => {
      if (this.phase === 'playing') this.applyTouches(touches);
    }, { persistent: true });
    this.gameEngine.input.onEnd(() => {
      this.touchActive = false;
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }, { persistent: true });
  }

  private handleTouchStart(touches: TouchPoint[]): void {
    const point = touches[0];
    if (!point) return;

    if (this.phase === 'menu') {
      if (this.isMenuLeaderboardButton(point)) {
        this.assets.playMenuConfirm();
        void this.showLeaderboard('menu');
        return;
      }
      if (this.isMenuAudioButton(point)) {
        this.assets.playMenuConfirm();
        this.toggleAudio();
        return;
      }
      this.assets.playMenuConfirm();
      this.startRace();
      return;
    }

    if (this.phase === 'paused') {
      if (this.isPausedAudioButton(point)) {
        this.assets.playMenuConfirm();
        this.toggleAudio();
        return;
      }
      this.assets.playMenuConfirm();
      this.resumeRace('touch');
      return;
    }

    if (this.phase === 'finished') {
      const action = this.finishedAction(point);
      if (action === 'share') {
        this.assets.playMenuConfirm();
        void this.shareResult();
        return;
      }
      if (action === 'leaderboard') {
        this.assets.playMenuConfirm();
        void this.showLeaderboard('result');
        return;
      }
      this.assets.playMenuConfirm();
      this.restartRace();
      return;
    }

    if (this.isPauseButton(point)) {
      this.assets.playMenuConfirm();
      this.pauseRace('touch');
      return;
    }

    this.applyTouches(touches);
  }

  private startRace(): void {
    this.phase = 'playing';
    this.wasPlayingBeforeHidden = false;
    this.touchActive = false;
    this.lastCollisionCount = this.state.collisionCount;
    this.assets.playMusic();
    this.services.analytics.track('race_start', { tuning: this.state.tuning.profile, audioMuted: this.audioMuted });
  }

  private restartRace(): void {
    this.state.resetRace(this.savedBestLapTime);
    this.lastCollisionCount = this.state.collisionCount;
    this.services.analytics.track('race_restart');
    this.startRace();
  }

  private pauseRace(source: string): void {
    this.phase = 'paused';
    this.touchActive = false;
    this.state.input.steer = 0;
    this.state.input.brake = false;
    this.assets.pauseMusic();
    this.services.analytics.track('race_pause', { source });
  }

  private resumeRace(source: string): void {
    this.phase = 'playing';
    this.lastCollisionCount = this.state.collisionCount;
    this.assets.playMusic();
    this.services.analytics.track('race_resume', { source, audioMuted: this.audioMuted });
  }

  private finishRace(): void {
    this.phase = 'finished';
    this.wasPlayingBeforeHidden = false;
    this.touchActive = false;
    this.state.input.steer = 0;
    this.state.input.brake = false;
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
    const point = touches[0];
    if (!point) return;

    const layout = this.getUiLayout();
    this.touchActive = true;
    this.state.input.accelerate = true;
    this.state.input.brake = pointInRect(point, layout.touchZones.brake);

    if (pointInRect(point, layout.touchZones.left)) {
      this.state.input.steer = -1;
    } else if (pointInRect(point, layout.touchZones.right)) {
      this.state.input.steer = 1;
    } else {
      this.state.input.steer = 0;
    }
  }

  private isPauseButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().pauseButton);
  }

  private isMenuLeaderboardButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.leaderboardButton);
  }

  private isMenuAudioButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().menu.audioButton);
  }

  private isPausedAudioButton(point: TouchPoint): boolean {
    return pointInRect(point, this.getUiLayout().paused.audioButton);
  }

  private finishedAction(point: TouchPoint): FinishedAction {
    const layout = this.getUiLayout().finished;

    if (pointInRect(point, layout.restartButton)) return 'restart';
    if (pointInRect(point, layout.shareButton)) return 'share';
    if (pointInRect(point, layout.leaderboardButton)) return 'leaderboard';
    return 'restart';
  }

  private getUiLayout() {
    return buildRacerUiLayout(this.gameEngine.width, this.gameEngine.height);
  }

  private buildRaceResult(): RaceResult {
    return {
      completedLaps: this.state.completedLaps,
      targetLaps: TARGET_LAPS,
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
      this.storage.setBestLapTime(this.savedBestLapTime);
    }
  }
}
