import { RACER_CONFIG, type RoadColor } from './config';
import { DEFAULT_RACER_CONTROL_SENSITIVITY, type RacerControlSensitivityProfile } from './RacerControlSensitivity';
import { RACER_POWERUP_CONFIG, RACER_POWERUP_LANES, RACER_POWERUP_SEQUENCE } from './RacerPowerupConfig';
import { roadColorForSegment } from './RacerRoadTheme';
import { ACTIVE_RACER_TRACK, type RacerTrackDefinition } from './RacerTrackDefinition';
import { BILLBOARDS, CARS, PLANTS, SPRITE_SCALE, type AtlasFrame } from './SpriteAtlas';
import { RACER_TUNING_PRESETS, type RacerTuning } from './RacerTuning';

export type RacerPowerupType = 'boost' | 'slow' | 'nitro';

export interface RacerInputState {
  steer: number;
  accelerate: boolean;
  brake: boolean;
  nitro: boolean;
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

export interface TrackPowerup {
  type: RacerPowerupType;
  offset: number;
  z: number;
  percent: number;
  active: boolean;
  respawnTimer: number;
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
  powerups: TrackPowerup[];
}

const MAX_FRAME_DT = 0.15;
const MAX_PHYSICS_STEP = 1 / 60;
const TRAFFIC_LANES = [-0.65, -0.35, 0.35, 0.65] as const;

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
  readonly input: RacerInputState = { steer: 0, accelerate: true, brake: false, nitro: false };

  segments: Segment[] = [];
  cars: TrafficCar[] = [];
  powerups: TrackPowerup[] = [];
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
  boostTime = 0;
  nitroTime = 0;
  nitroReserve = 0;
  slowTime = 0;
  powerupMessage = '';
  powerupMessageTime = 0;
  powerupCount = 0;
  lastPowerupType: RacerPowerupType | null = null;
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

  get nitroCharge(): number {
    return this.nitroReserve;
  }

  get nitroActive(): boolean {
    return this.nitroTime > 0;
  }

  get activePowerupLabel(): string {
    if (this.nitroActive) return '氮气推进';
    if (this.boostTime > 0) return '加速增幅';
    if (this.slowTime > 0) return '减速干扰';
    return '';
  }

  get activePowerupTime(): number {
    if (this.powerupMessage) return 0;
    if (this.nitroActive) return this.nitroReserve / RACER_POWERUP_CONFIG.nitro.drainPerSecond;
    return Math.max(this.boostTime, this.slowTime);
  }

  setTrack(track: RacerTrackDefinition, bestLapTime = this.bestLapTime): void {
    this.track = track;
    this.resetRace(bestLapTime);
  }

  setControlSensitivity(profile: RacerControlSensitivityProfile): void {
    this.controlSensitivity = profile;
  }

