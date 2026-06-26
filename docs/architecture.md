# Architecture and Integration Plan

The commercial version should be built around a small set of stable boundaries instead of a large framework.

## Principles

- Keep the game playable as static HTML, CSS, JavaScript, images, and audio.
- Keep gameplay logic independent from platform SDKs.
- Keep commercial integrations behind adapters.
- Keep assets replaceable by switching packs and maps.
- Keep the first product small enough to ship.

## Layers

```text
HTML entry
  -> common engine helpers
  -> v4 configuration
  -> asset manifests and maps
  -> platform/commercial adapters
  -> app integration facade
  -> gameplay modules
```

## Runtime modules

### Core engine helpers

`common.js` provides low-level helpers that are shared by old demos and v4:

- DOM helpers,
- math helpers,
- game loop,
- image loading,
- key binding,
- canvas rendering helpers,
- legacy sprite/background constants.

Keep edits here minimal because v1, v2, and v3 still depend on it.

### v4 gameplay modules

- `state.js`: game state and derived speed values.
- `track.js`: road and scenery generation.
- `traffic.js`: NPC traffic and avoidance.
- `renderer.js`: canvas rendering orchestration.
- `input.js`: input bindings.
- `tweak-ui.js`: developer tuning controls.
- `hud.js`: HUD updates.
- `game.js`: v4 controller and game-loop binding.

### Asset layer

- `assets.js`: maps pack ids to concrete asset file paths.
- `background-map.js`: maps background atlas regions.
- `sprite-map.js`: maps sprite atlas regions and groups.

This allows future packs to provide different files and atlas coordinates without rewriting gameplay modules.

### Integration layer

- `platform.js`: portal/app/iframe lifecycle adapter.
- `ads.js`: ad placement adapter.
- `analytics.js`: event tracking adapter.
- `save.js`: local and future cloud-save adapter.
- `app.js`: one facade that coordinates these systems for the game controller.

`game.js` should talk to `App` where possible, instead of calling every commercial module directly.

## Lifecycle

Recommended lifecycle events:

```text
app_init
assets_ready
game_ready
gameplay_start
gameplay_stop
collision
lap_complete
new_fast_lap
result_screen
ad_requested
save_updated
```

## Future scene flow

The next gameplay shell should introduce a scene/state model:

```text
boot -> menu -> countdown -> playing -> paused -> result -> menu
```

This does not require a heavy framework. It can start as a small `scene.js` module that owns the current scene name and exposes `enter`, `leave`, and `update` hooks.

## Future build profiles

Use config-driven profiles before adding build tooling:

```text
standalone-web
portal-web
iframe-embed
mobile-web
app-wrapper
white-label-client
```

Each profile should configure platform, ads, analytics, asset pack, storage behavior, and branding.

## Recommended next modules

```text
js/v4/scene.js          Menu / playing / pause / result state machine
js/v4/mobile-input.js   Touch controls
js/v4/leaderboard.js    Local leaderboard first, platform leaderboard later
js/v4/skins.js          Vehicle and theme unlock configuration
js/v4/branding.js       Title, logo, CTA, sponsor billboard config
js/v4/privacy.js        Consent and privacy hooks for ads/analytics
```
