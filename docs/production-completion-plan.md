# Production Completion Plan

This plan defines what must be complete before the WeChat racer can be considered a finished, publishable game.

## Goal

Ship a complete WeChat mini game version of the pseudo-3D racer with commercial-safe assets, stable gameplay, mobile UX, platform services, and launch validation.

## Completion gates

### Gate 1: Runtime foundation

Status: mostly implemented.

Required:

- WeChat entry uses `Engine + WxPlatform + RacerScene`.
- Game loop, input, rendering, storage, and audio are routed through the `src/engine` boundary.
- Local builds use `src/engine/local-lite-game-engine.ts` until the external SDK package publishes built `dist/lib` and `dist/types` files.
- Business code does not directly depend on DOM or `wx` globals.
- Legacy HTML demo remains available for reference.

Owner lane: Runtime Integration Agent.

### Gate 2: Core gameplay

Status: implemented as first production pass.

Required:

- Pseudo-3D road rendering.
- Player steering and braking.
- Traffic cars with basic AI avoidance.
- Roadside objects and collision response.
- Lap timer, best lap, total race time.
- Start menu, pause, finish result, restart.
- Tunable draw distance and traffic count.

Owner lane: Runtime Integration Agent + QA and Performance Agent.

### Gate 3: Asset replacement

Status: scaffold implemented; real replacement assets still needed.

Required:

- Replace `legacy` art and music before commercial release.
- Provide commercial-safe `assets/packs/default/images/background.png`.
- Provide commercial-safe `assets/packs/default/images/sprites.png`.
- Provide commercial-safe `assets/packs/default/audio/music/racer.mp3`.
- Optional but recommended: engine loop, crash, and menu confirm sounds.
- Update `SpriteAtlas.ts` if new atlas coordinates differ.
- Switch `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` when assets exist.

Owner lane: Asset Taxonomy Agent + Art Replacement Agent + Audio Replacement Agent.

### Gate 4: Platform services

Status: service boundary implemented; real WeChat adapter still needed.

Required:

- Implement real share adapter behind `RacerServices.social`.
- Implement leaderboard adapter behind `RacerServices.leaderboard`.
- Implement ads adapter behind `RacerServices.ads`.
- Keep AppID, ad unit IDs, and sensitive platform IDs outside public source where possible.
- Avoid direct `wx` usage inside gameplay state or renderer.

Owner lane: Monetization and Social Agent.

### Gate 5: UX polish

Status: publish controls + emergency bugfix pass implemented.

Implemented:

- Asset loading / ready / fallback status is visible in HUD and menu.
- Audio mute state is persisted through platform storage.
- Menu and pause overlays include a music toggle.
- Optional sound effects are wired for engine loop, crash, and menu confirmation audio.
- Collision events now trigger crash SFX when an audio pack provides it.
- `RacerUiLayout` centralizes overlay button rectangles and touch zones so renderer and hit tests cannot drift apart.
- `RacerScene` exposes `handleAppHidden()` and `handleAppShown()` so a platform lifecycle adapter can pause/resume without direct `wx` usage in gameplay code.
- In-race HUD is compact and includes speed, lap, time, best lap, asset/audio state, and a race progress bar.
- Left-bottom virtual joystick is enlarged and uses lower dead-zone / higher steering gain.
- `RacerState` now supports analog steering sensitivity instead of only -1 / 0 / 1 input.
- Right-bottom brake button is implemented as a large circular touch target.
- Pause button is a circular icon placed away from the WeChat capsule area.
- Player car rendering is stabilized outside segment projection clipping and clamped to a visible vertical range.
- Menu, pause, and result overlays use a more polished dark panel, accent stripe, shadow, and primary-button styling.
- Pause overlay now includes continue, restart, and music controls.

Still required:

- Tune exact joystick/brake sizes on real low-end and high-DPI devices.
- Add result screen share copy and ranking entry polish.
- Switch `src/engine/index.ts` to the real SDK after the SDK package is built/published correctly.

