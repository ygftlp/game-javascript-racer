import { RACER_CONFIG, type RoadColor } from './config';
import { DEFAULT_RACER_CONTROL_SENSITIVITY, type RacerControlSensitivityProfile } from './RacerControlSensitivity';
import { roadColorForSegment } from './RacerRoadTheme';
import { ACTIVE_RACER_TRACK, type RacerTrackDefinition } from './RacerTrackDefinition';
import { BILLBOARDS, CARS, PLANTS, SPRITE_SCALE, type AtlasFrame } from './SpriteAtlas';
import { RACER_TUNING_PRESETS, type RacerTuning } from './RacerTuning';

export interface RacerInputState {
  steer: number;
  accelerate: boolean;
  brake: boolean;
}

export interface RoadsideSprite {
  frame: AtlasFrame;
  offset: number;
}

export interface TrafficCar {
  frame: AtlasFrame;
  offset: number;
  z: number;
  speed: number;
  percent: number;
}

export interface Segment {
  index: number;
  z1: number;
  z2: number;
  y1: number;
  y2: number;
  curve: number;
  color: RoadColor;
  sprites: RoadsideSprite[];
  cars: TrafficCar[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function increase(start: number, increment: number, max: number): number {
  let result = start + increment;
  while (result >= max) result -= max;
  while (result < 0) result += max;
  return result;
}

function interpolate(a: number, b: number, percent: number): number {
  return a + (b - a) * percent;
}

function randomInt(min: number, max: number): number {
  return Math.round(interpolate(min, max, Math.random()));
}

function randomChoice<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function overlap(x1: number, w1: number, x2: number, w2: number, percent = 1): boolean {
  const half = percent / 2;
  const min1 = x1 - w1 * half;
  const max1 = x1 + w1 * half;
  const min2 = x2 - w2 * half;
  const max2 = x2 + w2 * half;
  return !(max1 < min2 || min1 > max2);
}

export class RacerState {
  readonly width: number;
  readonly height: number;
  readonly cameraDepth: number;
  readonly playerZ: number;
  readonly resolution: number;
  readonly input: RacerInputState = { steer: 0, accelerate: true, brake: false };

  segments: Segment[] = [];
  cars: TrafficCar[] = [];
  trackLength = 0;
  position = 0;
  speed = 0;
  playerX = 0;
  currentLapTime = 0;
  lastLapTime = 0;
  bestLapTime = 0;
  completedLaps = 0;
  totalRaceTime = 0;
  collisionCooldown = 0;
  collisionCount = 0;
  private controlSensitivity: RacerControlSensitivityProfile = DEFAULT_RACER_CONTROL_SENSITIVITY;

  constructor(
    width: number,
    height: number,
    readonly tuning: RacerTuning = RACER_TUNING_PRESETS.medium,
    private track: RacerTrackDefinition = ACTIVE_RACER_TRACK
  ) {
    this.width = width;
    this.height = height;
    this.cameraDepth = 1 / Math.tan((RACER_CONFIG.fieldOfView / 2) * Math.PI / 180);
    this.playerZ = RACER_CONFIG.cameraHeight * this.cameraDepth;
    this.resolution = height / 480;
    this.resetRoad();
  }

  get activeTrack(): RacerTrackDefinition {
    return this.track;
  }

  setTrack(track: RacerTrackDefinition, bestLapTime = this.bestLapTime): void {
    this.track = track;
    this.resetRace(bestLapTime);
  }

  setControlSensitivity(profile: RacerControlSensitivityProfile): void {
    this.controlSensitivity = profile;
  }

  update(dt: number): void {
    const playerSegment = this.findSegment(this.position + this.playerZ);
    const playerWidth = SPRITE_SCALE * 80;
    const speedPercent = this.speed / RACER_CONFIG.maxSpeed;
    const startPosition = this.position;
    const steerDelta = dt * this.controlSensitivity.steerResponse * speedPercent;
    const steerInput = clamp(this.input.steer, -this.controlSensitivity.steerInputLimit, this.controlSensitivity.steerInputLimit);

    this.totalRaceTime += dt;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.updateTraffic(dt, playerSegment, playerWidth);

    this.position = increase(this.position, dt * this.speed, this.trackLength);

    if (steerInput !== 0) this.playerX += steerDelta * steerInput;

    this.playerX -= steerDelta * speedPercent * playerSegment.curve * RACER_CONFIG.centrifugal;

    if (this.input.brake) {
      this.speed += RACER_CONFIG.braking * dt;
    } else if (this.input.accelerate) {
      this.speed += RACER_CONFIG.acceleration * dt;
    } else {
      this.speed += RACER_CONFIG.deceleration * dt;
    }

    if (this.playerX < -1 || this.playerX > 1) {
      if (this.speed > RACER_CONFIG.offRoadLimit) {
        this.speed += RACER_CONFIG.offRoadDeceleration * dt;
      }
      this.checkRoadsideCollision(playerSegment, playerWidth);
    }

    this.checkTrafficCollision(playerSegment, playerWidth);

    this.playerX = clamp(this.playerX, -3, 3);
    this.speed = clamp(this.speed, 0, RACER_CONFIG.maxSpeed);

    if (this.position > this.playerZ) {
      if (this.currentLapTime > 0 && startPosition < this.playerZ) {
        this.lastLapTime = this.currentLapTime;
        this.completedLaps += 1;
        this.bestLapTime = this.bestLapTime === 0 ? this.lastLapTime : Math.min(this.bestLapTime, this.lastLapTime);
        this.currentLapTime = 0;
      } else {
        this.currentLapTime += dt;
      }
    }
  }

  resetRace(bestLapTime = this.bestLapTime): void {
    this.position = 0;
    this.speed = 0;
    this.playerX = 0;
    this.currentLapTime = 0;
    this.lastLapTime = 0;
    this.bestLapTime = bestLapTime;
    this.completedLaps = 0;
    this.totalRaceTime = 0;
    this.collisionCooldown = 0;
    this.collisionCount = 0;
    this.input.steer = 0;
    this.input.accelerate = true;
    this.input.brake = false;
    this.resetRoad();
  }

  findSegment(z: number): Segment {
    return this.segments[Math.floor(z / RACER_CONFIG.segmentLength) % this.segments.length];
  }

  private resetRoad(): void {
    this.segments = [];
    let height = 0;
    let index = 0;

    for (const section of this.track.sections) {
      const startHeight = height;
      const endHeight = height + section.hill;
      for (let i = 0; i < section.length; i += 1) {
        const percent = i / Math.max(1, section.length - 1);
        this.segments.push({
          index,
          z1: index * RACER_CONFIG.segmentLength,
          z2: (index + 1) * RACER_CONFIG.segmentLength,
          y1: interpolate(startHeight, endHeight, percent),
          y2: interpolate(startHeight, endHeight, Math.min(1, percent + 1 / section.length)),
          curve: section.curve,
          color: roadColorForSegment(index, this.track.roadTheme),
          sprites: [],
          cars: []
        });
        index += 1;
      }
      height = endHeight;
    }

    this.trackLength = this.segments.length * RACER_CONFIG.segmentLength;
    this.decorateStartFinish();
    this.resetRoadsideSprites();
    this.resetTraffic();
  }

  private decorateStartFinish(): void {
    for (let i = 0; i < Math.min(12, this.segments.length); i += 1) {
      this.segments[i].color = this.track.roadTheme.start;
    }
    for (let i = this.segments.length - 16; i < this.segments.length; i += 1) {
      if (this.segments[i]) this.segments[i].color = this.track.roadTheme.finish;
    }
  }

  private resetRoadsideSprites(): void {
    const theme = this.track.roadsideTheme;
    for (let i = 10; i < this.segments.length; i += 10) {
      const leftFrame = theme === 'night' ? randomChoice(BILLBOARDS) : randomChoice(PLANTS);
      const rightFrame = theme === 'coast' ? randomChoice(BILLBOARDS) : randomChoice([...PLANTS, ...BILLBOARDS]);
      this.segments[i].sprites.push({ frame: leftFrame, offset: -1.35 - Math.random() * 1.3 });
      this.segments[i].sprites.push({ frame: rightFrame, offset: 1.2 + Math.random() * 1.6 });
    }
  }

  private resetTraffic(): void {
    this.cars = [];
    const count = Math.max(10, this.tuning.trafficCount);

    for (let i = 0; i < count; i += 1) {
      const car: TrafficCar = {
        frame: randomChoice(CARS),
        offset: randomChoice([-0.65, -0.35, 0.35, 0.65]),
        z: Math.floor(Math.random() * this.segments.length) * RACER_CONFIG.segmentLength,
        speed: randomInt(RACER_CONFIG.maxSpeed / 4, RACER_CONFIG.maxSpeed / 2),
        percent: 0
      };
      this.cars.push(car);
      this.findSegment(car.z).cars.push(car);
    }
  }

  private updateTraffic(dt: number, playerSegment: Segment, playerWidth: number): void {
    for (const car of this.cars) {
      const oldSegment = this.findSegment(car.z);
      oldSegment.cars = oldSegment.cars.filter((item) => item !== car);

      car.offset += this.avoidPlayer(car, playerSegment, playerWidth);
      car.offset = clamp(car.offset, -0.85, 0.85);
      car.z = increase(car.z, dt * car.speed, this.trackLength);
      car.percent = (car.z % RACER_CONFIG.segmentLength) / RACER_CONFIG.segmentLength;
      this.findSegment(car.z).cars.push(car);
    }
  }

  private avoidPlayer(car: TrafficCar, playerSegment: Segment, playerWidth: number): number {
    if (car.z <= this.position || car.z > this.position + RACER_CONFIG.segmentLength * 18) return 0;
    if (!overlap(this.playerX, playerWidth, car.offset, SPRITE_SCALE * 80, 1.6)) return 0;

    return car.offset > this.playerX ? 0.04 : -0.04;
  }

  private checkTrafficCollision(playerSegment: Segment, playerWidth: number): void {
    for (const car of playerSegment.cars) {
      if (!overlap(this.playerX, playerWidth, car.offset, SPRITE_SCALE * 80, 0.78)) continue;
      this.speed = Math.min(this.speed, car.speed * 0.65);
      this.collisionCooldown = 0.45;
      this.collisionCount += 1;
    }
  }

  private checkRoadsideCollision(playerSegment: Segment, playerWidth: number): void {
    for (const sprite of playerSegment.sprites) {
      if (!overlap(this.playerX, playerWidth, sprite.offset, SPRITE_SCALE * 120, 0.8)) continue;
      this.speed = Math.min(this.speed, RACER_CONFIG.maxSpeed / 5);
      this.collisionCooldown = 0.6;
      this.collisionCount += 1;
    }
  }
}
