# Production Completion Plan

This plan defines what must be complete before the WeChat racer can be considered a finished, publishable game.

## Goal

Ship a complete WeChat mini game version of the pseudo-3D racer with commercial-safe assets, stable gameplay, mobile UX, platform services, and launch validation.

## Completion gates

### Gate 1: Runtime foundation

Status: mostly implemented.

Required:

- WeChat entry uses `Engine + WxPlatform + RacerScene`.
- Game loop, input, rendering, storage, and audio are routed through `lite-game-engine`.
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

Status: functional placeholder implemented.

Required:

- Improve menu layout and hitboxes on small screens.
- Add audio toggle if music is enabled by default.
- Add loading state for assets and first interaction.
- Add clearer brake/steer visual affordances.
- Add result screen share copy and ranking entry.
- Add pause behavior on app hide/show once lifecycle helpers are available.

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
- Confirm steering left/right and braking zones.
- Finish 3 laps and restart.
- Confirm best lap persists after reload.
- Confirm no console errors for missing required assets.
- Check FPS on low-end and mid-range devices.
- Check package size.

Owner lane: QA and Performance Agent.

## Agent task board

### Agent A: Runtime Integration

Next tasks:

1. Add loading overlay for asset loading / fallback.
2. Add app hide/show pause once platform lifecycle adapter exists.
3. Add optional audio mute toggle.
4. Replace placeholder Canvas buttons with engine UI components if needed.

### Agent B: Asset Taxonomy

Next tasks:

1. Freeze frame names for the default commercial atlas.
2. Review replacement atlas dimensions.
3. Update `SpriteAtlas.ts` if the art pipeline exports new coordinates.
4. Keep `asset-replacement-guide.md` in sync.

### Agent C: Art Replacement

Next tasks:

1. Produce commercial-safe `background.png`.
2. Produce commercial-safe `sprites.png`.
3. Verify visual scale and anchors for player, traffic, billboards, plants, and props.
4. Provide proof of commercial usage rights.

### Agent D: Audio Replacement

Next tasks:

1. Produce commercial-safe `racer.mp3`.
2. Produce optional `engine-loop.mp3`, `crash.mp3`, and `menu-confirm.mp3`.
3. Validate playback and package size.

### Agent E: Monetization and Social

Next tasks:

1. Implement a WeChat adapter for share.
2. Implement a leaderboard adapter.
3. Implement interstitial and rewarded video ad adapters.
4. Add configuration docs for app id and ad placements.

### Agent F: QA and Performance

Next tasks:

1. Run build and typecheck locally.
2. Test low / medium / high tuning profiles.
3. Record FPS and memory by device.
4. Tune `RacerTuning.ts` thresholds.
5. Maintain release checklist.

## Final definition of done

The game is done when:

- `npm run typecheck` passes.
- `npm run validate` passes.
- `npm run build:wx` passes.
- The active runtime pack is commercial-safe.
- All required art and music are licensed for commercial use.
- WeChat DevTools opens the game without missing required assets.
- Core gameplay is playable for a full 3-lap race.
- Pause, restart, best-lap storage, share entry, leaderboard entry, and ad entry work or are intentionally disabled by config.
- Real-device performance is acceptable on the target low-end device profile.
