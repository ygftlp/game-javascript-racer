# WeChat Mini Game Migration Plan

## Current state

- The original playable v4 entry is still `v4.final.html` and loads browser scripts through `<script>` tags.
- The v4 code has already been split into state, config, assets, platform, save, app, HUD, track, traffic, renderer, input, and game modules.
- The browser version still depends on DOM APIs, keyboard events, `document`, `<audio>`, and HTML controls, which are not valid as the long-term runtime model for WeChat mini games.

## Target architecture

The WeChat version is a TypeScript business game behind an engine boundary. The branch currently uses a local compatibility engine so local typecheck/build is not blocked by the external SDK package missing built `dist` files:

```text
src/
  main.wx.ts                    WeChat source entry, calls the startup module
  engine/index.ts               Engine import boundary
  engine/local-lite-game-engine.ts Local compatibility engine for local builds and WeChat startup
  scenes/                       Scene-level game pages
  racer/                        Racing gameplay model, state, renderer, track, config, assets, settings, storage, services, tuning, ui layout
  platforms/wechat/startup.ts   Engine + WxPlatform + RacerScene startup and lifecycle binding
  platforms/wechat/game.json    WeChat game manifest copied during build
scripts/
  build-wechat.mjs              esbuild bundle, manifest copy, asset copy
  validate-assets.mjs           asset-pack validation
  validate-production.mjs       production structure validation
docs/
  local-setup-wechat.md         local setup and ENOENT / SDK troubleshooting
  agent-workstreams.md          multi-agent ownership plan
  asset-replacement-guide.md    asset replacement rules
  production-completion-plan.md final definition of done
```

Build output:

```text
dist/wechat/game.js
dist/wechat/game.json
dist/wechat/images/**
dist/wechat/music/**
dist/wechat/assets/**
```

## Migration strategy

1. Keep the legacy HTML version intact during migration.
2. Add a WeChat build pipeline and engine boundary.
3. Use the local compatibility engine until the external `lite-game-engine` GitHub dependency publishes or commits built `dist/lib` and `dist/types` files.
4. Rebuild the v4 runtime as an engine `Scene` so the main loop, canvas, touch input, and platform glue come from the boundary.
5. Replace keyboard input with touch steering and mobile-friendly braking.
6. Move DOM HUD rendering into Canvas drawing or engine UI nodes.
7. Move image/audio loading to the engine loader/audio wrappers.
8. Reintroduce traffic, sprite sheets, music, save data, and analytics in small verified steps.
9. Keep WeChat-specific sharing, ads, leaderboards, and lifecycle hooks behind service abstractions.
10. Treat asset replacement, monetization, and QA as parallel workstreams with clear file ownership.

## Implemented checkpoints

### Checkpoint 1: engine-powered WeChat MVP

- WeChat project config and manifest.
- Build scripts that bundle `src/main.wx.ts` into `dist/wechat/game.js`.
- An engine-powered `RacerScene`.
- A Canvas-drawn pseudo-3D road MVP with touch steering, braking, speed HUD, lap timer, and best lap display.

### Checkpoint 2: v4 gameplay restoration pass

- Build script now copies `images/`, `music/`, and `assets/` into the WeChat package output.
- Sprite/background atlas coordinates were moved into TypeScript.
- `RacerAssets` loads `images/background.png` and `images/sprites.png` through the engine loader with procedural drawing as a fallback.
- The traffic model was ported into `RacerState`, including car spawning, movement, avoidance, and collision response.
- Roadside sprites were restored from the original v4 sprite groups.
- The pseudo-3D renderer now draws sprite-sheet background layers, traffic cars, roadside sprites, the player car, and HUD.
- Fastest lap time now uses engine platform storage instead of browser `localStorage`.

### Checkpoint 3: mobile game flow pass

- `RacerAssets` now loads `music/racer.mp3` through the engine audio loader and exposes play/pause/stop helpers.
- `RacerScene` now has `menu`, `playing`, `paused`, and `finished` phases.
- The first touch starts the race and attempts to start looped background music.
- The top-right pause button pauses gameplay and music; any touch resumes.
- The race finishes after 3 laps, stops music, shows a result overlay, and allows restart.
- HUD now shows speed, lap progress, lap timer, best lap, asset status, and pause affordance.
- Overlay UI is drawn on Canvas, avoiding DOM and platform globals in business code.

### Checkpoint 4: commercial service and performance scaffold

