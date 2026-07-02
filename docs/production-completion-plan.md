# Production Completion Plan

This plan defines what must be complete before the WeChat racer can be considered a finished, publishable game.

## Goal

Ship a complete WeChat mini game version of the pseudo-3D racer with commercial-safe assets, stable gameplay, mobile UX, platform services, commercialization readiness, and launch validation.

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

Status: WeChat services adapter skeleton, isolated config template, open data leaderboard protocol, sample handler, and sample Canvas renderer implemented; real AppID, share image, open-data project wiring, cloud setup, ad unit IDs, and device verification still needed.

Required:

- Configure `src/racer/RacerWechatConfig.ts` through a private release patch or build-time replacement before publishing.
- Configure share copy and optional share image for `RacerWechatServices`.
- Configure leaderboard through WeChat open data context or cloud function.
- Copy/adapt `docs/samples/open-data-leaderboard-handler.js` into the open data context project.
- Copy/adapt `docs/samples/open-data-leaderboard-canvas.js` into the open data context project.
- Keep open data message names aligned with `docs/open-data-leaderboard-protocol.md` and `RacerWechatConfig.ts`.
- Configure ad unit IDs for interstitial and rewarded ads only after policy review.
- Keep AppID, ad unit IDs, cloud function names, and sensitive platform IDs outside public source where possible.
- Avoid direct `wx` usage inside gameplay state or renderer.
- Ads must never appear during active driving.
- Verify real share, leaderboard, analytics, and ads in WeChat DevTools and on device.

### Gate 5: Commercial UI / UX polish

Status: release/debug UI split, polished interaction pass, independent minimap component, optional commercial logo asset support with programmatic logo fallback, optional commercial UI icon atlas support with programmatic icon fallback, safe commercial asset pack switch script, WeChat services adapter skeleton, isolated `RacerWechatConfig.ts`, open data leaderboard protocol/sample handler/sample Canvas renderer, WeChat deployment guide, theme-tokenized card metrics, dedicated track-select screen, dedicated settings screen with settings cards and status pill states, configurable control sensitivity, persisted selected track, per-track best laps, and first commercial road theme implemented; commercial art and real platform configuration still needed.

Source of truth:

- `docs/wechat-deployment-guide.md`
- `docs/open-data-leaderboard-protocol.md`
- `docs/samples/open-data-leaderboard-handler.js`
- `docs/samples/open-data-leaderboard-canvas.js`
- `docs/commercial-ui-ux-plan.md`
- `docs/ui-polish-agent-sync.md`
- `docs/road-replacement-guide.md`
- `docs/asset-replacement-guide.md`
- `docs/agent-tasks/ui-ux-director.md`
- `docs/agent-tasks/control-feel-designer.md`
- `docs/agent-tasks/ui-visual-designer.md`
- `docs/agent-tasks/gameplay-readability-qa.md`
- `docs/agent-tasks/monetization-ux.md`

### Gate 6: Commercialization readiness

Status: commercialization plan, multi-agent workstreams, roadmap, asset rights register, risk register, launch checklist, and dedicated commercial agent task cards implemented; commercial assets, asset license proof, live platform values, launch QA, and go/no-go signoff still needed.

Source of truth:

- `docs/commercialization-plan.md`
- `docs/commercialization-agent-workstreams.md`
- `docs/commercialization-roadmap.md`
- `docs/commercialization-asset-rights-register.md`
- `docs/commercialization-risk-register.md`
- `docs/commercialization-launch-checklist.md`
- `docs/agent-tasks/commercialization-director.md`
- `docs/agent-tasks/licensing-compliance.md`
- `docs/agent-tasks/monetization-strategy.md`
- `docs/agent-tasks/growth-publishing.md`
- `docs/agent-tasks/liveops-analytics.md`

Implemented:

- `docs/commercialization-plan.md` defines product positioning, target audience, commercial pillars, revenue model phases, KPIs, commercial milestones, and go/no-go rules.
- `docs/commercialization-agent-workstreams.md` assigns Commercialization Director, Licensing & Compliance, Product & Gameplay, Monetization Strategy, Growth & Publishing, LiveOps & Analytics, Art & Audio, Platform Integration, and Commercial QA roles.
- `docs/commercialization-roadmap.md` defines phases from commercial-safe content pack through soft launch, monetization expansion, and content expansion.
- `docs/commercialization-asset-rights-register.md` defines the release asset rights register for background, sprites, logo, icon atlas, music, sfx, and share card, including owner/source/license/proof fields and required approval status.
- `docs/commercialization-risk-register.md` tracks launch blockers around asset rights, trademarks, ads, leaderboard fairness, controls, visibility, WeChat service configuration, package size, policy review, and scope creep.
- `docs/commercialization-launch-checklist.md` defines the release go/no-go checklist covering source branch, commercial assets, asset rights, licensing, WeChat services, gameplay QA, UI/UX QA, build validation, device validation, soft-launch measurement, and signoff.
- Commercialization agent task cards define ownership for launch direction, compliance, monetization, growth/publishing, and liveops analytics.

Required before commercial release:

- Complete commercial-safe asset pack and asset rights register.
- Mark every required asset in `docs/commercialization-asset-rights-register.md` as `approved`.
- Mark every optional asset as `approved` or `fallback-approved`.
- Configure live WeChat share, leaderboard, analytics, and ad values through a private release process.
- Run the full deployment checklist and launch checklist.
- Resolve all P0 blockers in `docs/commercialization-risk-register.md`.
- Capture go/no-go signoff in `docs/commercialization-launch-checklist.md`.

### Gate 7: Quality and validation

Status: scripts, deployment guide, open data samples, commercialization docs, and asset rights register added; full validation requires local environment.

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
- Confirm open data context draws title, avatar/fallback, rank, total time, best lap, and empty state on sharedCanvas.
- Confirm malformed open data messages do not crash the open data context.
- Confirm interstitial ads only request after race finish, never during active driving.
- Confirm rewarded video can be configured later without blocking normal gameplay.
- Confirm missing optional Logo/icon/sfx files only show fallback warnings and do not block gameplay.
- Confirm selected track, per-track best lap, audio preference, minimap preference, operation coach preference, and control sensitivity persist after reload.
- Confirm no debug-only UI appears in release mode.
- Confirm commercialization launch checklist has owners and current go/no-go status.
- Confirm `docs/commercialization-asset-rights-register.md` records owner/source/license/proof for every release asset.
- Finish the configured target lap count on each selectable track and restart.
- Check FPS on low-end and mid-range devices.
- Check package size.
