# Commercialization Launch Checklist

Use this checklist before any commercial upload or public release.

## 1. Source and branch

- [ ] Release branch is `codex/modularize-v4-racer` or a release branch cut from it.
- [ ] Latest changes are pulled locally.
- [ ] Release commit SHA is recorded.
- [ ] Engine mode is recorded: `compat` or `local SDK`.
- [ ] Asset pack mode is recorded: `commercial-template` for release.

## 2. Commercial asset pack

Required files:

- [ ] `assets/packs/default/images/background.png`
- [ ] `assets/packs/default/images/sprites.png`
- [ ] `assets/packs/default/audio/music/racer.mp3`

Optional but recommended files:

- [ ] `assets/packs/default/images/ui/logo.png`
- [ ] `assets/packs/default/images/ui/icons.png`
- [ ] `assets/packs/default/audio/sfx/engine-loop.mp3`
- [ ] `assets/packs/default/audio/sfx/crash.mp3`
- [ ] `assets/packs/default/audio/sfx/menu-confirm.mp3`

Commands:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

## 3. License and compliance

- [ ] Every image has an owner/source/license record.
- [ ] Every audio file has an owner/source/license record.
- [ ] No unlicensed legacy art remains in the release bundle.
- [ ] No unlicensed music remains in the release bundle.
- [ ] No real car brand or trademark is visible unless licensed.
- [ ] No real advertiser logo is visible unless licensed.
- [ ] Share image is commercial-safe.
- [ ] App name and logo are commercial-safe.
- [ ] Latest WeChat platform rules were reviewed before release.

## 4. WeChat services

- [ ] `src/racer/RacerWechatConfig.ts` contains safe release values or build-injected values.
- [ ] No production-only secrets are committed to public source.
- [ ] Share title and optional share image are verified.
- [ ] Open data context handler is wired.
- [ ] Open data Canvas renderer is wired or replaced with production renderer.
- [ ] `submitRacerScore` stores per-track score data.
- [ ] `showRacerLeaderboard` shows the selected track board.
- [ ] Analytics events are received.
- [ ] Ads are disabled, test-configured, or production-configured according to release plan.
- [ ] Ads never appear during active driving.

## 5. Gameplay QA

- [ ] Main menu starts a race without external instructions.
- [ ] Track-select screen selects every available track.
- [ ] Settings screen persists music, minimap, operation coach, and control sensitivity.
- [ ] `舒适`, `标准`, and `灵敏` control presets feel acceptable.
- [ ] Joystick returns to center on release.
- [ ] Brake button is reachable and readable.
- [ ] Pause button is not blocked by the WeChat capsule.
- [ ] Player car remains visible through hills.
- [ ] Player car remains visible through curves.
- [ ] Player car remains visible around traffic.
- [ ] Player car remains visible after collision.
- [ ] Each track can finish its target laps.
- [ ] Best lap is stored per track.

## 6. UI / UX QA

- [ ] No debug-only UI appears in release mode.
- [ ] Logo/title area is readable.
- [ ] Button icons are readable or fallback icons are acceptable.
- [ ] HUD is readable but does not hide the driving line.
- [ ] Minimap is readable and does not block hazards.
- [ ] Result screen clearly shows total time and best lap.
- [ ] Result screen makes replay the primary action.
- [ ] Share and leaderboard actions do not block replay.
- [ ] Open data leaderboard displays title, rows, avatars/fallback, rank, total time, best lap, and empty state.

## 7. Build validation

Run:

```bash
npm install
npm run typecheck
npm run validate:production
npm run build:wx
```

Required results:

- [ ] TypeScript passes.
- [ ] Production validation passes.
- [ ] WeChat build completes.
- [ ] `dist/wechat/game.js` exists.
- [ ] `dist/wechat/game.json` exists.
- [ ] Assets are copied to `dist/wechat/`.

## 8. Device validation

- [ ] WeChat DevTools preview works.
- [ ] Real device preview works.
- [ ] Low-end device FPS is acceptable.
- [ ] Mid-range device FPS is acceptable.
- [ ] Touch layout works on small screens.
- [ ] Touch layout works on high-DPI screens.
- [ ] Package size is acceptable.
- [ ] No console error for required assets.
- [ ] Optional asset fallback warnings are acceptable.

## 9. Soft launch readiness

- [ ] First race start rate can be measured.
- [ ] Race completion can be measured.
- [ ] Second race start can be measured.
- [ ] Share tap can be measured.
- [ ] Leaderboard tap can be measured.
- [ ] Ad impression can be measured if ads are enabled.
- [ ] Crash-free sessions can be monitored.

## 10. Go / no-go signoff

Required signoffs:

- [ ] Commercialization Director
- [ ] Licensing & Compliance Agent
- [ ] Product & Gameplay Agent
- [ ] Platform Integration Agent
- [ ] Commercial QA Agent

Decision:

```text
Go / No-go:
Reason:
Release version:
Commit SHA:
Known accepted risks:
Next patch plan:
```
