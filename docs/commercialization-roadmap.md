# Commercialization Roadmap

This roadmap turns the current technical migration into a staged commercial release path.

## Phase 0: Current foundation

Status: in progress.

Already available:

- WeChat mini game build path.
- Release/debug UI split.
- Dedicated settings screen.
- Dedicated track-select screen.
- Per-track best lap persistence.
- WeChat service adapter skeleton.
- Open data leaderboard protocol and sample Canvas renderer.
- Commercial asset pack switch script.
- Deployment guide.

Primary gap:

- The project still needs real commercial-safe assets, real WeChat platform configuration, and device validation.

## Phase 1: Commercial-safe content pack

Goal:

Replace all risky placeholder assets with commercial-safe content.

Owners:

- Art & Audio Production Agent
- Licensing & Compliance Agent
- Commercial QA Agent

Tasks:

1. Create final `assets/packs/default/images/background.png`.
2. Create final `assets/packs/default/images/sprites.png`.
3. Create final or approved fallback `assets/packs/default/images/ui/logo.png`.
4. Create final or approved fallback `assets/packs/default/images/ui/icons.png`.
5. Create licensed `assets/packs/default/audio/music/racer.mp3`.
6. Create optional licensed sfx files.
7. Update sprite atlas coordinates if needed.
8. Run commercial asset switch flow.

Exit criteria:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

## Phase 2: Gameplay and UX soft-launch tuning

Goal:

Make the game feel polished enough for real players.

Owners:

- Product & Gameplay Agent
- Commercial QA Agent
- UX / Visual Agent

Tasks:

1. Tune joystick and brake sizes on target devices.
2. Tune `舒适 / 标准 / 灵敏` sensitivity profiles.
3. Tune HUD and minimap opacity/readability.
4. Validate player car visibility through hills, turns, traffic, and collisions.
5. Tune every selectable track for fairness and readable curves.
6. Tune result screen replay/share/leaderboard hierarchy.

Exit criteria:

- first race can start without explanation
- controls feel acceptable on small and large devices
- no major UI overlap
- no debug UI in release mode
- each track can be completed reliably

## Phase 3: WeChat platform integration

Goal:

Enable share, leaderboard, analytics, and safe ad hooks.

Owners:

- Platform Integration Agent
- Growth & Publishing Agent
- LiveOps & Analytics Agent
- Monetization Strategy Agent

Tasks:

1. Configure `RacerWechatConfig.ts` through release-safe values.
2. Wire optional share image.
3. Copy open data samples into the open data context project.
4. Replace sample Canvas leaderboard theme/layout if needed.
5. Verify per-track leaderboard storage and display.
6. Verify analytics events.
7. Configure ad unit IDs only after policy and product review.
8. Confirm ads never appear during active driving.

Exit criteria:

- share works on device
- leaderboard renders per-track scores
- analytics events arrive
- ads are disabled or test-configured safely
- platform failure does not block gameplay

## Phase 4: Soft launch

Goal:

Release to a limited audience to measure fun, stability, and retention.

Owners:

- Commercialization Director
- Growth & Publishing Agent
- LiveOps & Analytics Agent
- Commercial QA Agent

Tasks:

1. Upload a soft-launch build.
2. Record version, branch, commit SHA, engine mode, and asset pack mode.
3. Collect first player feedback.
4. Review analytics daily.
5. Fix crash/performance/control issues before monetization expansion.

Soft-launch KPI gates:

- first race start rate is acceptable
- first race completion rate is acceptable
- second race start rate shows replay interest
- no high-frequency crash or input issue
- no severe device performance issue

## Phase 5: Monetization expansion

Goal:

Turn on monetization carefully after gameplay is validated.

Owners:

- Monetization Strategy Agent
- Product & Gameplay Agent
- Commercial QA Agent

Tasks:

1. Add interstitial cooldown rules.
2. Consider rewarded opt-in only for optional benefits.
3. Avoid pay-to-win leaderboard effects.
4. Measure retention before and after ad enablement.
5. Keep monetization entries optional and understandable.

Exit criteria:

- ads never appear while driving
- replay loop remains healthy
- no major retention drop after ads
- no player confusion around rewarded benefits

## Phase 6: Content expansion

Goal:

Extend lifespan after the first commercial release.

Owners:

- Product & Gameplay Agent
- Art & Audio Production Agent
- LiveOps & Analytics Agent
- Growth & Publishing Agent

Potential expansions:

- new track pack
- time-limited challenge track
- car skins
- seasonal visual theme
- weekly friend leaderboard challenge
- share-card refresh

Do not expand content until the first commercial build is stable.

## Release record template

```text
Version:
Date:
Branch:
Commit SHA:
Engine mode: compat / local SDK
Asset pack: legacy / commercial-template
Open data context version:
Ad config: disabled / test / production
Known risks:
QA owner:
Go/no-go decision:
```
