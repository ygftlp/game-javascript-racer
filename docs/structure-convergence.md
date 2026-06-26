# Structure Convergence Notes

This document records the current architecture convergence decision for the v4 commercial scaffold.

## Decision

Do not move working runtime modules into nested folders yet.

The project now has a target structure, future directories, and validation scripts, but the actively loaded v4 modules stay in `js/v4/*.js` until browser validation is complete.

## Why

The current v4 entry uses plain script tags, not ES modules or a bundler. Moving files too early would increase risk without improving the commercial product yet.

The safer approach is:

1. Preserve the current working script order.
2. Add structure documentation.
3. Add future directories and resource-pack folders.
4. Add validation script and manual test checklist.
5. Browser-test the current PR.
6. Move modules only after the current entry is stable.

## Current runtime layout

```text
v4.final.html
  stats.js
  common.js
  js/v4/state.js
  js/v4/config.js
  js/v4/assets.js
  js/v4/background-map.js
  js/v4/sprite-map.js
  js/v4/platform.js
  js/v4/ads.js
  js/v4/analytics.js
  js/v4/save.js
  js/v4/app.js
  js/v4/hud.js
  js/v4/track.js
  js/v4/traffic.js
  js/v4/renderer.js
  js/v4/input.js
  js/v4/tweak-ui.js
  js/v4/game.js
```

## Future directories reserved

```text
js/v4/scenes/
js/v4/ui/
js/v4/systems/
js/v4/integrations/
js/v4/content/
```

These directories are reserved for future migrations and currently contain README files only.

## Resource-pack layout reserved

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

After browser validation passes, the recommended next step is to introduce a scene manager while keeping old module paths stable:

```text
js/v4/scene.js
```

Only after that should HUD, menus, result screens, and mobile controls be moved or introduced under `js/v4/ui/`.
