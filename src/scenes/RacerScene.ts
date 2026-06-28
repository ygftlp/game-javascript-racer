import { Engine, Scene, type Renderer, type TouchPoint } from 'lite-game-engine';
import { RacerAssets } from '../racer/RacerAssets';
import { createRacerServices, type RaceResult } from '../racer/RacerServices';
import { RacerState } from '../racer/RacerState';
import { RacerStorage } from '../racer/RacerStorage';
import { resolveRacerTuning } from '../racer/RacerTuning';
import { Pseudo3DRenderer, type RacerPhase } from '../racer/Pseudo3DRenderer';

const TARGET_LAPS = 3;

type FinishedAction = 'restart' | 'share' | 'leaderboard' | 'none';

export class RacerScene extends Scene {
  private readonly assets = new RacerAssets();
  private readonly services = createRacerServices();
  private readonly state: RacerState;
  private readonly storage: RacerStorage;
  private readonly pseudo3d = new Pseudo3DRenderer();
  private savedBestLapTime = 0;
  private touchActive = false;
  private phase: RacerPhase = 'menu';

  constructor(private readonly gameEngine: Engine) {
    super();
    const screen = gameEngine.platform.getScreenInfo();
    const tuning = resolveRacerTuning(gameEngine.width, gameEngine.height, screen.pixelRatio);

    this.storage = new RacerStorage(gameEngine);
    this.state = new RacerState(gameEngine.width, gameEngine.height, tuning);
    this.savedBestLapTime = this.storage.getBestLapTime();
    this.state.bestLapTime = this.savedBestLapTime;
    this.bindTouchControls();
    void this.assets.load(gameEngine);
    this.services.analytics.track('scene_ready', { tuning: tuning.profile });
  }

  update(dt: number): void {
    super.update(dt);

    if (this.phase !== 'playing') return;

    if (!this.touchActive) {
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }

    this.state.update(dt);
    this.persistBestLapIfNeeded();

    if (this.state.completedLaps >= TARGET_LAPS) {
      this.finishRace();
    }
  }

  protected draw(renderer: Renderer): void {
    this.pseudo3d.render(renderer, this.state, this.assets, {
      phase: this.phase,
      targetLaps: TARGET_LAPS
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
        void this.showLeaderboard('menu');
        return;
      }
      this.startRace();
      return;
    }

    if (this.phase === 'paused') {
      this.resumeRace();
      return;
    }

    if (this.phase === 'finished') {
      const action = this.finishedAction(point);
      if (action === 'share') {
        void this.shareResult();
        return;
      }
      if (action === 'leaderboard') {
        void this.showLeaderboard('result');
        return;
      }
      this.restartRace();
      return;
    }

    if (this.isPauseButton(point)) {
      this.pauseRace();
      return;
    }

    this.applyTouches(touches);
  }

  private startRace(): void {
    this.phase = 'playing';
    this.touchActive = false;
    this.assets.playMusic();
    this.services.analytics.track('race_start', { tuning: this.state.tuning.profile });
  }

  private restartRace(): void {
    this.state.resetRace(this.savedBestLapTime);
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
    this.assets.playMusic();
    this.services.analytics.track('race_resume');
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
    return this.isInRect(point, this.gameEngine.width / 2 - 118, panelY + 242, 236, 52);
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

  private overlayPanelY(phase: 'menu' | 'finished'): number {
    const panelH = phase === 'finished' ? 380 : 318;
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
