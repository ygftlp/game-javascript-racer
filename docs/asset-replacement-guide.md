# Asset Replacement Guide

This document splits the racer resources into stable categories so multiple contributors can replace art and audio without stepping on each other.

## Workstream ownership

Treat the migration as five focused agent lanes:

1. **Asset Taxonomy Agent**
   - Owns `src/racer/SpriteAtlas.ts`, `src/racer/RacerUiIconAtlas.ts`, and `src/racer/RacerAssetManifest.ts`.
   - Keeps frame names, groups, UI asset paths, icon atlas frames, and replacement categories stable.
   - Reviews whether a new atlas preserves required anchors and frame names.

2. **Art Production Agent**
   - Owns `assets/packs/default/images/` and source art files outside the runtime bundle.
   - Replaces legacy art with commercial-safe background and sprite atlas files.
   - Exports atlas PNGs and UI PNGs at the expected paths.

3. **Brand UI Agent**
   - Owns `assets/packs/default/images/ui/logo.png`, `assets/packs/default/images/ui/icons.png`, and final UI source art.
   - Confirms the logo and icons remain readable in the main menu, settings, pause, help, result, and track-select screens on small and high-DPI screens.
   - Keeps the current programmatic Logo and programmatic icons as fallback when no commercial image is available.

4. **Audio Agent**
   - Owns `assets/packs/default/audio/`.
   - Replaces music and sound effects with licensed files.
   - Keeps mp3 versions for WeChat compatibility and package-size control.

5. **Integration QA Agent**
   - Owns WeChat DevTools and real-device verification.
   - Runs `npm run typecheck`, `npm run validate:production`, `npm run build:wx`, and manual race tests.
   - Tunes `src/racer/RacerTuning.ts` if new assets affect performance.

These are workflow roles, not background tasks. Each PR should state which lane it changes.

## Runtime asset packs

Runtime paths are centralized in `src/racer/RacerAssetManifest.ts`.

Current packs:

- `legacy`: points to the original `images/background.png`, `images/sprites.png`, and `music/racer.mp3`. It has no `brandLogo` or `uiIconAtlas`, so the main menu uses the programmatic Logo fallback and buttons use programmatic icon fallbacks.
- `commercial-template`: points to `assets/packs/default/` and is intended for future commercial-safe replacements, including optional `assets/packs/default/images/ui/logo.png` and `assets/packs/default/images/ui/icons.png`.

To switch the runtime pack manually, update `ACTIVE_RACER_ASSET_PACK` in `src/racer/RacerAssetManifest.ts` after the replacement files exist.

Preferred safe switch flow:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

- `npm run assets:commercial` checks required and optional commercial files without changing source.
- `npm run assets:commercial:apply` checks required files and switches `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` only when required files exist.
- `npm run assets:legacy:apply` switches back to `LEGACY_RACER_ASSET_PACK`.

Required files for the safe switch:

```text
assets/packs/default/images/background.png
assets/packs/default/images/sprites.png
assets/packs/default/audio/music/racer.mp3
```

Optional files with runtime fallbacks:

```text
assets/packs/default/images/ui/logo.png
assets/packs/default/images/ui/icons.png
assets/packs/default/audio/sfx/engine-loop.mp3
assets/packs/default/audio/sfx/crash.mp3
assets/packs/default/audio/sfx/menu-confirm.mp3
```

## Replacement categories

### `background.sky-hills-trees`

Source file expected by the template pack:

```text
assets/packs/default/images/background.png
```

The current atlas has three layers:

- `sky`
- `hills`
- `trees`

Keep the same layer names unless you also update `BACKGROUND_LAYERS` in `SpriteAtlas.ts`.

### `sprites.player-car`

Player frames:

- `left`
- `straight`
- `right`
- `uphillLeft`
- `uphillStraight`
- `uphillRight`

Keep visual anchors centered near the bottom of the car. Width changes affect perceived steering and collision feel.

### `sprites.traffic-cars`

Traffic frames:

- `car01`
- `car02`
- `car03`
- `car04`
- `semi`
- `truck`

Width is used for collision approximation. If replacements are much wider or narrower, test overtaking and traffic collision on device.

### `ui.brand-logo`

Optional commercial Logo path:

```text
assets/packs/default/images/ui/logo.png
```

Recommended format:

- transparent PNG
- designed for a wide title area
- readable at small mobile sizes
- avoids real brands, car manufacturers, or trademarks unless licensed

Runtime behavior:

- `RacerAssets` loads `images.brandLogo` as an optional texture.
- `RacerUiLogo` first tries to draw that texture.
- If the file is missing, still loading, or fails to draw, the menu automatically falls back to the current programmatic Logo.

### `ui.icons`

Optional commercial UI icon atlas path:

```text
assets/packs/default/images/ui/icons.png
```

Recommended format:

- transparent PNG
- 4 columns × 3 rows
- each cell is 64 × 64 px
- each icon centered in its cell with safe padding
- single-color or limited-palette artwork that reads well on gold and dark buttons

Atlas order in `src/racer/RacerUiIconAtlas.ts`:

```text
row 1: play, track, leaderboard, help
row 2: settings, music, minimap, coach
row 3: sensitivity, reset, back, share
```

Runtime behavior:

- `RacerAssets` loads `images.uiIconAtlas` as an optional texture.
- `RacerUiIcons` first tries to draw the matching frame from that texture.
- If the file is missing, still loading, or fails to draw, every button automatically falls back to the current programmatic icon.

### `sprites.roadside-billboards`

Billboard frames are non-critical visual dressing. They are safe to replace with:

- fictional ads
- route signs
- sponsor placeholders
- game branding

Do not use real logos or trademarks unless licensed.

### `sprites.roadside-plants`

Plant frames cover trees, bushes, cactus, and similar scenery. These should be visually readable at small sizes.

### `sprites.roadside-props`

Props include columns, stumps, and boulders. Some of these are used in roadside collision checks, so replacements should not be visually tiny if their collision width remains large.

### `audio.music`

Template path:

```text
assets/packs/default/audio/music/racer.mp3
```

Use licensed or original music only. Keep volume normalized because the runtime sets background music volume low.

### `audio.sfx`

Reserved paths:

```text
assets/packs/default/audio/sfx/engine-loop.mp3
assets/packs/default/audio/sfx/crash.mp3
assets/packs/default/audio/sfx/menu-confirm.mp3
```

The runtime loads these as optional sounds. Missing sound files must not block gameplay.

## Replacement checklist

Before switching to a new pack:

1. Replace images and audio in `assets/packs/default/`.
2. Add optional `assets/packs/default/images/ui/logo.png`, or verify the programmatic Logo fallback is acceptable.
3. Add optional `assets/packs/default/images/ui/icons.png`, or verify the programmatic icon fallback is acceptable.
4. Update `src/racer/SpriteAtlas.ts` if atlas coordinates changed.
5. Update `src/racer/RacerUiIconAtlas.ts` if the UI icon atlas grid changes.
6. Run `npm run assets:commercial` to check required and optional commercial files.
7. Run `npm run assets:commercial:apply` to safely switch to `COMMERCIAL_TEMPLATE_ASSET_PACK`.
8. Run `npm run typecheck`.
9. Run `npm run validate:production`.
10. Run `npm run build:wx`.
11. Open in WeChat DevTools.
12. Test menu logo, menu icons, settings icons, pause icons, help icons, result icons, race start, steering, braking, collision, pause, finish, share placeholder, leaderboard placeholder.
13. Check real-device FPS and adjust `RacerTuning` if needed.
14. Confirm every asset has clear commercial usage rights.
