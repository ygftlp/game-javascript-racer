# Rendering

Rendering orchestration for v4.

```text
renderer.js  Uses common canvas helpers to draw background, road, sprites, traffic, and player vehicle.
```

Low-level canvas drawing helpers still live in `common.js` because older demos depend on them. V4-specific rendering coordination belongs here.
