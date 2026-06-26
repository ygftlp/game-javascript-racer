# Manual Runtime Test Checklist

Run these checks before marking the modularization PR ready for review or merging it.

## Local launch

Recommended launch options:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/v4.final.html
```

Opening the HTML file directly may still work, but a local static server is safer for browser asset loading behavior.

## Structure validation

Run:

```bash
node scripts/validate-v4-structure.mjs
```

Expected result:

```text
V4 structure validation passed.
```

## Boot checks

- `v4.final.html` loads without a blank screen.
- The canvas appears.
- The FPS counter appears.
- No fatal errors appear in the browser console.
- Background image loads.
- Sprite image loads.
- Music element exists and mute button still works.

## Controls

Keyboard:

- Arrow left/right steer the car.
- Arrow up accelerates.
- Arrow down brakes.
- `A` / `D` steer the car.
- `W` accelerates.
- `S` brakes.

## Gameplay

- Road renders correctly.
- Hills render correctly.
- Curves render correctly.
- Roadside sprites render correctly.
- NPC traffic renders correctly.
- NPC traffic moves.
- Collision with roadside objects slows/resets the player.
- Collision with traffic slows/resets the player.
- Driving off-road decelerates the player.
- Start/finish road colors render correctly.

## HUD and save

- Speed updates while driving.
- Current lap time updates.
- Last lap time appears after completing a lap.
- Fastest lap time is displayed.
- Fastest lap persists after refresh.
- Clearing local storage resets fastest lap to the configured default.

## Tweak UI

- Resolution selector resizes canvas.
- Lane selector changes lane count.
- Road width slider updates road width.
- Camera height slider updates camera perspective.
- Draw distance slider updates visible distance.
- Field of view slider updates perspective.
- Fog density slider updates fog intensity.

## Commercial no-op checks

With default config:

- Ads should not show.
- Analytics should not log unless explicitly configured.
- Asset pack should remain `legacy`.
- Game should not require a network SDK.
- Game should not require a build step.

## Asset-pack switch smoke test

Only run after commercial-safe replacement assets exist under `assets/packs/default/`.

1. Change `Racer.Config.assets.activePack` from `legacy` to `default`.
2. Open `v4.final.html`.
3. Verify background, sprites, and audio load from `assets/packs/default/`.
4. Verify sprite coordinates in `sprite-map.js` match the replacement atlas.
5. Verify background coordinates in `background-map.js` match the replacement atlas.

## Regression check for older demos

Because `common.js` is shared, also open:

```text
v1.straight.html
v2.curves.html
v3.hills.html
```

Confirm each page still loads and remains playable enough for comparison/demo purposes.
