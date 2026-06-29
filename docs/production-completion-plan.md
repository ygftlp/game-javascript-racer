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
- Provide commercial-safe UI logo/icons before final release.
- Optional but recommended: engine loop, crash, and menu confirm sounds.
- Update `SpriteAtlas.ts` if new atlas coordinates differ.
- Switch `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` when assets exist.

Owner lane: Asset Taxonomy Agent + Art Replacement Agent + UI Visual Designer + Audio Replacement Agent.

### Gate 4: Platform services

Status: service boundary implemented; real WeChat adapter still needed.

Required:

- Implement real share adapter behind `RacerServices.social`.
- Implement leaderboard adapter behind `RacerServices.leaderboard`.
- Implement ads adapter behind `RacerServices.ads`.
- Keep AppID, ad unit IDs, and sensitive platform IDs outside public source where possible.
- Avoid direct `wx` usage inside gameplay state or renderer.
- Ads must never appear during active driving.

Owner lane: Monetization UX Designer + Monetization and Social Agent.

### Gate 5: Commercial UI / UX polish

Status: release/debug UI split, polished interaction pass, independent minimap component, UI theme tokens, and first commercial road theme implemented; commercial art still needed.

Source of truth:

- `docs/commercial-ui-ux-plan.md`
- `docs/ui-polish-agent-sync.md`
- `docs/road-replacement-guide.md`
- `docs/agent-tasks/ui-ux-director.md`
- `docs/agent-tasks/control-feel-designer.md`
- `docs/agent-tasks/ui-visual-designer.md`
- `docs/agent-tasks/gameplay-readability-qa.md`
- `docs/agent-tasks/monetization-ux.md`

Implemented:

- `src/racer/RacerUiFlags.ts` defines release/debug UI switches.
- `src/racer/RacerUiTheme.ts` centralizes UI skin tokens for HUD, controls, panels, buttons, overlays, and minimap.
- `src/racer/RacerRoadTheme.ts` centralizes road palette tokens and active road theme selection.
- `ACTIVE_RACER_ROAD_THEME` now defaults to `COMMERCIAL_ASPHALT_ROAD_THEME`.
- Release mode is the default UI mode.
- Debug-only asset/performance/commercial-safe text is hidden by default.
- Control labels and player visibility marker are hidden by default.
- Menu, pause, HUD, and result copy are now player-facing Chinese by default.
- Buttons now have a pressed state.
- Overlay actions execute on touch end, not immediately on touch start.
- Dragging outside a button cancels the pending action.
- Primary buttons have a stronger gold glow treatment.
- Pause button has a pressed visual state.
- Brake button has stronger active feedback.
- Modal panels use vignette, shadow, accent stripe, and bottom divider for clearer hierarchy.
- Result screen shows a race grade.
- `RacerUiRenderer` owns HUD, controls, overlays, help, and onboarding UI.
- `RacerMiniMap` is an independent component for the in-race track radar.
- The minimap shows curve preview, lap progress, and nearby traffic dots.
- `Pseudo3DRenderer` focuses on world rendering and delegates UI drawing.
- `Pseudo3DRenderer` now uses the active road theme fog color.
- `RacerState` generates segment road colors from the active road theme.
- Audio mute state is persisted through platform storage.
- Menu and pause overlays include a music toggle.
- Optional sound effects are wired for engine loop, crash, and menu confirmation audio.
- Collision events now trigger crash SFX when an audio pack provides it.
- `RacerUiLayout` centralizes overlay button rectangles, touch zones, and minimap placement.
- `RacerScene` exposes `handleAppHidden()` and `handleAppShown()` so a platform lifecycle adapter can pause/resume without direct `wx` usage in gameplay code.
- In-race HUD is compact and includes speed, lap, time, best lap, and a race progress bar.
- Left-bottom virtual joystick is enlarged and uses lower dead-zone / higher steering gain.
- `RacerState` now supports analog steering sensitivity instead of only -1 / 0 / 1 input.
- Right-bottom brake button is implemented as a large circular touch target.
- Pause button is a circular icon placed away from the WeChat capsule area.
- Player car rendering is stabilized outside segment projection clipping and clamped to a visible vertical range.
- Player car now has an always-visible fallback body underneath the sprite frame.
- Canvas image smoothing is disabled for sharper pixel-art sprites and backgrounds.
- Local compatibility engine now creates a high-DPI canvas using `pixelRatio` and scales the context back to logical coordinates.

Still required before commercial release:

- Replace placeholder title/logo with commercial-safe branding.
- Replace Canvas programmer-art icons with final UI icons.
- Tune exact joystick/brake/minimap sizes and opacity on real low-end and high-DPI devices.
- Tune the commercial asphalt palette on real devices for readability and contrast.
- Add final result-screen share copy, ranking entry polish, and optional medal/rating art.
- Replace legacy low-resolution art with a commercial-safe higher-quality asset pack before launch.
- Switch `src/engine/index.ts` to the real SDK after the SDK package is built/published correctly.

