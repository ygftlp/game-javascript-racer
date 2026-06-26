# Structure Convergence Notes

This document records the current architecture convergence decision for the v4 commercial scaffold.

## Decision

The v4 runtime modules have now been moved into responsibility-based directories.

The project still uses plain script tags and static files. No bundler, ES module migration, package manager, or backend dependency has been introduced.

## Why this move is now acceptable

The target directories, resource-pack layout, integration facade, and structure validation script are already in place. Moving the files now improves maintainability while keeping runtime behavior close to the previous flat `js/v4/*.js` layout.

The migration rule is:

1. Move files by responsibility.
2. Keep module globals unchanged, for example `Racer.Track`, `Racer.Hud`, and `Racer.App`.
3. Update `v4.final.html` script paths only.
4. Avoid changing gameplay logic during the move.
5. Use `scripts/validate-v4-structure.mjs` to guard the new layout.
6. Browser-test before marking the PR ready.

## Current runtime layout

```text
v4.final.html
  stats.js
  common.js
  js/v4/core/state.js
  js/v4/content/config.js
  js/v4/content/assets.js
  js/v4/content/background-map.js
  js/v4/content/sprite-map.js
  js/v4/integrations/platform.js
  js/v4/integrations/ads.js
  js/v4/integrations/analytics.js
  js/v4/systems/save.js
  js/v4/core/app.js
  js/v4/ui/hud.js
  js/v4/gameplay/track.js
  js/v4/gameplay/traffic.js
  js/v4/rendering/renderer.js
  js/v4/ui/input.js
  js/v4/ui/tweak-ui.js
  js/v4/core/game.js
```

## Directory responsibilities

```text
js/v4/core/          App facade, shared state, and game controller.
js/v4/content/       Product config, asset manifest, and atlas maps.
js/v4/gameplay/      Track generation, traffic, and future driving rules.
js/v4/rendering/     Canvas rendering orchestration.
js/v4/ui/            HUD, input, tweak controls, and future menu/result UI.
js/v4/integrations/  Platform, ads, analytics, and future SDK adapters.
js/v4/systems/       Save system and future leaderboard/progression/privacy systems.
js/v4/scenes/        Reserved for future scene flow.
```

## Resource-pack layout

```text
assets/packs/default/
  images/
  audio/music/
  audio/sfx/
  ui/
  branding/
  tracks/
  skins/
```

These folders are placeholders for commercial-safe replacement assets.

## Validation

Run static structure validation:

```bash
node scripts/validate-v4-structure.mjs
```

Then complete the browser checklist in:

```text
docs/manual-test-checklist.md
```

## Next migration after validation

After browser validation passes, the recommended next step is to introduce a scene manager:

```text
js/v4/scenes/scene.js
```

The first scene flow should be:

```text
boot -> menu -> countdown -> playing -> paused -> result
```
