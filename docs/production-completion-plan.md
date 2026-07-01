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

### Gate 3: Asset replacement

Status: scaffold implemented; real replacement assets still needed.

Required:

- Replace `legacy` art and music before commercial release.
- Provide commercial-safe `assets/packs/default/images/background.png`.
- Provide commercial-safe `assets/packs/default/images/sprites.png`.
- Provide optional commercial logo asset at `assets/packs/default/images/ui/logo.png`.
- Provide optional commercial UI icon atlas at `assets/packs/default/images/ui/icons.png`.
- Provide commercial-safe `assets/packs/default/audio/music/racer.mp3`.
- Optional but recommended: engine loop, crash, and menu confirm sounds.
- Update `SpriteAtlas.ts` if new sprite atlas coordinates differ.
- Update `RacerUiIconAtlas.ts` if the UI icon atlas grid changes.
- Use `npm run assets:commercial` before switching packs.
- Use `npm run assets:commercial:apply` to safely switch `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` only after required files exist.
- Use `npm run assets:legacy:apply` to switch back to `LEGACY_RACER_ASSET_PACK` during QA.

### Gate 4: Platform services

Status: WeChat services adapter skeleton, isolated config template, open data leaderboard protocol, and sample handler implemented; real AppID, share image, open-data project wiring, cloud setup, ad unit IDs, and device verification still needed.

Required:

- Configure `src/racer/RacerWechatConfig.ts` through a private release patch or build-time replacement before publishing.
- Configure share copy and optional share image for `RacerWechatServices`.
- Configure leaderboard through WeChat open data context or cloud function.
- Copy/adapt `docs/samples/open-data-leaderboard-handler.js` into the open data context project.
- Keep open data message names aligned with `docs/open-data-leaderboard-protocol.md` and `RacerWechatConfig.ts`.
- Configure ad unit IDs for interstitial and rewarded ads only after policy review.
- Keep AppID, ad unit IDs, cloud function names, and sensitive platform IDs outside public source where possible.
- Avoid direct `wx` usage inside gameplay state or renderer.
- Ads must never appear during active driving.
- Verify real share, leaderboard, analytics, and ads in WeChat DevTools and on device.

### Gate 5: Commercial UI / UX polish

Status: release/debug UI split, polished interaction pass, independent minimap component, optional commercial logo asset support with programmatic logo fallback, optional commercial UI icon atlas support with programmatic icon fallback, safe commercial asset pack switch script, WeChat services adapter skeleton, isolated `RacerWechatConfig.ts`, open data leaderboard protocol/sample handler, WeChat deployment guide, theme-tokenized card metrics, dedicated track-select screen, dedicated settings screen with settings cards and status pill states, configurable control sensitivity, persisted selected track, per-track best laps, and first commercial road theme implemented; commercial art and real platform configuration still needed.

Source of truth:

- `docs/wechat-deployment-guide.md`
- `docs/open-data-leaderboard-protocol.md`
- `docs/samples/open-data-leaderboard-handler.js`
- `docs/commercial-ui-ux-plan.md`
- `docs/ui-polish-agent-sync.md`
- `docs/road-replacement-guide.md`
- `docs/asset-replacement-guide.md`
- `docs/agent-tasks/ui-ux-director.md`
- `docs/agent-tasks/control-feel-designer.md`
- `docs/agent-tasks/ui-visual-designer.md`
- `docs/agent-tasks/gameplay-readability-qa.md`
- `docs/agent-tasks/monetization-ux.md`

Implemented:

