# Asset Replacement Guide

This document splits the racer resources into stable categories so multiple contributors can replace art and audio without stepping on each other.

## Workstream ownership

Treat the migration as four focused agent lanes:

1. **Asset Taxonomy Agent**
   - Owns `src/racer/SpriteAtlas.ts` and `src/racer/RacerAssetManifest.ts`.
   - Keeps frame names, groups, and replacement categories stable.
   - Reviews whether a new atlas preserves required anchors and frame names.

2. **Art Production Agent**
   - Owns `assets/packs/default/images/` and source art files outside the runtime bundle.
   - Replaces legacy art with commercial-safe background and sprite atlas files.
   - Exports atlas PNGs at the expected paths.

3. **Audio Agent**
   - Owns `assets/packs/default/audio/`.
   - Replaces music and sound effects with licensed files.
   - Keeps mp3 versions for WeChat compatibility and package-size control.

4. **Integration QA Agent**
   - Owns WeChat DevTools and real-device verification.
   - Runs `npm run typecheck`, `npm run build:wx`, and manual race tests.
   - Tunes `src/racer/RacerTuning.ts` if new assets affect performance.

These are workflow roles, not background tasks. Each PR should state which lane it changes.

## Runtime asset packs

Runtime paths are centralized in `src/racer/RacerAssetManifest.ts`.

Current packs:

- `legacy`: points to the original `images/background.png`, `images/sprites.png`, and `music/racer.mp3`.
- `commercial-template`: points to `assets/packs/default/` and is intended for future commercial-safe replacements.

To switch the runtime pack, update `ACTIVE_RACER_ASSET_PACK` in `src/racer/RacerAssetManifest.ts` after the replacement files exist.

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

The runtime currently loads only background music. These files are placeholders for the next audio pass.

## Replacement checklist

Before switching to a new pack:

1. Replace images and audio in `assets/packs/default/`.
2. Update `src/racer/SpriteAtlas.ts` if atlas coordinates changed.
3. Set `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK`.
4. Run `npm run typecheck`.
5. Run `npm run build:wx`.
6. Open in WeChat DevTools.
7. Test menu, race start, steering, braking, collision, pause, finish, share placeholder, leaderboard placeholder.
8. Check real-device FPS and adjust `RacerTuning` if needed.
9. Confirm every asset has clear commercial usage rights.
