import { COLORS, RACER_CONFIG, TRACK_SECTIONS, type RoadColor } from './config';

export interface RacerInputState {
  steer: -1 | 0 | 1;
  accelerate: boolean;
  brake: boolean;
}

export interface Segment {
  index: number;
  z1: number;
  z2: number;
  y1: number;
  y2: number;
  curve: number;
  color: RoadColor;
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
  trackLength = 0;
  position = 0;
  speed = 0;
  playerX = 0;
  currentLapTime = 0;
  lastLapTime = 0;
  bestLapTime = 0;

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
    const speedPercent = this.speed / RACER_CONFIG.maxSpeed;
    const startPosition = this.position;
    const steerDelta = dt * 2 * speedPercent;

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

    if ((this.playerX < -1 || this.playerX > 1) && this.speed > RACER_CONFIG.offRoadLimit) {
      this.speed += RACER_CONFIG.offRoadDeceleration * dt;
    }

    this.playerX = clamp(this.playerX, -3, 3);
    this.speed = clamp(this.speed, 0, RACER_CONFIG.maxSpeed);

    if (this.position > this.playerZ) {
      if (this.currentLapTime > 0 && startPosition < this.playerZ) {
        this.lastLapTime = this.currentLapTime;
        this.bestLapTime = this.bestLapTime === 0 ? this.lastLapTime : Math.min(this.bestLapTime, this.lastLapTime);
        this.currentLapTime = 0;
      } else {
        this.currentLapTime += dt;
      }
    }
  }

  findSegment(z: number): Segment {
    return this.segments[Math.floor(z / RACER_CONFIG.segmentLength) % this.segments.length];
  }

  resetRoad(): void {
    this.segments = [];

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
          color: roadColorFor(index)
        };
        this.segments.push(segment);
      }

      currentY = endY;
    }

    this.trackLength = this.segments.length * RACER_CONFIG.segmentLength;

    const startIndex = this.findSegment(this.playerZ).index;
    if (this.segments[startIndex + 2]) this.segments[startIndex + 2].color = COLORS.start;
    if (this.segments[startIndex + 3]) this.segments[startIndex + 3].color = COLORS.start;

    for (let n = 0; n < RACER_CONFIG.rumbleLength; n += 1) {
      this.segments[this.segments.length - 1 - n].color = COLORS.finish;
    }
  }
}
