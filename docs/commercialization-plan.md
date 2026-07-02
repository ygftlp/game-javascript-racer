# Game Commercialization Plan

This document is the business source of truth for turning the WeChat pseudo-3D racer into a commercially viable mini game.

## Commercial goal

Ship a small but polished arcade racing game that can be distributed through WeChat, tested with real players, monetized without damaging gameplay, and expanded through new tracks, events, cosmetics, and leaderboard competition.

## Product positioning

Working positioning:

```text
A lightweight retro arcade highway racer for quick WeChat play sessions.
```

Player promise:

- Start within seconds.
- Finish a short race quickly.
- Improve lap times and track mastery.
- Compete with friends by track.
- Replay because control feel, speed, and rankings are satisfying.

## Target audience

Primary audience:

- Casual WeChat players who like quick arcade games.
- Players who enjoy time-attack competition and friend rankings.
- Users looking for a low-friction racing game without heavy tutorials.

Secondary audience:

- Retro racing fans.
- Players who like small skill-based games.
- Users attracted by leaderboard challenges shared in chat groups.

## Commercial pillars

### 1. Commercial-safe ownership

The game must not depend on unlicensed legacy art, music, real car brands, real ads, or trademarks.

Commercial release requires:

- commercial-safe car art
- commercial-safe road/background art
- commercial-safe UI logo and icons
- commercial-safe music and sound effects
- written license/source record for every asset
- no real brands unless explicitly licensed

### 2. Fast playable loop

Commercial value depends on replay. The core loop should stay short:

```text
Open game -> choose track -> race -> see time/rank -> replay/share
```

Target session:

- first race starts within 10 seconds
- race duration stays short enough for mobile casual play
- result screen immediately offers replay, share, and leaderboard

### 3. Friend competition

Leaderboards should be track-specific. Every track is a separate competition board.

Required leaderboard metadata:

- `trackId`
- `trackName`
- `totalRaceTime`
- `bestLapTime`
- `updatedAt`

### 4. Respectful monetization

Monetization must never interrupt active driving.

Allowed patterns:

- interstitial only after race finish or safe menu transitions
- rewarded video only for explicit opt-in benefits
- cosmetic or unlock progression only if it does not create pay-to-win pressure
- share / ranking loops that are useful without feeling spammy

Not allowed:

- ads during active driving
- forced ads before the first play
- misleading rewards
- paid advantages that invalidate leaderboard fairness

### 5. Live operations after launch

The first commercial version should support small updates:

- new tracks
- weekly time trial focus track
- cosmetic car skins
- seasonal UI theme
- leaderboard reset windows if needed
- analytics-driven tuning

## Revenue model options

### Phase 1: Soft launch monetization

Use minimal monetization while validating retention and fun.

Recommended:

- no forced ad before first race
- optional interstitial after several completed races, not every race
- leaderboard and sharing fully available without payment
- collect analytics first

### Phase 2: Stable monetization

After retention is acceptable:

- interstitial after race finish with cooldown
- rewarded video for optional cosmetic unlock acceleration
- rewarded video for optional extra challenge ticket if future event mode exists
- branded fictional billboard art only if commercially safe

### Phase 3: Content expansion

After proving player interest:

- new track packs
- car skin collection
- limited-time challenge tracks
- friend-group ranking events
- potential sponsor integration only with explicit license and policy review

## Key performance indicators

Early product KPIs:

- first race start rate
- first race completion rate
- second race start rate
- average race restarts per session
- leaderboard open rate
- share tap rate
- per-track best lap improvement rate
- crash-free sessions
- average FPS on target devices

Monetization KPIs after soft launch:

- ad impression rate per session
- ad close / completion rate
- rewarded opt-in rate
- retention impact after ads are enabled
- share-to-open conversion

Quality KPIs:

- no missing required assets in commercial pack
- no debug UI in release mode
- no unlicensed art/audio in release bundle
- no ad shown during active driving
- no leaderboard cross-track score mixing

## Commercial milestones

### Milestone A: Commercial readiness foundation

Done when:

- commercial asset switch flow exists
- deployment guide exists
- WeChat service adapter skeleton exists
- open data leaderboard protocol and sample renderer exist
- production validation covers the release structure

### Milestone B: Asset-safe playable build

Done when:

- all required commercial pack files exist
- logo and icon atlas are either final or approved fallback
- music and sfx are licensed
- `npm run assets:commercial:apply` succeeds
- `npm run typecheck`, `npm run validate:production`, and `npm run build:wx` pass locally

### Milestone C: Platform-integrated test build

Done when:

- `RacerWechatConfig.ts` is configured through release-safe values
- share works in WeChat DevTools and on device
- open data leaderboard stores and renders per-track scores
- analytics events arrive as expected
- ads are disabled or test-configured safely

### Milestone D: Soft launch candidate

Done when:

- target devices are tested
- player car remains visible in all target scenarios
- controls feel acceptable on small and large screens
- selected track, best lap, settings, and control sensitivity persist
- no release blocker remains in the risk register

### Milestone E: First commercial launch

Done when:

- policy review is complete
- asset license register is complete
- package size and FPS are acceptable
- release notes and version record are written
- deployment checklist is completed

## Go / no-go rules

Do not launch if any of these are true:

- any required commercial asset is missing
- any legacy copyrighted placeholder art or unlicensed music remains in the release pack
- WeChat capsule overlaps a required button
- active driving can be interrupted by ads
- leaderboard mixes scores across tracks
- share or leaderboard failure blocks replay
- typecheck/build fails locally
- release package was not tested in WeChat DevTools

## Related docs

- `docs/commercialization-agent-workstreams.md`
- `docs/commercialization-roadmap.md`
- `docs/commercialization-risk-register.md`
- `docs/commercialization-launch-checklist.md`
- `docs/wechat-deployment-guide.md`
- `docs/asset-replacement-guide.md`
- `docs/open-data-leaderboard-protocol.md`
- `docs/commercial-ui-ux-plan.md`
- `docs/production-completion-plan.md`
