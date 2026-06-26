# Project Structure Plan

This document defines the target directory architecture for turning the v4 racer demo into a maintainable commercial game template.

The current PR keeps the game runnable as static files. The directory plan below should guide future moves without forcing a risky large rewrite immediately.

## Current compatibility rule

Do not break these existing entry points until replacements are ready:

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

The commercial architecture should grow beside the legacy structure first, then migrate one layer at a time.

## Target top-level layout

```text
/
  index.html
  v1.straight.html
  v2.curves.html
  v3.hills.html
  v4.final.html

  common.js
  common.css
  stats.js

  js/
    v4/
      app.js
      config.js
      state.js
      game.js
      assets.js
      background-map.js
      sprite-map.js
      platform.js
      ads.js
      analytics.js
      save.js
      hud.js
      input.js
      tweak-ui.js
      renderer.js
      track.js
      traffic.js

      scenes/
      ui/
      systems/
      integrations/
      content/

  assets/
    packs/
      default/
        images/
        audio/
        ui/
        branding/
        tracks/
        skins/
        metadata.json

  docs/
    project-structure.md
    architecture.md
    roadmap.md
    commercialization.md
    assets.md
```

## Layer responsibilities

### Entry layer

Files:

```text
index.html
v4.final.html
common.css
```

Responsibility:

- Load scripts in the correct order.
- Own static page structure.
- Avoid gameplay logic.
- Avoid platform-specific SDK code.

Future direction:

- Add a dedicated production entry such as `play.html` or `game.html` after v4 stabilizes.
- Keep demo pages available for historical comparison.

### Common engine layer

Files:

```text
common.js
stats.js
```

Responsibility:

- Low-level DOM helpers.
- Math helpers.
- Game loop.
- Canvas rendering primitives.
- Image loading.
- Shared key helpers.

Rule:

- Keep this layer generic.
- Do not add commercial product logic here.
- Be careful because v1, v2, and v3 still depend on it.

### V4 app/integration layer

Files:

```text
js/v4/app.js
js/v4/platform.js
js/v4/ads.js
js/v4/analytics.js
js/v4/save.js
```

Responsibility:

- Coordinate external systems.
- Provide one stable facade for lifecycle events.
- Keep SDK-specific logic out of gameplay modules.

Future subdirectories:

```text
js/v4/integrations/
  crazygames.js
  poki.js
  standalone.js
  capacitor.js
```

### V4 configuration and content layer

Files:

```text
js/v4/config.js
js/v4/assets.js
js/v4/background-map.js
js/v4/sprite-map.js
```

Responsibility:

- Product settings.
- Asset-pack selection.
- Runtime asset paths.
- Sprite/background atlas coordinates.
- Future track/skin/theme configuration.

Future subdirectories:

```text
js/v4/content/
  tracks.js
  skins.js
  themes.js
  economy.js
  daily-challenges.js
```

### V4 gameplay layer

Files:

```text
js/v4/state.js
js/v4/game.js
js/v4/track.js
js/v4/traffic.js
js/v4/renderer.js
```

Responsibility:

- Core racing behavior.
- Road generation.
- Player/NPC interactions.
- Rendering orchestration.
- Game loop callbacks.

Rule:

- Gameplay should call `Racer.App` for commercial events.
- Gameplay should not know about concrete ad, analytics, or platform SDKs.

### V4 input/UI layer

Files:

```text
js/v4/input.js
js/v4/hud.js
js/v4/tweak-ui.js
```

Responsibility:

- Keyboard input.
- HUD updates.
- Developer tuning controls.

Future subdirectories:

```text
js/v4/ui/
  menu.js
  hud.js
  result-screen.js
  pause-screen.js
  settings-screen.js

js/v4/scenes/
  boot.js
  menu.js
  countdown.js
  playing.js
  paused.js
  result.js
```

### Asset layer

Files:

```text
assets/packs/default/
```

Responsibility:

- Commercial-safe runtime assets.
- Pack-level images, audio, UI, branding, track data, and skin data.
- Documentation for source, license, and usage rights.

Runtime pack structure:

```text
assets/packs/default/
  images/
    background.png
    sprites.png
  audio/
    music/
      racer.ogg
      racer.mp3
    sfx/
  ui/
  branding/
  tracks/
  skins/
  metadata.json
```

Keep source files outside the runtime bundle when possible, for example:

```text
assets-source/
  packs/default/
    aseprite/
    psd/
    audio-projects/
    licenses/
```

`assets-source/` is intentionally not added yet. Add it only when original source assets exist.

## Suggested future migration steps

### Step 1: Stabilize current PR

- Keep current flat `js/v4/*.js` loading order.
- Browser-test `v4.final.html`.
- Confirm legacy asset pack still works.

### Step 2: Add scene system

Add:

```text
js/v4/scenes/README.md
js/v4/scene.js
```

Introduce:

```text
boot -> menu -> countdown -> playing -> paused -> result
```

### Step 3: Move UI into `js/v4/ui/`

Move or wrap:

```text
hud.js
input.js
tweak-ui.js
```

Add:

```text
menu.js
result-screen.js
settings-screen.js
mobile-controls.js
```

### Step 4: Move commercial adapters into `js/v4/integrations/`

Keep current no-op modules as stable interfaces, then add provider adapters:

```text
js/v4/integrations/standalone.js
js/v4/integrations/portal.js
js/v4/integrations/crazygames.js
```

### Step 5: Add content configuration

Add:

```text
js/v4/content/tracks.js
js/v4/content/skins.js
js/v4/content/themes.js
```

This makes the game suitable for white-label and campaign builds.

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
- Do not move all legacy files at once.
- Do not add a backend dependency.
- Do not hard-code a single ad or platform provider.
