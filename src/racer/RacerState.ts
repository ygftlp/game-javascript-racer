import { COLORS, RACER_CONFIG, TRACK_SECTIONS, type RoadColor } from './config';
import { BILLBOARDS, CARS, PLANTS, SPRITE_SCALE, type AtlasFrame } from './SpriteAtlas';

export interface RacerInputState {
  steer: -1 | 0 | 1;
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

function roadColorFor(index: number): RoadColor {
  return Math.floor(index / RACER_CONFIG.rumbleLength) % 2 ? COLORS.dark : COLORS.light;
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

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cameraDepth = 1 / Math.tan((RACER_CONFIG.fieldOfView / 2) * Math.PI / 180);
    this.playerZ = RACER_CONFIG.cameraHeight * this.cameraDepth;
    this.resolution = height / 480;
    this.resetRoad();
  }

  update(dt: number): void {
    const playerSegment = this.findSegment(this.position + this.playerZ);
    const playerWidth = SPRITE_SCALE * 80;
    const speedPercent = this.speed / RACER_CONFIG.maxSpeed;
    const startPosition = this.position;
    const steerDelta = dt * 2 * speedPercent;

    this.totalRaceTime += dt;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.updateTraffic(dt, playerSegment, playerWidth);

    this.position = increase(this.position, dt * this.speed, this.trackLength);

    if (this.input.steer < 0) this.playerX -= steerDelta;
    if (this.input.steer > 0) this.playerX += steerDelta;

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
    this.input.steer = 0;
    this.input.accelerate = true;
    this.input.brake = false;
    this.resetRoad();
  }

  findSegment(z: number): Segment {
    return this.segments[Math.floor(z / RACER_CONFIG.segmentLength) % this.segments.length];
  }

  resetRoad(): void {
    this.segments = [];
    this.cars = [];

    let currentY = 0;
    for (const section of TRACK_SECTIONS) {
      const startY = currentY;
      const endY = startY + section.hill * RACER_CONFIG.segmentLength;

      for (let n = 0; n < section.length; n += 1) {
        const index = this.segments.length;
        const p1 = n / section.length;
        const p2 = (n + 1) / section.length;
        const segment: Segment = {
          index,
          z1: index * RACER_CONFIG.segmentLength,
          z2: (index + 1) * RACER_CONFIG.segmentLength,
          y1: interpolate(startY, endY, p1),
          y2: interpolate(startY, endY, p2),
          curve: section.curve,
          color: roadColorFor(index),
          sprites: [],
          cars: []
        };
        this.segments.push(segment);
      }

      currentY = endY;
    }

    this.trackLength = this.segments.length * RACER_CONFIG.segmentLength;
    this.resetRoadsideSprites();
    this.resetTraffic();

    const startIndex = this.findSegment(this.playerZ).index;
    if (this.segments[startIndex + 2]) this.segments[startIndex + 2].color = COLORS.start;
    if (this.segments[startIndex + 3]) this.segments[startIndex + 3].color = COLORS.start;

    for (let n = 0; n < RACER_CONFIG.rumbleLength; n += 1) {
      this.segments[this.segments.length - 1 - n].color = COLORS.finish;
    }
  }

  private resetTraffic(): void {
    const totalCars = 90;

    for (let n = 0; n < totalCars; n += 1) {
      const frame = randomChoice(CARS);
      const z = Math.floor(Math.random() * this.segments.length) * RACER_CONFIG.segmentLength;
      const car: TrafficCar = {
        frame,
        z,
        offset: Math.random() * randomChoice([-0.78, 0.78]),
        speed: RACER_CONFIG.maxSpeed / 4 + Math.random() * RACER_CONFIG.maxSpeed / (frame === CARS[4] ? 4 : 2),
        percent: 0
      };
      this.cars.push(car);
      this.findSegment(car.z).cars.push(car);
    }
  }

  private resetRoadsideSprites(): void {
    this.addSprite(20, SPRITES_SAFE.BILLBOARD07, -1);
    this.addSprite(40, SPRITES_SAFE.BILLBOARD06, -1);
    this.addSprite(60, SPRITES_SAFE.BILLBOARD08, -1);
    this.addSprite(80, SPRITES_SAFE.BILLBOARD09, -1);
    this.addSprite(100, SPRITES_SAFE.BILLBOARD01, -1);
    this.addSprite(120, SPRITES_SAFE.BILLBOARD02, -1);
    this.addSprite(140, SPRITES_SAFE.BILLBOARD03, -1);
    this.addSprite(160, SPRITES_SAFE.BILLBOARD04, -1);
    this.addSprite(180, SPRITES_SAFE.BILLBOARD05, -1);

    for (let n = 14; n < Math.min(220, this.segments.length); n += 4 + Math.floor(n / 100)) {
      this.addSprite(n, SPRITES_SAFE.PALM_TREE, 0.5 + Math.random() * 0.5);
      this.addSprite(n, SPRITES_SAFE.PALM_TREE, 1 + Math.random() * 2);
    }

    for (let n = 230; n < this.segments.length; n += 5) {
      this.addSprite(n, SPRITES_SAFE.COLUMN, 1.1);
      this.addSprite(n + randomInt(0, 5), randomChoice([SPRITES_SAFE.TREE1, SPRITES_SAFE.TREE2]), -1 - Math.random() * 2);
    }

    for (let n = 200; n < this.segments.length; n += 3) {
      this.addSprite(n, randomChoice(PLANTS), randomChoice([1, -1]) * (2 + Math.random() * 5));
    }

    for (let n = 260; n < this.segments.length - 50; n += 80) {
      const side = randomChoice([1, -1]);
      this.addSprite(n + randomInt(0, 30), randomChoice(BILLBOARDS), -side);
      for (let i = 0; i < 8; i += 1) {
        this.addSprite(n + randomInt(0, 45), randomChoice(PLANTS), side * (1.5 + Math.random()));
      }
    }
  }

