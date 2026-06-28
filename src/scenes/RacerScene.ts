import { Engine, Scene, type Renderer, type TouchPoint } from 'lite-game-engine';
import { RacerAssets } from '../racer/RacerAssets';
import { RacerState } from '../racer/RacerState';
import { RacerStorage } from '../racer/RacerStorage';
import { Pseudo3DRenderer } from '../racer/Pseudo3DRenderer';

export class RacerScene extends Scene {
  private readonly assets = new RacerAssets();
  private readonly state: RacerState;
  private readonly storage: RacerStorage;
  private readonly pseudo3d = new Pseudo3DRenderer();
  private savedBestLapTime = 0;
  private touchActive = false;

  constructor(private readonly gameEngine: Engine) {
    super();
    this.storage = new RacerStorage(gameEngine);
    this.state = new RacerState(gameEngine.width, gameEngine.height);
    this.savedBestLapTime = this.storage.getBestLapTime();
    this.state.bestLapTime = this.savedBestLapTime;
    this.bindTouchControls();
    void this.assets.load(gameEngine);
  }

  update(dt: number): void {
    super.update(dt);

    if (!this.touchActive) {
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }

    this.state.update(dt);
    this.persistBestLapIfNeeded();
  }

  protected draw(renderer: Renderer): void {
    this.pseudo3d.render(renderer, this.state, this.assets);
  }

  private bindTouchControls(): void {
    this.gameEngine.input.onStart((touches) => this.applyTouches(touches), { persistent: true });
    this.gameEngine.input.onMove((touches) => this.applyTouches(touches), { persistent: true });
    this.gameEngine.input.onEnd(() => {
      this.touchActive = false;
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }, { persistent: true });
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

  private persistBestLapIfNeeded(): void {
    if (this.state.bestLapTime > 0 && this.state.bestLapTime !== this.savedBestLapTime) {
      this.savedBestLapTime = this.state.bestLapTime;
      this.storage.setBestLapTime(this.savedBestLapTime);
    }
  }
}