  update(dt: number): void {
    let remaining = clamp(dt, 0, MAX_FRAME_DT);
    while (remaining > 0) {
      const step = Math.min(remaining, MAX_PHYSICS_STEP);
      this.updateStep(step);
      remaining -= step;
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
    this.boostTime = 0;
    this.nitroTime = 0;
    this.nitroReserve = 0;
    this.slowTime = 0;
    this.powerupMessage = '';
    this.powerupMessageTime = 0;
    this.powerupCount = 0;
    this.lastPowerupType = null;
    this.input.steer = 0;
    this.input.accelerate = true;
    this.input.brake = false;
    this.input.nitro = false;
    this.resetRoad();
  }

  findSegment(z: number): Segment {
    return this.segments[Math.floor(z / RACER_CONFIG.segmentLength) % this.segments.length];
  }

  private updateStep(dt: number): void {
    this.updatePowerupTimers(dt);

    const steeringSegment = this.findSegment(this.position + this.playerZ);
    const playerWidth = SPRITE_SCALE * 80;
    const speedPercent = this.speed / RACER_CONFIG.maxSpeed;
    const startPosition = this.position;
    const steerDelta = dt * this.controlSensitivity.steerResponse * speedPercent;
    const steerInput = clamp(this.input.steer, -this.controlSensitivity.steerInputLimit, this.controlSensitivity.steerInputLimit);
    const accelerationMultiplier = this.accelerationMultiplier();

    this.totalRaceTime += dt;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.updateTraffic(dt, steeringSegment, playerWidth);

    this.position = increase(this.position, dt * this.speed, this.trackLength);

    if (steerInput !== 0) this.playerX += steerDelta * steerInput;
    this.playerX -= steerDelta * speedPercent * steeringSegment.curve * RACER_CONFIG.centrifugal;

    if (this.input.brake) {
      this.speed += RACER_CONFIG.braking * dt;
    } else if (this.input.accelerate) {
      this.speed += RACER_CONFIG.acceleration * accelerationMultiplier * dt;
    } else {
      this.speed += RACER_CONFIG.deceleration * dt;
    }

    const collisionSegment = this.findSegment(this.position + this.playerZ);
    if (this.playerX < -1 || this.playerX > 1) {
      if (this.speed > RACER_CONFIG.offRoadLimit) {
        this.speed += RACER_CONFIG.offRoadDeceleration * dt;
      }
      this.checkRoadsideCollision(collisionSegment, playerWidth);
    }

    this.checkTrafficCollision(collisionSegment, playerWidth);
    this.checkPowerupCollision(collisionSegment, playerWidth);

    this.playerX = clamp(this.playerX, -3, 3);
    this.speed = clamp(this.speed, 0, this.speedLimit());
    this.updateLapProgress(startPosition, dt);
  }

  private updateLapProgress(startPosition: number, dt: number): void {
    if (this.position <= this.playerZ) return;

    if (this.currentLapTime > 0 && startPosition < this.playerZ) {
      this.lastLapTime = this.currentLapTime;
      this.completedLaps += 1;
      this.bestLapTime = this.bestLapTime === 0 ? this.lastLapTime : Math.min(this.bestLapTime, this.lastLapTime);
      this.currentLapTime = 0;
      return;
    }

    this.currentLapTime += dt;
  }

  private accelerationMultiplier(): number {
    if (this.nitroActive) return RACER_POWERUP_CONFIG.nitro.accelerationMultiplier;
    if (this.boostTime > 0) return RACER_POWERUP_CONFIG.boost.accelerationMultiplier;
    if (this.slowTime > 0) return RACER_POWERUP_CONFIG.slow.accelerationMultiplier;
    return 1;
  }

  private speedLimit(): number {
    if (this.nitroActive) return RACER_CONFIG.maxSpeed * RACER_POWERUP_CONFIG.nitro.speedLimitMultiplier;
    if (this.boostTime > 0) return RACER_CONFIG.maxSpeed * RACER_POWERUP_CONFIG.boost.speedLimitMultiplier;
    if (this.slowTime > 0) return RACER_CONFIG.maxSpeed * RACER_POWERUP_CONFIG.slow.speedLimitMultiplier;
    return RACER_CONFIG.maxSpeed;
  }

  private updatePowerupTimers(dt: number): void {
    this.boostTime = Math.max(0, this.boostTime - dt);
    this.slowTime = Math.max(0, this.slowTime - dt);
    this.nitroTime = 0;

    if (this.input.nitro && this.nitroReserve > 0 && this.slowTime <= 0) {
      const drain = Math.min(this.nitroReserve, RACER_POWERUP_CONFIG.nitro.drainPerSecond * dt);
      this.nitroReserve = Math.max(0, this.nitroReserve - drain);
      this.nitroTime = dt + MAX_PHYSICS_STEP;
    }

    this.powerupMessageTime = Math.max(0, this.powerupMessageTime - dt);
    if (this.powerupMessageTime === 0) this.powerupMessage = '';

    for (const powerup of this.powerups) {
      if (powerup.active || powerup.respawnTimer <= 0) continue;
      powerup.respawnTimer = Math.max(0, powerup.respawnTimer - dt);
      if (powerup.respawnTimer === 0) powerup.active = true;
    }
  }

  private applyPowerup(powerup: TrackPowerup): void {
    powerup.active = false;
    powerup.respawnTimer = RACER_POWERUP_CONFIG.respawn.minSeconds
      + Math.random() * (RACER_POWERUP_CONFIG.respawn.maxSeconds - RACER_POWERUP_CONFIG.respawn.minSeconds);
    this.powerupCount += 1;
    this.lastPowerupType = powerup.type;

    if (powerup.type === 'boost') {
      this.slowTime = 0;
      this.boostTime = Math.max(this.boostTime, RACER_POWERUP_CONFIG.boost.duration);
      this.speed = Math.max(this.speed, RACER_CONFIG.maxSpeed * RACER_POWERUP_CONFIG.boost.minPickupSpeedMultiplier);
      this.powerupMessage = '加速道具：动力提升';
    } else if (powerup.type === 'nitro') {
      this.nitroReserve = Math.min(
        RACER_POWERUP_CONFIG.nitro.maxCharge,
        this.nitroReserve + RACER_POWERUP_CONFIG.nitro.pickupCharge
      );
      this.powerupMessage = `氮气已储存：${Math.round(this.nitroReserve)}%`;
    } else {
      this.boostTime = 0;
      this.nitroTime = 0;
      this.slowTime = Math.max(this.slowTime, RACER_POWERUP_CONFIG.slow.duration);
      this.speed = Math.min(this.speed, RACER_CONFIG.maxSpeed * RACER_POWERUP_CONFIG.slow.maxHitSpeedMultiplier);
      this.powerupMessage = '减速陷阱：动力受限';
    }

    this.powerupMessageTime = 1.8;
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
          cars: [],
          powerups: []
        });
        index += 1;
      }
      height = endHeight;
    }

    this.trackLength = this.segments.length * RACER_CONFIG.segmentLength;
    this.decorateStartFinish();
    this.resetRoadsideSprites();
    this.resetPowerups();
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

  private resetPowerups(): void {
    this.powerups = [];
    const targetCount = clamp(Math.round(this.segments.length / 55), 8, 14);
    const spacing = Math.max(32, Math.floor(this.segments.length / targetCount));
    const startSafeSegments = Math.min(Math.floor(this.segments.length * 0.18), Math.ceil(RACER_CONFIG.maxSpeed * 3 / RACER_CONFIG.segmentLength));
    let lastSlowSegment = -Infinity;

    for (let powerupIndex = 0; powerupIndex < targetCount; powerupIndex += 1) {
      const type = RACER_POWERUP_SEQUENCE[powerupIndex % RACER_POWERUP_SEQUENCE.length];
      const preferredIndex = Math.min(
        this.segments.length - 24,
        Math.max(24, Math.round(startSafeSegments + powerupIndex * spacing))
      );
      const segment = this.findSafePowerupSegment(preferredIndex, spacing, type, lastSlowSegment);
      if (!segment) continue;

      const powerup: TrackPowerup = {
        type,
        offset: RACER_POWERUP_LANES[(powerupIndex * 2) % RACER_POWERUP_LANES.length],
        z: (segment.index + 0.5) * RACER_CONFIG.segmentLength,
        percent: 0.5,
        active: true,
        respawnTimer: 0
      };

      if (type === 'slow') lastSlowSegment = segment.index;
      this.powerups.push(powerup);
      segment.powerups.push(powerup);
    }
  }

  private findSafePowerupSegment(preferredIndex: number, spacing: number, type: RacerPowerupType, lastSlowSegment: number): Segment | null {
    const searchRadius = Math.max(8, Math.floor(spacing / 2));
    for (let distance = 0; distance <= searchRadius; distance += 1) {
      for (const direction of distance === 0 ? [1] : [1, -1]) {
        const index = preferredIndex + distance * direction;
        const segment = this.segments[index];
        if (!segment || index < 24 || index >= this.segments.length - 20) continue;
        if (segment.powerups.length > 0) continue;
        if (type === 'nitro' && Math.abs(segment.curve) > 1.4) continue;
        if (type === 'slow' && Math.abs(segment.curve) > 1.8) continue;
        if (type === 'slow' && index - lastSlowSegment < spacing * 2) continue;
        return segment;
      }
    }
    return null;
  }

  private resetTraffic(): void {
    this.cars = [];
    const count = Math.max(10, this.tuning.trafficCount);

    for (let i = 0; i < count; i += 1) {
      const segment = this.segments[Math.floor(Math.random() * this.segments.length)];
      const availableLanes = TRAFFIC_LANES.filter((lane) => segment.powerups.every((powerup) => Math.abs(powerup.offset - lane) > 0.38));
      const offset = randomChoice(availableLanes.length > 0 ? availableLanes : TRAFFIC_LANES);
      const car: TrafficCar = {
        frame: randomChoice(CARS),
        offset,
        z: segment.index * RACER_CONFIG.segmentLength,
        speed: randomInt(RACER_CONFIG.maxSpeed / 4, RACER_CONFIG.maxSpeed / 2),
        percent: 0
      };
      this.cars.push(car);
      segment.cars.push(car);
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

  private checkPowerupCollision(playerSegment: Segment, playerWidth: number): void {
    for (const powerup of playerSegment.powerups) {
      if (!powerup.active) continue;
      if (!overlap(this.playerX, playerWidth, powerup.offset, 0.34, 1.15)) continue;
      this.applyPowerup(powerup);
    }
  }

  private checkTrafficCollision(playerSegment: Segment, playerWidth: number): void {
    if (this.collisionCooldown > 0) return;
    for (const car of playerSegment.cars) {
      if (!overlap(this.playerX, playerWidth, car.offset, SPRITE_SCALE * 80, 0.78)) continue;
      this.speed = Math.min(this.speed, car.speed * 0.65);
      this.collisionCooldown = 0.45;
      this.collisionCount += 1;
      return;
    }
  }

  private checkRoadsideCollision(playerSegment: Segment, playerWidth: number): void {
    if (this.collisionCooldown > 0) return;
    for (const sprite of playerSegment.sprites) {
      if (!overlap(this.playerX, playerWidth, sprite.offset, SPRITE_SCALE * 120, 0.8)) continue;
      this.speed = Math.min(this.speed, RACER_CONFIG.maxSpeed / 5);
      this.collisionCooldown = 0.6;
      this.collisionCount += 1;
      return;
    }
  }
}
