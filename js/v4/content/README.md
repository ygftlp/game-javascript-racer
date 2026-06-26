# Content

Content, configuration, and asset-map modules live here.

Current modules:

```text
config.js          Product, controls, platform, monetization, analytics, storage, and active asset-pack config.
assets.js          Asset-pack manifest and image/audio path resolution.
background-map.js  Background atlas coordinate maps per pack.
sprite-map.js      Sprite atlas coordinate maps and sprite groups per pack.
```

Planned modules:

```text
tracks.js
skins.js
themes.js
vehicles.js
billboards.js
daily-challenges.js
```

Use this folder for data-like configuration. Avoid adding rendering, gameplay loops, or platform SDK logic here.
