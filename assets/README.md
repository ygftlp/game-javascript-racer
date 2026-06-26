# Assets

Commercial and replaceable game assets should live under `assets/packs/<pack-id>/`.

The original demo still uses the legacy `images/` and `music/` directories so the game remains playable while commercial-safe replacement assets are prepared.

Recommended structure:

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
      metadata.json
```

Use `js/v4/assets.js` as the manifest that maps a pack id to concrete file paths. Use `Racer.Config.assets.activePack` in `js/v4/config.js` to switch between packs.
