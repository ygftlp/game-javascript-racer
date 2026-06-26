# Product Roadmap

This roadmap turns the pseudo-3D racer from a code demo into a reusable commercial game template.

## Product vision

Build a lightweight retro arcade racer that can ship as:

- a browser game,
- a branded campaign mini-game,
- a white-label racing template,
- a mobile web game,
- and later a wrapped mobile app.

The core product should stay simple: quick races, clear feedback, repeatable challenge, and easy asset replacement.

## Direction

Recommended positioning:

```text
Retro arcade racer + fastest-lap challenge + configurable skins and tracks
```

Avoid turning the first version into a full racing simulator. The engine is strongest as a fast-loading arcade experience.

## Phases

### Phase 1: Commercial-safe foundation

Goal: make the project safe to customize and publish.

- Modularize v4 gameplay code.
- Separate resource paths and asset packs.
- Add platform, ads, analytics, and save abstractions.
- Document licensing and asset replacement risks.
- Keep static HTML deployment working.
- Replace all non-commercial-safe art and audio before release.

### Phase 2: Playable product shell

Goal: make it feel like a finished mini-game.

- Add a start screen.
- Add a result screen.
- Add pause/resume flow.
- Add mobile touch controls.
- Add local best score and fastest-lap history.
- Add basic settings: mute, quality, controls.
- Add game state transitions: boot, menu, playing, paused, result.

### Phase 3: Replay value

Goal: improve retention and replayability.

- Add daily challenge.
- Add multiple track themes.
- Add unlockable car skins.
- Add difficulty presets.
- Add session stats.
- Add shareable result card.
- Add optional local leaderboard.

### Phase 4: Platform integrations

Goal: prepare distribution and monetization.

- Add portal SDK adapter.
- Add rewarded ad and interstitial placements.
- Add privacy and consent flow.
- Add cloud save adapter if the selected platform supports it.
- Add analytics adapter and event taxonomy.
- Add build profiles for standalone web, portal, iframe, and app wrapper.

### Phase 5: White-label template

Goal: make it easy to sell or reuse.

- Add theme packs.
- Add brand pack folders.
- Add sponsor billboard replacement.
- Add configurable title, logo, CTA, and external links.
- Add campaign mode and reward-code hooks.
- Add implementation guide for clients.

## MVP definition

The first commercial MVP is ready when:

- no original placeholder art/audio is used,
- the game starts from a menu,
- keyboard and mobile controls work,
- fastest lap persists,
- one commercial-safe asset pack is active,
- ads and analytics can be enabled by configuration but are off by default,
- attribution and privacy documents are ready,
- and the game can be hosted as static files.

## Non-goals for early versions

Avoid these until the core version is stable:

- multiplayer,
- complex vehicle physics,
- native app store payments,
- large account systems,
- heavy build tools,
- and a full backend dependency.
