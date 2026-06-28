# Agent C: Art Replacement

## Mission

Replace legacy demo art with commercial-safe assets while preserving gameplay readability and atlas compatibility.

## Owns

- `assets/packs/default/images/`
- Source art files used to generate `background.png` and `sprites.png`

## Immediate tasks

1. Produce commercial-safe `assets/packs/default/images/background.png`.
2. Produce commercial-safe `assets/packs/default/images/sprites.png`.
3. Preserve frame names for player, traffic, billboards, plants, and props.
4. Keep player car anchors centered near the bottom.
5. Keep traffic car widths reasonable because widths affect collision feel.
6. Avoid real brands, trademarks, and unlicensed IP.

## Done when

- `npm run validate:assets` finds required commercial image files.
- The game is visually readable in WeChat DevTools.
- A full 3-lap race is playable without confusing sprite scale or anchors.
- Commercial usage rights are documented outside runtime source.
