# Project Structure Plan

This document defines the current and target directory architecture for turning the v4 racer demo into a maintainable commercial game template.

The project still runs as static HTML, CSS, JavaScript, images, and audio. No bundler, ES module migration, package manager, or backend is required yet.

## Compatibility rule

Keep these existing entry points working until replacements are ready:

```text
index.html
v1.straight.html
v2.curves.html
v3.hills.html
v4.final.html
common.js
common.css
stats.js
images/
music/
```

`common.js` is shared by the older demo pages, so changes there must remain conservative.

## Current v4 runtime layout

```text
js/v4/
  core/
    state.js
    app.js
    game.js

  content/
    config.js
    assets.js
    background-map.js
    sprite-map.js
    README.md

  gameplay/
    track.js
    traffic.js
    README.md

  rendering/
    renderer.js
    README.md

  ui/
    hud.js
    input.js
    tweak-ui.js
    README.md

  integrations/
    platform.js
    ads.js
    analytics.js
    README.md

  systems/
    save.js
    README.md

  scenes/
    README.md
```

## Entry script order

`v4.final.html` loads v4 modules in this order:

```text
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

This order matters because modules share the global `Racer` namespace and still use plain browser scripts.

## Layer responsibilities

### Entry layer

```text
index.html
v4.final.html
common.css
```

Responsibilities:

- Load scripts in the correct order.
- Own static page structure.
- Avoid gameplay logic.
- Avoid platform-specific SDK code.

### Common engine layer

```text
common.js
stats.js
```

Responsibilities:

- DOM helpers.
- Math helpers.
- Game loop.
- Image loading.
- Key binding.
- Low-level canvas rendering helpers.
- Legacy sprite/background constants used by older demos.

Rules:

- Keep this layer generic.
- Do not add commercial product logic here.
- Be careful because v1, v2, and v3 still depend on it.

### V4 core layer

```text
js/v4/core/state.js
js/v4/core/app.js
js/v4/core/game.js
```

Responsibilities:

- Shared runtime state.
- Main game controller.
- Game-loop binding.
- Lifecycle bridge through `Racer.App`.

### V4 content layer

```text
js/v4/content/config.js
js/v4/content/assets.js
js/v4/content/background-map.js
js/v4/content/sprite-map.js
```

Responsibilities:

- Product settings.
- Active asset-pack configuration.
- Asset path resolution.
- Sprite/background atlas coordinates.
- Future tracks, skins, themes, vehicles, billboards, and daily challenges.

### V4 gameplay layer

```text
js/v4/gameplay/track.js
js/v4/gameplay/traffic.js
```

Responsibilities:

- Road generation.
- Scenery placement.
- NPC car generation.
- NPC traffic movement and avoidance.

### V4 rendering layer

```text
js/v4/rendering/renderer.js
```

Responsibilities:

- Coordinate background, road, sprites, traffic, and player rendering.
- Use low-level canvas helpers from `common.js`.

### V4 UI layer

```text
js/v4/ui/hud.js
js/v4/ui/input.js
js/v4/ui/tweak-ui.js
```

Responsibilities:

- HUD binding and updates.
- Keyboard / WASD input mapping.
- Developer tweak controls.
- Future menu, pause screen, result screen, settings screen, and mobile controls.

### V4 integrations layer

```text
js/v4/integrations/platform.js
js/v4/integrations/ads.js
js/v4/integrations/analytics.js
```

Responsibilities:

- Platform lifecycle abstraction.
- Ads abstraction.
- Analytics abstraction.
- Future portal/app-wrapper adapters.

Gameplay modules should communicate through `Racer.App`, not through provider-specific SDKs.

### V4 systems layer

```text
js/v4/systems/save.js
```

Responsibilities:

- Local save abstraction.
- Future leaderboard, progression, daily challenge, score, economy, and privacy systems.

### Asset layer

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

Responsibilities:

- Commercial-safe runtime assets.
- Pack-level images, audio, UI, branding, track data, and skin data.
- Documentation for source, license, and usage rights.

## Suggested future migration steps

### Step 1: Browser validate current reorganized v4

- Run `node scripts/validate-v4-structure.mjs`.
- Open `v4.final.html` through a local static server.
- Complete `docs/manual-test-checklist.md`.

### Step 2: Add scene system

Add:

```text
js/v4/scenes/scene.js
```

Introduce:

```text
boot -> menu -> countdown -> playing -> paused -> result
```

### Step 3: Add product UI

Add:

```text
js/v4/ui/menu.js
js/v4/ui/result-screen.js
js/v4/ui/settings-screen.js
js/v4/ui/mobile-controls.js
```

### Step 4: Add content configuration

Add:

```text
js/v4/content/tracks.js
js/v4/content/skins.js
js/v4/content/themes.js
```

### Step 5: Add platform adapters

Add provider adapters behind the existing integration interfaces:

```text
js/v4/integrations/standalone.js
js/v4/integrations/portal.js
js/v4/integrations/crazygames.js
```

## Naming rules

- Use lowercase kebab-case for filenames: `result-screen.js`.
- Keep runtime JS under `js/v4/` until there is a build step.
- Keep commercial-safe runtime assets under `assets/packs/<pack-id>/`.
- Keep docs under `docs/`.
- Keep old demo files until a replacement entry is tested.

## What not to do yet

Avoid these until the static v4 product is stable:

- Do not introduce a bundler.
- Do not migrate to ES modules yet.
- Do not add a backend dependency.
- Do not hard-code a single ad or platform provider.
