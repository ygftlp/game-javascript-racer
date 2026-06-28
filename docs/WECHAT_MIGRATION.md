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
  racer/                     Racing gameplay model, state, renderer, track, config
  platforms/wechat/game.json WeChat game manifest copied during build
scripts/
  build-wechat.mjs           esbuild bundle and manifest copy
```

## Migration strategy

1. Keep the legacy HTML version intact during migration.
2. Add a WeChat build pipeline and `lite-game-engine` dependency.
3. Rebuild the v4 runtime as an engine `Scene` so the main loop, canvas, touch input, and platform glue come from the SDK.
4. Replace keyboard input with touch steering and mobile-friendly braking.
5. Move DOM HUD rendering into Canvas drawing or engine UI nodes.
6. Move image/audio loading to `engine.loader` / `engine.audio` after the no-asset MVP runs.
7. Reintroduce traffic, sprite sheets, music, save data, and analytics in small verified steps.

## First implementation checkpoint

The first checkpoint now provides:

- WeChat project config and manifest.
- Build scripts that bundle `src/main.wx.ts` into `dist/wechat/game.js`.
- An engine-powered `RacerScene`.
- A Canvas-drawn pseudo-3D road MVP with touch steering, braking, speed HUD, lap timer, and best lap display.

This is intentionally a minimal playable foundation. It avoids copying the browser-only DOM loop into the WeChat runtime and gives the project a clean path to continue porting v4 gameplay modules.

## Next steps

- Run `npm install` and `npm run build:wx` locally.
- Open the repository root in WeChat DevTools; `project.config.json` points DevTools to `dist/wechat/`.
- Port the old v4 traffic model into `src/racer/traffic`.
- Replace procedural placeholder drawing with the existing sprite/background atlas through `engine.loader.loadTexture()`.
- Move fast lap persistence to platform storage through the SDK instead of browser `localStorage`.