- `docs/open-data-leaderboard-protocol.md` defines the `submitRacerScore` and `showRacerLeaderboard` message contract between the main domain and open data context.
- `docs/samples/open-data-leaderboard-handler.js` provides a sample `wx.onMessage` handler with `wx.setUserCloudStorage`, `wx.getFriendCloudStorage`, per-track keys, score sorting, empty state, and malformed-message fallback.
- `docs/wechat-deployment-guide.md` defines the release checklist, including the open data leaderboard wiring step and the commercial asset switch commands: `npm run assets:commercial`, `npm run assets:commercial:apply`, `npm run validate:production`, and `npm run build:wx`.
- `docs/local-setup-wechat.md` links to the deployment guide and repeats the commercial asset switch command sequence for discoverability.
- `src/racer/RacerWechatConfig.ts` isolates safe default WeChat service configuration for share copy, share image placeholder, leaderboard command/cloud function placeholder, ad unit placeholders, and console analytics.
- `src/racer/RacerWechatServices.ts` provides a WeChat services adapter skeleton for share, leaderboard, ads, and analytics.
- `src/racer/RacerServices.ts` now prefers the WeChat adapter when `globalThis.wx` exists and falls back to noop services outside WeChat.
- WeChat sharing uses `wx.shareAppMessage` with result/track metadata.
- WeChat leaderboard submit supports either cloud function submission or open-data-context `postMessage`.
- WeChat leaderboard view receives `source`, `trackId`, and `trackName` context from `RacerScene`.
- WeChat ads skeleton supports interstitial and rewarded video ad creation when ad unit IDs are configured.
- WeChat analytics skeleton forwards events to `wx.reportAnalytics` and can also log to console.
- `scripts/use-commercial-assets.mjs` checks required commercial files, reports optional fallback files, and only switches the active pack when run with `--apply`.
- `package.json` exposes `assets:commercial`, `assets:commercial:apply`, and `assets:legacy:apply` commands.
- `src/racer/RacerAssetManifest.ts` defines optional `images.brandLogo` and `images.uiIconAtlas`.
- The commercial template maps Logo to `assets/packs/default/images/ui/logo.png` and UI icons to `assets/packs/default/images/ui/icons.png`.
- `src/racer/RacerUiIconAtlas.ts` defines the 4-column, 64px-cell UI icon atlas frame order.
- `src/racer/RacerAssets.ts` loads the optional commercial Logo texture and optional commercial UI icon atlas without blocking the required background and sprite atlas.
- `src/racer/RacerUiLogo.ts` prefers a loaded commercial Logo texture and falls back to the programmatic Logo when it is missing, still loading, or fails to draw.
- `src/racer/RacerUiIcons.ts` prefers a loaded commercial UI icon atlas and falls back to programmatic icons when it is missing, still loading, or fails to draw.
- `RacerUiLogo` and `RacerUiIcons` avoid `roundRect` so they remain safer for WeChat Canvas compatibility.
- `src/racer/RacerUiTheme.ts` centralizes UI skin tokens for HUD, controls, panels, buttons, overlays, minimap, `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, `statusPill`, and icon colors.
- `RacerUiRenderer` renders the main-menu title area through `RacerUiLogo` using `极速公路` and `RETRO RACER` as fallback copy.
- `src/racer/RacerUiFlags.ts` defines release/debug UI switches.
- `src/racer/RacerRoadTheme.ts` centralizes road palette tokens and active road theme selection.
- `src/racer/RacerTrackDefinition.ts` defines a selectable track registry.
- `src/racer/RacerControlSensitivity.ts` defines `舒适`, `标准`, and `灵敏` control sensitivity profiles.
- The main menu includes iconized `开始比赛`, `选择赛道`, `排行榜`, `操作说明`, and `设置` actions.
- `RacerUiLayout` defines a dedicated track-select screen and a dedicated settings screen.
- `RacerScene` persists music, minimap, control coach, control sensitivity, selected track id, and per-track best laps.
- `RaceResult` includes selected track metadata for share / leaderboard payloads.
- Release mode is the default UI mode, and debug-only asset/performance/commercial-safe text is hidden by default.
- Buttons have a pressed state and overlay actions execute on touch end with drag-outside cancellation.
- `RacerMiniMap` is an independent component for the in-race track radar.
- `Pseudo3DRenderer` focuses on world rendering and delegates UI drawing.
- `Pseudo3DRenderer` uses the selected track road theme fog color.
- Player car rendering is stabilized outside segment projection clipping and has an always-visible fallback body underneath the sprite frame.
- Canvas image smoothing is disabled for sharper pixel-art sprites and backgrounds.
- Local compatibility engine creates a high-DPI canvas using `pixelRatio` and scales the context back to logical coordinates.

Still required before commercial release:

- Replace placeholder title/logo with commercial-safe branding.
- Add the final commercial Logo image at `assets/packs/default/images/ui/logo.png`, or keep the programmatic logo fallback.
- Add the final commercial UI icon atlas at `assets/packs/default/images/ui/icons.png`, or keep the programmatic icon fallback.
- Replace legacy low-resolution art with a commercial-safe higher-quality asset pack before launch.
- Configure real WeChat AppID, share image, cloud/open-data leaderboard path, and ad unit IDs through a private release process.
- Replace the sample open data console renderer with a production Canvas leaderboard UI.
- Verify `wx.shareAppMessage`, open data context score storage/ranking, cloud score submission, `wx.reportAnalytics`, interstitial ads, and rewarded ads on real WeChat targets.
- Tune exact joystick/brake/minimap sizes and opacity on real low-end and high-DPI devices.
- Tune the dedicated track-select screen and settings screen on small devices.
- Tune theme-tokenized `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` metrics on target devices.
- Tune the `舒适 / 标准 / 灵敏` sensitivity presets from real device feedback.
- Tune the commercial asphalt palette and all selectable track section layouts on real devices.
- Add final result-screen share copy, ranking entry polish, and optional medal/rating art.
- Switch `src/engine/index.ts` to the real SDK after the SDK package is built/published correctly.

### Gate 6: Quality and validation

Status: scripts and deployment guide added; full validation requires local environment.

Required commercial switch commands:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

Required full validation commands:

```bash
npm install
npm run typecheck
npm run validate:production
npm run build:wx
```

Required manual checks:

- Open project root in WeChat DevTools.
- Confirm `project.config.json` points to `dist/wechat/`.
- Confirm `npm run assets:commercial` fails when required commercial files are missing.
- Confirm `npm run assets:commercial` reports optional missing logo/icon/sfx files as fallbacks, not blockers.
- Confirm `npm run assets:commercial:apply` switches to `COMMERCIAL_TEMPLATE_ASSET_PACK` only after required files exist.
- Confirm `npm run assets:legacy:apply` switches back to `LEGACY_RACER_ASSET_PACK`.
- Confirm `RacerWechatConfig.ts` contains only safe defaults or release-approved injected values.
- Confirm `createRacerServices()` uses noop fallback outside WeChat and WeChat adapter inside WeChat.
- Confirm `wx.shareAppMessage` receives result share copy and track query metadata.
- Confirm open data context receives `submitRacerScore` with `trackId`, `trackName`, `totalRaceTime`, and `bestLapTime`.
- Confirm open data context receives `showRacerLeaderboard` with `source`, `trackId`, and `trackName`.
- Confirm open data context stores and reads per-track keys as `racer.score.${trackId}`.
- Confirm malformed open data messages do not crash the open data context.
- Confirm interstitial ads only request after race finish, never during active driving.
- Confirm rewarded video can be configured later without blocking normal gameplay.
- Confirm missing optional Logo/icon/sfx files only show fallback warnings and do not block gameplay.
- Confirm selected track, per-track best lap, audio preference, minimap preference, operation coach preference, and control sensitivity persist after reload.
- Confirm no debug-only UI appears in release mode.
- Finish the configured target lap count on each selectable track and restart.
- Check FPS on low-end and mid-range devices.
- Check package size.
