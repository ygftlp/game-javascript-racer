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
  racer/                     Racing gameplay model, state, renderer, track, config, assets, storage
  platforms/wechat/game.json WeChat game manifest copied during build
scripts/
  build-wechat.mjs           esbuild bundle, manifest copy, asset copy
```

## Migration strategy

1. Keep the legacy HTML version intact during migration.
2. Add a WeChat build pipeline and `lite-game-engine` dependency.
3. Rebuild the v4 runtime as an engine `Scene` so the main loop, canvas, touch input, and platform glue come from the SDK.
4. Replace keyboard input with touch steering and mobile-friendly braking.
5. Move DOM HUD rendering into Canvas drawing or engine UI nodes.
6. Move image/audio loading to `engine.loader` / `engine.audio` after the no-asset MVP runs.
7. Reintroduce traffic, sprite sheets, music, save data, and analytics in small verified steps.

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

## Current limitations

- The WeChat version is still a TypeScript rewrite of the v4 runtime, not a byte-for-byte port.
- Audio is copied into the package but not yet wired through the SDK audio API.
- Ads, analytics, menus, pause/resume, and result screens are not ported yet.
- Asset licensing still needs replacing before commercial release if using the legacy sprite/music pack.

## Next steps

- Run `npm install`, `npm run typecheck`, and `npm run build:wx` locally.
- Open the repository root in WeChat DevTools; `project.config.json` points DevTools to `dist/wechat/`.
- Wire background music through `engine.loader.loadAudio()` or the SDK `Audio` wrapper.
- Add a start/menu scene and pause/resume handling.
- Replace legacy art/music with a commercial-safe asset pack before publishing.
- Add real-device tuning for draw distance, traffic count, font sizes, and touch-control zones.
