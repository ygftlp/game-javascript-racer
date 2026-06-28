# Agent F: QA and Performance

## Mission

Validate the game in WeChat DevTools and on real devices, then tune performance and controls until the full 3-lap loop feels stable.

## Owns

- `src/racer/RacerTuning.ts`
- Manual QA notes
- Real-device performance matrix

## Immediate tasks

1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm run validate` after commercial assets are present.
4. Run `npm run build:wx`.
5. Open the project root in WeChat DevTools.
6. Test low / medium / high tuning profiles.
7. Record FPS, memory, package size, and touch feel on target devices.
8. Tune draw distance and traffic count thresholds.

## Done when

- A full 3-lap race is stable on the target low-end device.
- No missing required assets are reported.
- Touch steering, brake zone, pause, finish, restart, best lap, and audio behavior are verified.
- Any remaining launch blocker is documented with reproduction steps.