Owner lane: UX Director + UI Interaction Designer + Control Feel Designer + UI Visual Designer + Gameplay Readability QA + Runtime Integration Agent.

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
- Start game from menu without external instructions.
- Confirm menu buttons show pressed state on touch down.
- Confirm menu actions execute only on release inside the button.
- Confirm moving outside a button cancels the pending action.
- Toggle music in menu and pause overlays.
- Confirm left-bottom joystick steers the car quickly enough and returns to center on release.
- Confirm player car remains visible through hills, curves, traffic, collisions, lap wraparound, and continuous steering.
- Confirm pixel-art elements look sharper after smoothing is disabled.
- Confirm minimap appears under the HUD only during active driving.
- Confirm minimap curve preview gives readable left/right/straight information.
- Confirm minimap traffic dots are useful and not distracting.
- Confirm commercial asphalt road theme improves road/lane/rumble readability.
- Confirm road fog color does not wash out player car or traffic cars.
- Confirm right-bottom brake button slows the car while held and shows active feedback.
- Confirm pause button is not blocked by the WeChat capsule and shows pressed feedback.
- Confirm displayed buttons and click hitboxes match on small and large screens.
- Confirm no debug-only UI appears in release mode.
- Confirm share, leaderboard, and ad entries do not block replay.
- Confirm ads never appear while driving.
- Confirm crash SFX plays when an audio pack provides `crash.mp3`.
- Simulate app hide/show lifecycle pause/resume.
- Finish 3 laps and restart.
- Confirm best lap and audio preference persist after reload.
- Confirm no console errors for missing required assets.
- Check FPS on low-end and mid-range devices.
- Check package size.

Owner lane: QA and Performance Agent + Gameplay Readability QA.

## Agent task board

### Agent A: UX Director

Task file: `docs/agent-tasks/ui-ux-director.md`

Next tasks:

1. Validate player-facing Chinese copy in menu, pause, result, HUD, and minimap.
2. Review release/debug UI split in `RacerUiFlags.ts`.
3. Decide final commercial game name and branding direction.

### Agent B: UI Interaction Designer

Task file: `docs/ui-polish-agent-sync.md`

Next tasks:

1. Validate press-down and release-to-confirm behavior.
2. Confirm drag-outside cancellation feels safe.
3. Tune pressed state visual intensity if needed.

### Agent C: Control Feel Designer

Task file: `docs/agent-tasks/control-feel-designer.md`

Next tasks:

1. Validate joystick radius, dead-zone, and steering gain in WeChat DevTools.
2. Test one-hand control comfort on target devices.
3. Tune `RacerJoystick.ts`, `RacerUiLayout.ts`, and `RacerState.ts` from device feedback.

### Agent D: UI Visual Designer

Task file: `docs/agent-tasks/ui-visual-designer.md`

Next tasks:

1. Produce final color palette and UI component states.
2. Produce pause/music/share/leaderboard/help icons.
3. Tune minimap visual style with the final HUD skin.
4. Tune `RacerUiTheme.ts` and `RacerRoadTheme.ts` together so HUD, minimap, road, and rumble strips read as one visual system.
5. Replace placeholder title/logo when commercial branding is ready.

### Agent E: Gameplay Readability QA

Task file: `docs/agent-tasks/gameplay-readability-qa.md`

Next tasks:

1. Reproduce long runs across hills, heavy curves, collisions, and lap wraparound.
2. Confirm the player car never disappears after the renderer stabilization fix.
3. Validate minimap readability and obstruction on target screens.
4. Validate commercial asphalt road readability on target screens.
5. Capture screenshots or recordings for any remaining visibility issue.

### Agent F: Rendering Quality

Next tasks:

1. Validate smoothing-off rendering in WeChat DevTools and on device.
2. Confirm local compatibility engine high-DPI canvas mode does not break input hit testing.
3. Validate `COMMERCIAL_ASPHALT_ROAD_THEME` contrast on low-brightness devices.
4. Replace legacy low-resolution art with commercial-safe high-quality atlases.

### Agent G: Monetization UX Designer

Task file: `docs/agent-tasks/monetization-ux.md`

Next tasks:

1. Define share and leaderboard placement.
2. Define non-intrusive ad timing.
3. Confirm monetization entries never interrupt active driving.

### Agent H: Runtime Integration

Next tasks:

1. Validate compatibility/local SDK engine modes in WeChat DevTools and on device.
2. Switch `src/engine/index.ts` to the real SDK once `lite-game-engine` publishes usable dist files.
3. Refine loading, fallback, and control copy after real-device validation.

### Agent I: Asset Taxonomy

Next tasks:

1. Freeze frame names for the default commercial atlas.
2. Review replacement atlas dimensions.
3. Update `SpriteAtlas.ts` if the art pipeline exports new coordinates.
4. Keep `asset-replacement-guide.md` in sync.

### Agent J: Art Replacement

Next tasks:

1. Produce commercial-safe `background.png`.
2. Produce commercial-safe `sprites.png`.
3. Verify visual scale and anchors for player, traffic, billboards, plants, and props.
4. Provide proof of commercial usage rights.

### Agent K: Audio Replacement

Next tasks:

1. Produce commercial-safe `racer.mp3`.
2. Produce optional `engine-loop.mp3`, `crash.mp3`, and `menu-confirm.mp3`.
3. Validate playback and package size.

## Final definition of done

The game is done when:

- `npm run typecheck` passes.
- `npm run validate` passes.
- `npm run build:wx` passes.
- The active runtime pack is commercial-safe.
- All visible UI art, game art, and music are licensed for commercial use.
- WeChat DevTools opens the game without missing required assets.
- Core gameplay is playable for a full 3-lap race.
- Pause, restart, best-lap storage, audio preference, share entry, leaderboard entry, and ad entry work or are intentionally disabled by config.
- Joystick, brake, pause, minimap, and road readability are validated on target devices.
- Buttons have clear press/release feedback and safe cancellation behavior.
- Player car visibility is verified across long runs and edge cases.
- Main menu, HUD, minimap, pause, and result screens match the commercial UI/UX plan.
- Debug-only UI is hidden in release mode.
- Monetization entries do not interrupt active driving.
- Rendering quality is acceptable on target devices or the legacy art pack is replaced.
- Real-device performance is acceptable on the target low-end device profile.
