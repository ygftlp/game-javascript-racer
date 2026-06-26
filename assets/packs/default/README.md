# Default Asset Pack

This directory is reserved for the first commercial-safe replacement pack.

Do not copy the original demo music or placeholder sprites into a commercial build. Create or license original assets and place them in the folders below.

Expected files:

```text
images/background.png
images/sprites.png
audio/music/racer.ogg
audio/music/racer.mp3
```

Optional future folders:

```text
audio/sfx/
ui/
branding/
tracks/
skins/
```

After the files are added, switch `Racer.Config.assets.activePack` from `legacy` to `default` in `js/v4/config.js`.