  private addSprite(segmentIndex: number, frame: AtlasFrame, offset: number): void {
    const segment = this.segments[segmentIndex];
    if (!segment) return;
    segment.sprites.push({ frame, offset });
  }

  private updateTraffic(dt: number, playerSegment: Segment, playerWidth: number): void {
    for (const car of this.cars) {
      const oldSegment = this.findSegment(car.z);
      car.offset += this.updateCarOffset(car, oldSegment, playerSegment, playerWidth);
      car.offset = clamp(car.offset, -0.95, 0.95);
      car.z = increase(car.z, dt * car.speed, this.trackLength);
      car.percent = (car.z % RACER_CONFIG.segmentLength) / RACER_CONFIG.segmentLength;
      const newSegment = this.findSegment(car.z);
      if (oldSegment !== newSegment) {
        const index = oldSegment.cars.indexOf(car);
        if (index >= 0) oldSegment.cars.splice(index, 1);
        newSegment.cars.push(car);
      }
    }
  }

  private updateCarOffset(car: TrafficCar, carSegment: Segment, playerSegment: Segment, playerWidth: number): number {
    const lookahead = 20;
    const carWidth = car.frame.w * SPRITE_SCALE;

    if (carSegment.index - playerSegment.index > RACER_CONFIG.drawDistance) return 0;

    for (let i = 1; i < lookahead; i += 1) {
      const segment = this.segments[(carSegment.index + i) % this.segments.length];

      if (segment === playerSegment && car.speed > this.speed && overlap(this.playerX, playerWidth, car.offset, carWidth, 1.2)) {
        const dir = this.playerX > 0.5 ? -1 : this.playerX < -0.5 ? 1 : car.offset > this.playerX ? 1 : -1;
        return dir * (1 / i) * ((car.speed - this.speed) / RACER_CONFIG.maxSpeed);
      }

      for (const otherCar of segment.cars) {
        const otherCarWidth = otherCar.frame.w * SPRITE_SCALE;
        if (car !== otherCar && car.speed > otherCar.speed && overlap(car.offset, carWidth, otherCar.offset, otherCarWidth, 1.2)) {
          const dir = otherCar.offset > 0.5 ? -1 : otherCar.offset < -0.5 ? 1 : car.offset > otherCar.offset ? 1 : -1;
          return dir * (1 / i) * ((car.speed - otherCar.speed) / RACER_CONFIG.maxSpeed);
        }
      }
    }

    if (car.offset < -0.9) return 0.1;
    if (car.offset > 0.9) return -0.1;
    return 0;
  }

  private checkTrafficCollision(playerSegment: Segment, playerWidth: number): void {
    if (this.collisionCooldown > 0) return;

    for (const car of playerSegment.cars) {
      const carWidth = car.frame.w * SPRITE_SCALE;
      if (this.speed > car.speed && overlap(this.playerX, playerWidth, car.offset, carWidth, 0.8)) {
        this.speed = Math.max(car.speed * (car.speed / Math.max(this.speed, 1)), RACER_CONFIG.maxSpeed / 8);
        this.position = increase(car.z, -this.playerZ, this.trackLength);
        this.collisionCooldown = 0.8;
        break;
      }
    }
  }

  private checkRoadsideCollision(playerSegment: Segment, playerWidth: number): void {
    if (this.collisionCooldown > 0) return;

    for (const sprite of playerSegment.sprites) {
      const spriteWidth = sprite.frame.w * SPRITE_SCALE;
      const spriteX = sprite.offset + (spriteWidth / 2) * (sprite.offset > 0 ? 1 : -1);
      if (overlap(this.playerX, playerWidth, spriteX, spriteWidth)) {
        this.speed = RACER_CONFIG.maxSpeed / 5;
        this.position = increase(playerSegment.z1, -this.playerZ, this.trackLength);
        this.collisionCooldown = 0.8;
        break;
      }
    }
  }
}

const SPRITES_SAFE = {
  BILLBOARD01: BILLBOARDS[0],
  BILLBOARD02: BILLBOARDS[1],
  BILLBOARD03: BILLBOARDS[2],
  BILLBOARD04: BILLBOARDS[3],
  BILLBOARD05: BILLBOARDS[4],
  BILLBOARD06: BILLBOARDS[5],
  BILLBOARD07: BILLBOARDS[6],
  BILLBOARD08: BILLBOARDS[7],
  BILLBOARD09: BILLBOARDS[8],
  PALM_TREE: PLANTS[4],
  TREE1: PLANTS[0],
  TREE2: PLANTS[1],
  COLUMN: { x: 995, y: 5, w: 200, h: 315 } satisfies AtlasFrame
};
