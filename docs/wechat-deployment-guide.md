# WeChat Deployment Guide

This guide is the release checklist for building the WeChat mini game package.

## 1. Pull the release branch

```bash
cd /d D:\JavaWorkspace\game-javascript-racer
git fetch origin
git checkout codex/modularize-v4-racer
git pull origin codex/modularize-v4-racer
```

## 2. Choose engine mode

Default compatibility mode:

```bash
npm run engine:compat
npm install
```

Local SDK mode, when `D:\JavaWorkspace\game-engine` has already been built:

```bash
npm run engine:local
npm install
```

## 3. Configure WeChat services

Platform service defaults live in:

```text
src/racer/RacerWechatConfig.ts
```

Use this file as the safe template for:

- share title prefix and optional share image
- leaderboard open-data command
- optional cloud function name
- optional interstitial ad unit ID
- optional rewarded video ad unit ID
- console analytics during QA

Do not commit production-only secrets or sensitive platform IDs into public source. Use a private release patch or build-time replacement when needed.

## 4. Wire open data leaderboard

The main domain sends leaderboard messages from `src/racer/RacerWechatServices.ts` through `wx.getOpenDataContext().postMessage(...)`.

Protocol document:

```text
docs/open-data-leaderboard-protocol.md
```

Sample open data context handler:

```text
docs/samples/open-data-leaderboard-handler.js
```

The sample handler covers:

- `submitRacerScore`
- `showRacerLeaderboard`
- per-track storage key `racer.score.${trackId}`
- `wx.setUserCloudStorage`
- `wx.getFriendCloudStorage`
- total-time ranking with best-lap tie-breaker
- empty-state and malformed-message fallbacks

Copy the sample into the open data context project, replace the console renderer with Canvas drawing, and keep the message names aligned with `RacerWechatConfig.ts`.

## 5. Switch to commercial assets

Before publishing, put commercial-safe files under `assets/packs/default/`.

Required for switching:

```text
assets/packs/default/images/background.png
assets/packs/default/images/sprites.png
assets/packs/default/audio/music/racer.mp3
```

Optional runtime fallback files:

```text
assets/packs/default/images/ui/logo.png
assets/packs/default/images/ui/icons.png
assets/packs/default/audio/sfx/engine-loop.mp3
assets/packs/default/audio/sfx/crash.mp3
assets/packs/default/audio/sfx/menu-confirm.mp3
```

Run the safe switch commands from the repository root:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

Command meanings:

- `npm run assets:commercial` checks required and optional commercial files without changing source.
- `npm run assets:commercial:apply` switches `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` only after required files exist.
- `npm run validate:production` checks production structure, UI/service boundaries, commercial switch flow, and docs.
- `npm run build:wx` builds the WeChat mini game bundle into `dist/wechat/`.

Rollback during QA:

```bash
npm run assets:legacy:apply
npm run validate:production
npm run build:wx
```

## 6. Full release validation

Run:

```bash
npm run typecheck
npm run validate:production
npm run build:wx
```

Then open the repository root in WeChat DevTools. `project.config.json` points the game root to:

```text
dist/wechat/
```

## 7. Manual WeChat checks

Check these before upload/release:

- Game starts from the main menu without debug-only UI.
- Commercial background, sprites, logo, icons, and audio load when commercial-template is active.
- Missing optional logo/icons/sfx only show fallback warnings and do not block gameplay.
- `wx.shareAppMessage` receives share title, query metadata, `trackId`, and best-lap context.
- Open data context receives `submitRacerScore` with `trackId`, `trackName`, `totalRaceTime`, and `bestLapTime`.
- Open data context receives `showRacerLeaderboard` with `source`, `trackId`, and `trackName`.
- Open data context stores per-track score keys as `racer.score.${trackId}`.
- Open data context ignores malformed messages without crashing.
- Interstitial ads are requested only after race finish, never while driving.
- Rewarded ads are not shown unless explicitly wired to an opt-in reward.
- `wx.reportAnalytics` receives scene, race, settings, share, leaderboard, and finish events.
- Settings persist after reload: music, minimap, operation coach, control sensitivity.
- Selected track and per-track best lap persist after reload.
- Pause button is not blocked by the WeChat capsule.
- Player car remains visible through hills, curves, traffic, collisions, and lap wraparound.
- FPS and package size are acceptable on low-end and mid-range devices.

## 8. Upload package

After local validation:

1. Open WeChat DevTools.
2. Import/open `D:\JavaWorkspace\game-javascript-racer`.
3. Confirm the compiled game root is `dist/wechat/`.
4. Preview on device.
5. Upload through WeChat DevTools.
6. Record the package version, asset pack mode, engine mode, open data context version, and commit SHA used for the upload.
