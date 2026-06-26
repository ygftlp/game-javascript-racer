# Asset Replacement Plan

Commercialization requires assets to be replaceable without editing gameplay code. The v4 game now uses an asset manifest module so resource paths can be changed from one place.

## Current state

The original demo assets remain in the legacy directories:

```text
images/background.png
images/sprites.png
music/racer.ogg
music/racer.mp3
```

These paths are still supported by the `legacy` asset pack so the original demo can keep running.

## Commercial asset-pack structure

Use this structure for commercial-safe replacement assets:

```text
assets/
  packs/
    default/
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

## Required v4 files

### `images/background.png`

A single background atlas used by the pseudo-3D renderer.

It must contain the same logical layers unless the constants in `common.js` are updated:

- hills layer
- sky layer
- trees layer

### `images/sprites.png`

A single sprite atlas used for cars, player vehicle frames, roadside objects, billboards, trees, bushes, rocks, and obstacles.

The current sprite coordinates are defined in `common.js` under `SPRITES`. If the atlas layout changes, update those coordinate definitions or add a future skin/sprite-map module.

### `audio/music/racer.ogg` and `audio/music/racer.mp3`

Main looping music. Provide both formats for browser compatibility.

## Switching packs

The active pack is configured in `js/v4/config.js`:

```js
assets: {
  activePack: 'legacy'
}
```

Use `legacy` while testing the original demo assets. Use `default` after commercial replacement files exist:

```js
assets: {
  activePack: 'default'
}
```

## Manifest module

`js/v4/assets.js` maps each pack id to concrete paths. Add new packs there, for example:

```js
packs: {
  neon: {
    id: 'neon',
    images: {
      background: 'assets/packs/neon/images/background.png',
      sprites: 'assets/packs/neon/images/sprites.png'
    },
    audio: {
      musicOgg: 'assets/packs/neon/audio/music/racer.ogg',
      musicMp3: 'assets/packs/neon/audio/music/racer.mp3'
    }
  }
}
```

## Replacement checklist

- Replace all original sprites with original or properly licensed artwork.
- Replace background art with original or properly licensed artwork.
- Replace all music and sound effects with original or properly licensed audio.
- Keep source files outside the runtime bundle when possible, for example PSD, Aseprite, FL Studio, or Ableton project files.
- Document license, creator, source URL, purchase receipt, and usage rights for every asset.
- Test the game after each asset-pack switch.

## Future improvement

The next step should be moving `BACKGROUND` and `SPRITES` coordinate maps out of `common.js` into a dedicated `sprite-map.js` or `assets-map.js`. That will allow each asset pack to provide its own atlas layout without touching shared engine code.
