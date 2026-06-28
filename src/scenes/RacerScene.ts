import { Engine, Scene, type Renderer, type TouchPoint } from 'lite-game-engine';
import { RacerState } from '../racer/RacerState';
import { Pseudo3DRenderer } from '../racer/Pseudo3DRenderer';

export class RacerScene extends Scene {
  private readonly state: RacerState;
  private readonly pseudo3d = new Pseudo3DRenderer();
  private touchActive = false;

  constructor(private readonly gameEngine: Engine) {
    super();
    this.state = new RacerState(gameEngine.width, gameEngine.height);
    this.bindTouchControls();
  }

  update(dt: number): void {
    super.update(dt);

    if (!this.touchActive) {
      this.state.input.steer = 0;
      this.state.input.brake = false;
    }

    this.state.update(dt);
  }

  protected draw(renderer: Renderer): void {
    this.pseudo3d.render(renderer, this.state);
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
}
