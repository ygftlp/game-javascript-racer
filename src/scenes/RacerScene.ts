import { Engine, Scene, type Renderer, type TouchPoint } from 'lite-game-engine';
import { RacerAssets } from '../racer/RacerAssets';
import { createRacerServices, type RaceResult } from '../racer/RacerServices';
import { RacerSettings } from '../racer/RacerSettings';
import { RacerState } from '../racer/RacerState';
import { RacerStorage } from '../racer/RacerStorage';
import { resolveRacerTuning } from '../racer/RacerTuning';
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
      this.resumeRace();
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
      this.pauseRace();
      return;
    }

    this.applyTouches(touches);
  }

  private startRace(): void {
    this.phase = 'playing';
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

  private pauseRace(): void {
    this.phase = 'paused';
    this.touchActive = false;
    this.state.input.steer = 0;
    this.state.input.brake = false;
    this.assets.pauseMusic();
    this.services.analytics.track('race_pause');
  }

  private resumeRace(): void {
    this.phase = 'playing';
    this.lastCollisionCount = this.state.collisionCount;
    this.assets.playMusic();
    this.services.analytics.track('race_resume', { audioMuted: this.audioMuted });
  }

  private finishRace(): void {
    this.phase = 'finished';
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

    this.touchActive = true;
    this.state.input.accelerate = true;
    this.state.input.brake = point.y > this.gameEngine.height * 0.74;

    if (point.x < this.gameEngine.width * 0.42) {
      this.state.input.steer = -1;
    } else if (point.x > this.gameEngine.width * 0.58) {
      this.state.input.steer = 1;
    } else {
      this.state.input.steer = 0;
    }
  }

  private isPauseButton(point: TouchPoint): boolean {
    return point.x >= this.gameEngine.width - 112 && point.y <= 82;
  }

  private isMenuLeaderboardButton(point: TouchPoint): boolean {
    const panelY = this.overlayPanelY('menu');
    return this.isInRect(point, this.gameEngine.width / 2 - 118, panelY + 248, 236, 52);
  }

  private isMenuAudioButton(point: TouchPoint): boolean {
    const panelY = this.overlayPanelY('menu');
    return this.isInRect(point, this.gameEngine.width / 2 - 118, panelY + 312, 236, 52);
  }

  private isPausedAudioButton(point: TouchPoint): boolean {
    const panelY = this.overlayPanelY('paused');
    return this.isInRect(point, this.gameEngine.width / 2 - 110, panelY + 224, 220, 52);
  }

  private finishedAction(point: TouchPoint): FinishedAction {
    const panelY = this.overlayPanelY('finished');
    const center = this.gameEngine.width / 2;
    const y = panelY + 212;

    if (this.isInRect(point, center - 250, y, 150, 54)) return 'restart';
    if (this.isInRect(point, center - 75, y, 150, 54)) return 'share';
    if (this.isInRect(point, center + 100, y, 150, 54)) return 'leaderboard';
    return 'restart';
  }

  private overlayPanelY(phase: 'menu' | 'paused' | 'finished'): number {
    const panelH = phase === 'finished' ? 380 : phase === 'paused' ? 336 : 384;
    return (this.gameEngine.height - panelH) / 2;
  }

  private isInRect(point: TouchPoint, x: number, y: number, width: number, height: number): boolean {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
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