Owner lane: Runtime Integration Agent + QA and Performance Agent.

### Gate 6: Quality and validation

Status: scripts added; full validation requires local environment.

Required commands:

```bash
npm install
npm run typecheck
npm run validate
npm run build:wx
```

Required manual checks:

- Open project root in WeChat DevTools.
- Confirm `project.config.json` points to `dist/wechat/`.
- Start game from menu.
- Toggle music in menu and pause overlays.
- Confirm left-bottom joystick steers the car quickly enough and returns to center on release.
- Confirm player car remains visible through hills, curves, traffic, collisions, and lap wraparound.
- Confirm right-bottom brake button slows the car while held.
- Confirm pause button is not blocked by the WeChat capsule.
- Confirm displayed buttons and click hitboxes match on small and large screens.
- Confirm crash SFX plays when an audio pack provides `crash.mp3`.
- Simulate app hide/show lifecycle pause/resume.
- Finish 3 laps and restart.
- Confirm best lap and audio preference persist after reload.
- Confirm no console errors for missing required assets.
- Check FPS on low-end and mid-range devices.
- Check package size.

Owner lane: QA and Performance Agent.

## Agent task board

### Agent A: Control Feel

Next tasks:

1. Validate joystick radius, dead-zone, and steering gain in WeChat DevTools.
2. Test one-hand control comfort on target devices.
3. Tune `RacerJoystick.ts`, `RacerUiLayout.ts`, and `RacerState.ts` from device feedback.

### Agent B: UI Polish

Next tasks:

1. Review modal readability against the active art pack.
2. Polish result screen copy and ranking entry.
3. Replace Canvas placeholder styling with final art assets if available.

### Agent C: Critical Bug QA

Next tasks:

1. Reproduce long runs across hills, heavy curves, collisions, and lap wraparound.
2. Confirm the player car never disappears after the renderer stabilization fix.
3. Capture screenshots or recordings for any remaining visibility issue.

### Agent D: Runtime Integration

Next tasks:

1. Validate compatibility/local SDK engine modes in WeChat DevTools and on device.
2. Switch `src/engine/index.ts` to the real SDK once `lite-game-engine` publishes usable dist files.
3. Refine loading, fallback, and control copy after real-device validation.

### Agent E: Asset Taxonomy

Next tasks:

1. Freeze frame names for the default commercial atlas.
2. Review replacement atlas dimensions.
3. Update `SpriteAtlas.ts` if the art pipeline exports new coordinates.
4. Keep `asset-replacement-guide.md` in sync.

### Agent F: Art Replacement

Next tasks:

1. Produce commercial-safe `background.png`.
2. Produce commercial-safe `sprites.png`.
3. Verify visual scale and anchors for player, traffic, billboards, plants, and props.
4. Provide proof of commercial usage rights.

### Agent G: Audio Replacement

Next tasks:

1. Produce commercial-safe `racer.mp3`.
2. Produce optional `engine-loop.mp3`, `crash.mp3`, and `menu-confirm.mp3`.
3. Validate playback and package size.

### Agent H: Monetization and Social

Next tasks:

1. Implement a WeChat adapter for share.
2. Implement a leaderboard adapter.
3. Implement interstitial and rewarded video ad adapters.
4. Add configuration docs for app id and ad placements.

## Final definition of done

The game is done when:

- `npm run typecheck` passes.
- `npm run validate` passes.
- `npm run build:wx` passes.
- The active runtime pack is commercial-safe.
- All required art and music are licensed for commercial use.
- WeChat DevTools opens the game without missing required assets.
- Core gameplay is playable for a full 3-lap race.
- Pause, restart, best-lap storage, audio preference, share entry, leaderboard entry, and ad entry work or are intentionally disabled by config.
- Joystick, brake, and pause controls are validated on target devices.
- Player car visibility is verified across long runs and edge cases.
- Real-device performance is acceptable on the target low-end device profile.
