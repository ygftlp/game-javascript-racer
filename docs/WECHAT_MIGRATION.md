# WeChat Mini Game Migration Plan

## Current state

- The original playable v4 entry is still `v4.final.html` and loads browser scripts through `<script>` tags.
- The v4 code has already been split into state, config, assets, platform, save, app, HUD, track, traffic, renderer, input, and game modules.
- The browser version still depends on DOM APIs, keyboard events, `document`, `<audio>`, and HTML controls, which are not valid as the long-term runtime model for WeChat mini games.

## Target architecture

The WeChat version should be a TypeScript business game that depends on `lite-game-engine`:

```text
src/
  main.wx.ts                 WeChat entry: Engine + WxPlatform + RacerScene
  scenes/                    Scene-level game pages
  racer/                     Racing gameplay model, state, renderer, track, config, assets, storage, services, tuning
  platforms/wechat/game.json WeChat game manifest copied during build
scripts/
  build-wechat.mjs           esbuild bundle, manifest copy, asset copy
  validate-assets.mjs        asset-pack validation
  validate-production.mjs    production structure validation
docs/
  agent-workstreams.md       multi-agent ownership plan
  asset-replacement-guide.md asset replacement rules
  production-completion-plan.md final definition of done
```

## Migration strategy

1. Keep the legacy HTML version intact during migration.
2. Add a WeChat build pipeline and `lite-game-engine` dependency.
3. Rebuild the v4 runtime as an engine `Scene` so the main loop, canvas, touch input, and platform glue come from the SDK.
4. Replace keyboard input with touch steering and mobile-friendly braking.
5. Move DOM HUD rendering into Canvas drawing or engine UI nodes.
6. Move image/audio loading to `engine.loader` / SDK audio wrappers.
7. Reintroduce traffic, sprite sheets, music, save data, and analytics in small verified steps.
8. Keep WeChat-specific sharing, ads, leaderboards, and lifecycle hooks behind service abstractions.
9. Treat asset replacement, monetization, and QA as parallel workstreams with clear file ownership.

## Implemented checkpoints

### Checkpoint 1: engine-powered WeChat MVP

- WeChat project config and manifest.
- Build scripts that bundle `src/main.wx.ts` into `dist/wechat/game.js`.
- An engine-powered `RacerScene`.
- A Canvas-drawn pseudo-3D road MVP with touch steering, braking, speed HUD, lap timer, and best lap display.

### Checkpoint 2: v4 gameplay restoration pass

- Build script now copies `images/`, `music/`, and `assets/` into the WeChat package output.
- Sprite/background atlas coordinates were moved into TypeScript.
- `RacerAssets` loads `images/background.png` and `images/sprites.png` through `engine.loader.loadTexture()` with procedural drawing as a fallback.
- The traffic model was ported into `RacerState`, including car spawning, movement, avoidance, and collision response.
- Roadside sprites were restored from the original v4 sprite groups.
- The pseudo-3D renderer now draws sprite-sheet background layers, traffic cars, roadside sprites, the player car, and HUD.
- Fastest lap time now uses `engine.platform.getStorage()` / `setStorage()` instead of browser `localStorage`.

### Checkpoint 3: mobile game flow pass

- `RacerAssets` now loads `music/racer.mp3` through `engine.loader.loadAudio()` and exposes play/pause/stop helpers.
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

## Current limitations

- The WeChat version is still a TypeScript rewrite of the v4 runtime, not a byte-for-byte port.
- Audio playback may require real-device validation because platform autoplay policies can differ.
- Ads, analytics, leaderboard, and share are currently no-op service placeholders and need a real WeChat adapter later.
- Asset licensing still needs replacing before commercial release if using the legacy sprite/music pack.
- The current UI is Canvas-drawn. It can later be converted to engine `UIManager` / `Button` if richer interaction is needed.
- This branch can organize multi-agent work, but external agents still need to be run by humans or an orchestration tool.

## Next steps

- Run `npm install`, `npm run typecheck`, `npm run validate`, and `npm run build:wx` locally.
- Open the repository root in WeChat DevTools; `project.config.json` points DevTools to `dist/wechat/`.
- Assign each lane from `docs/agent-workstreams.md` to a contributor or coding agent.
- Replace legacy art/music with a commercial-safe asset pack before publishing.
- Switch `ACTIVE_RACER_ASSET_PACK` only after required commercial files exist and validation passes.
- Add a WeChat implementation of `RacerServices` once the engine exposes a platform service adapter or the business project is allowed to supply one externally.
- Add pause/resume hooks for app hide/show after the SDK exposes lifecycle helpers or a platform event abstraction.
- Add real-device tuning for draw distance, traffic count, font sizes, and touch-control zones.
