# Agent B: Control Feel Designer

## Mission

Make driving controls comfortable enough for commercial release on landscape mobile devices.

## Owns

- `src/racer/RacerJoystick.ts`
- `src/racer/RacerUiLayout.ts`
- Steering feel in `src/racer/RacerState.ts`
- Brake button size and feedback

## Current problems to solve

- Joystick has already been enlarged, but final values need real-device validation.
- Steering needs to feel responsive without making the car unstable.
- Brake should be easy to hold without covering too much of the road.

## Tasks

1. Test joystick on small, medium, and high-DPI screens.
2. Tune:
   - Joystick radius.
   - Knob radius.
   - Touch area.
   - Dead zone.
   - Steering gain.
3. Verify brake button position does not conflict with thumb movement.
4. Add pressed-state feedback if current feedback is not obvious enough.
5. Record recommended values in `docs/commercial-ui-ux-plan.md` after device testing.

## Acceptance criteria

- Steering is understandable within 3 seconds.
- Player can drive for 10 minutes without hand fatigue.
- Joystick returns to center reliably.
- Brake works every time while held.
- No control conflicts with WeChat capsule or overlay buttons.
