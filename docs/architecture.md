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
  -> v4 core runtime
  -> v4 content and asset maps
  -> v4 integrations and systems
  -> v4 UI, gameplay, and rendering
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

### V4 core layer

- `js/v4/core/state.js`: game state and derived speed values.
- `js/v4/core/app.js`: integration facade and lifecycle event bridge.
- `js/v4/core/game.js`: v4 controller and game-loop binding.

### V4 content layer

- `js/v4/content/config.js`: product, controls, platform, monetization, analytics, storage, and active asset-pack config.
- `js/v4/content/assets.js`: maps pack ids to concrete asset file paths.
- `js/v4/content/background-map.js`: maps background atlas regions.
- `js/v4/content/sprite-map.js`: maps sprite atlas regions and groups.

This allows future packs to provide different files and atlas coordinates without rewriting gameplay modules.

### V4 gameplay layer

- `js/v4/gameplay/track.js`: road and scenery generation.
- `js/v4/gameplay/traffic.js`: NPC traffic and avoidance.

### V4 rendering layer

- `js/v4/rendering/renderer.js`: canvas rendering orchestration.

### V4 UI layer

- `js/v4/ui/hud.js`: HUD updates.
- `js/v4/ui/input.js`: input bindings.
- `js/v4/ui/tweak-ui.js`: developer tuning controls.

### V4 integration layer

- `js/v4/integrations/platform.js`: portal/app/iframe lifecycle adapter.
- `js/v4/integrations/ads.js`: ad placement adapter.
- `js/v4/integrations/analytics.js`: event tracking adapter.

### V4 systems layer

- `js/v4/systems/save.js`: local and future cloud-save adapter.

`js/v4/core/game.js` should talk to `Racer.App` where possible, instead of calling every commercial module directly.

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

This does not require a heavy framework. It can start as a small `js/v4/scenes/scene.js` module that owns the current scene name and exposes `enter`, `leave`, and `update` hooks.

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
js/v4/scenes/scene.js              Menu / playing / pause / result state machine
js/v4/ui/mobile-controls.js        Touch controls
js/v4/systems/leaderboard.js       Local leaderboard first, platform leaderboard later
js/v4/content/skins.js             Vehicle and theme unlock configuration
js/v4/content/branding.js          Title, logo, CTA, sponsor billboard config
js/v4/systems/privacy.js           Consent and privacy hooks for ads/analytics
```
