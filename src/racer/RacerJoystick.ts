import type { RacerControlSensitivityProfile } from './RacerControlSensitivity';
import { DEFAULT_RACER_CONTROL_SENSITIVITY } from './RacerControlSensitivity';
import type { RacerCircle } from './RacerUiLayout';

export interface RacerJoystickSnapshot {
  active: boolean;
  centerX: number;
  centerY: number;
  knobX: number;
  knobY: number;
  radius: number;
  knobRadius: number;
  normalizedX: number;
  normalizedY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export class RacerJoystick {
  private active = false;
  private centerX = 0;
  private centerY = 0;
  private knobX = 0;
  private knobY = 0;
  private radius = 1;
  private knobRadius = 1;
  private normalizedX = 0;
  private normalizedY = 0;

  begin(point: { x: number; y: number }, base: RacerCircle, knobRadius: number): void {
    this.active = true;
    this.centerX = base.x;
    this.centerY = base.y;
    this.radius = base.r;
    this.knobRadius = knobRadius;
    this.update(point);
  }

  update(point: { x: number; y: number }): void {
    if (!this.active) return;

    const dx = point.x - this.centerX;
    const dy = point.y - this.centerY;
    const distance = Math.hypot(dx, dy);
    const maxDistance = Math.max(1, this.radius - this.knobRadius * 0.28);
    const limitedDistance = Math.min(distance, maxDistance);
    const angle = distance > 0 ? Math.atan2(dy, dx) : 0;
    const limitedX = Math.cos(angle) * limitedDistance;
    const limitedY = Math.sin(angle) * limitedDistance;
    const deadZone = 0.06;

    this.knobX = this.centerX + limitedX;
    this.knobY = this.centerY + limitedY;
    this.normalizedX = Math.abs(limitedX / maxDistance) < deadZone ? 0 : limitedX / maxDistance;
    this.normalizedY = Math.abs(limitedY / maxDistance) < deadZone ? 0 : limitedY / maxDistance;
  }

  end(): void {
    this.active = false;
    this.normalizedX = 0;
    this.normalizedY = 0;
    this.knobX = this.centerX;
    this.knobY = this.centerY;
  }

  steer(profile: RacerControlSensitivityProfile = DEFAULT_RACER_CONTROL_SENSITIVITY): number {
    return clamp(this.normalizedX * profile.joystickGain, -profile.steerInputLimit, profile.steerInputLimit);
  }

  snapshot(fallbackBase: RacerCircle, fallbackKnobRadius: number): RacerJoystickSnapshot {
    const centerX = this.centerX || fallbackBase.x;
    const centerY = this.centerY || fallbackBase.y;
    const radius = this.radius || fallbackBase.r;
    const knobRadius = this.knobRadius || fallbackKnobRadius;

    return {
      active: this.active,
      centerX,
      centerY,
      knobX: this.active ? this.knobX : centerX,
      knobY: this.active ? this.knobY : centerY,
      radius,
      knobRadius,
      normalizedX: this.normalizedX,
      normalizedY: this.normalizedY
    };
  }
}