- Added `RacerTuning` with low / medium / high mobile performance presets.
- `RacerScene` resolves a tuning profile from engine screen size and pixel ratio.
- `RacerState` now uses the selected tuning for draw distance and traffic count.
- HUD displays the active performance profile for easier real-device testing.
- Added `RacerServices` as a platform-independent boundary for ads, sharing, leaderboards, and analytics.
- Menu and result overlays now expose leaderboard and share buttons.
- Result flow submits score, tracks analytics, and calls interstitial-ad placeholder services without direct `wx` access.

### Checkpoint 5: completion gate and agent execution scaffold

- Added `docs/agent-workstreams.md` to split runtime, asset taxonomy, art, audio, monetization, and QA lanes.
- Added `docs/asset-replacement-guide.md` for commercial-safe replacement rules.
- Added `docs/production-completion-plan.md` with final launch definition of done.
- Added `scripts/validate-assets.mjs` to validate asset-pack files.
- Added `scripts/validate-production.mjs` to validate required production modules and warn about launch blockers.
- Added `npm run validate`, `validate:assets`, `validate:assets:legacy`, and `validate:production` scripts.
- Added `prebuild:wx` quality gate before the WeChat build.

### Checkpoint 6: runtime polish pass

- Added `RacerSettings` for persisted player preferences through platform storage.
- `RacerAssets` now tracks `idle`, `loading`, `ready`, and `fallback` asset states.
- Menu and HUD now show asset-pack label, commercial-safety flag, and asset loading/fallback state.
- Menu and pause overlays now include a persisted music on/off toggle.
- Optional sound effects are wired for engine loop, crash, and menu confirmation audio.
- Collision events trigger crash SFX when a replacement audio pack provides it.
- Production validation checks the audio-toggle flow and settings module.

### Checkpoint 7: shared UI layout and lifecycle hook pass

- Added `RacerUiLayout` to centralize overlay panels, buttons, pause button, and touch zones.
- `Pseudo3DRenderer` and `RacerScene` both use the same layout data, preventing visual buttons and touch hitboxes from drifting apart.
- The layout adapts font sizes and panel/button dimensions for smaller screens.
- Pause button placement now avoids the WeChat top-right system capsule area and uses the same safe rectangle for rendering and hit testing.
- `RacerScene` now exposes `handleAppHidden()` and `handleAppShown()` for lifecycle pause/resume.
- Added `src/platforms/wechat/startup.ts` to create `Engine + WxPlatform + RacerScene`, bind `wx.onHide/onShow`, set the scene, and start the engine.
- `src/main.wx.ts` now delegates startup to `startWeChatRacerGame()`.
- Production validation now checks shared UI layout usage, lifecycle hook presence, and WeChat startup module presence.

### Checkpoint 8: local engine compatibility pass

- Added `src/engine/index.ts` as the only engine import boundary for business code.
- Added `src/engine/local-lite-game-engine.ts` with minimal Engine, Scene, Renderer, Input, Loader, Texture, Audio, and WxPlatform compatibility.
- Removed the direct GitHub dependency on `lite-game-engine` from `package.json` so local `npm install`, typecheck, and build are not blocked by missing SDK dist files.
- Replaced direct `lite-game-engine` imports in business code with imports from `src/engine`.
- Production validation now fails if business code imports `lite-game-engine` directly.

## Current limitations

- The WeChat version is still a TypeScript rewrite of the v4 runtime, not a byte-for-byte port.
- The branch currently uses local engine compatibility mode. Switch `src/engine/index.ts` to the real SDK only after the SDK package publishes usable `dist/lib` and `dist/types`.
- Audio playback may require real-device validation because platform autoplay policies can differ.
- Ads, analytics, leaderboard, and share are currently no-op service placeholders and need a real WeChat adapter later.
- Asset licensing still needs replacing before commercial release if using the legacy sprite/music pack.
- The current UI is Canvas-drawn. It can later be converted to engine `UIManager` / `Button` if richer interaction is needed.
- This branch can organize multi-agent work, but external agents still need to be run by humans or an orchestration tool.

## Next steps

- Pull the latest `codex/modularize-v4-racer` branch; see `docs/local-setup-wechat.md`.
- If old dependency state remains locally, delete `node_modules` and `package-lock.json`, then run `npm install` again.
- Run `npm install`, `npm run typecheck`, `npm run validate`, and `npm run build:wx` locally.
- Open the repository root in WeChat DevTools; `project.config.json` points DevTools to `dist/wechat/`.
- Assign each lane from `docs/agent-workstreams.md` to a contributor or coding agent.
- Replace legacy art/music with a commercial-safe asset pack before publishing.
- Switch `ACTIVE_RACER_ASSET_PACK` only after required commercial files exist and validation passes.
- Add a real WeChat implementation of `RacerServices` for share, leaderboard, ads, and analytics.
- Add real-device tuning for draw distance, traffic count, font sizes, and touch-control zones.
