# Commercialization Art & Audio Brief

This brief defines the production requirements for replacing the racer with commercial-safe art and audio.

It is owned by the Art & Audio Production Agent and reviewed by Licensing & Compliance, Product & Gameplay, UI/UX, and Commercial QA.

## Production goal

Create a coherent commercial-safe asset pack for the WeChat mini game that improves visual clarity, supports the current pseudo-3D racer renderer, and can be legally shipped and monetized.

## Source-of-truth files

- `src/racer/RacerAssetManifest.ts`
- `src/racer/SpriteAtlas.ts`
- `src/racer/RacerUiIconAtlas.ts`
- `docs/asset-replacement-guide.md`
- `docs/commercialization-asset-rights-register.md`
- `docs/commercialization-launch-checklist.md`

## Deliverable summary

Required for commercial release:

| Deliverable | Runtime path | Required | Notes |
|---|---|---:|---|
| Background atlas | `assets/packs/default/images/background.png` | yes | Sky, hills, tree line / environment background. |
| Sprite atlas | `assets/packs/default/images/sprites.png` | yes | Player car, traffic, roadside props, billboards, plants. |
| Background music | `assets/packs/default/audio/music/racer.mp3` | yes | Licensed or original loopable music. |

Optional but recommended:

| Deliverable | Runtime path | Required | Runtime fallback |
|---|---|---:|---|
| Brand logo | `assets/packs/default/images/ui/logo.png` | no | Programmatic logo fallback. |
| UI icon atlas | `assets/packs/default/images/ui/icons.png` | no | Programmatic icon fallback. |
| Engine loop sfx | `assets/packs/default/audio/sfx/engine-loop.mp3` | no | Silent / no optional sound. |
| Crash sfx | `assets/packs/default/audio/sfx/crash.mp3` | no | Silent / no optional sound. |
| Menu confirm sfx | `assets/packs/default/audio/sfx/menu-confirm.mp3` | no | Silent / no optional sound. |
| Share card image | private release path or configured URL | no | Text-only share. |

## Visual direction

Recommended style:

- arcade racing
- bright but readable
- retro-inspired without copying a specific legacy game
- fictional brands only
- high contrast between road, cars, hazards, and UI
- friendly enough for casual WeChat players

Avoid:

- real car manufacturer badges
- real sponsor logos
- real billboard ads
- copied sprites from existing games
- copyrighted music samples
- over-detailed sprites that become blurry at mobile scale
- low-contrast player car colors against the road

## Background atlas brief

Runtime path:

```text
assets/packs/default/images/background.png
```

Required: yes.

Must support these background concepts from the current atlas:

- sky
- distant hills / skyline
- tree line / environment band

Production requirements:

- horizontal coverage must avoid obvious seams during racing
- colors must keep the road and cars readable
- should work under the selected road theme fog color
- should not contain real logos or real-world restricted signage
- should remain crisp after WeChat package compression

Acceptance criteria:

- no visible hard seam during forward motion
- horizon remains readable on small devices
- does not visually compete with UI text
- passes license review in `docs/commercialization-asset-rights-register.md`

## Sprite atlas brief

Runtime path:

```text
assets/packs/default/images/sprites.png
```

Required: yes.

Must include or preserve equivalent frames for:

Player car:

- left
- straight
- right
- uphillLeft
- uphillStraight
- uphillRight

Traffic:

- car01
- car02
- car03
- car04
- semi
- truck

Roadside / environment:

- fictional billboards or route signs
- plants / trees / scenery
- collision-readable props such as rocks, posts, or stumps

Production requirements:

- keep player car anchor centered near the lower body
- keep traffic car widths close enough to current collision expectations, or flag for gameplay tuning
- keep obstacle visuals large enough to match collision feel
- avoid brand badges, real license plates, or copied car silhouettes that imply real manufacturers
- make player car readable on road, hills, fog, and curves
- maintain enough transparent padding to avoid sprite clipping

Acceptance criteria:

- player car remains visible through hills, turns, traffic, collisions, and lap wraparound
- traffic cars are readable before collision range
- roadside hazards match perceived collision width
- billboard art is fictional or licensed
- passes license review in `docs/commercialization-asset-rights-register.md`

## Brand logo brief

Runtime path:

```text
assets/packs/default/images/ui/logo.png
```

Required: no.

Recommended format:

- transparent PNG
- wide title-safe layout
- readable on dark / warm gradient backgrounds
- designed for mobile main menu title area
- should support the working Chinese name or final product name

Fallback:

If no final logo is available, the programmatic logo fallback can ship only if it is explicitly marked `fallback-approved` in `docs/commercialization-asset-rights-register.md`.

Acceptance criteria:

- readable on small and high-DPI devices
- no real trademarks
- no unlicensed font or logo elements
- does not reduce menu button touch comfort

## UI icon atlas brief

Runtime path:

```text
assets/packs/default/images/ui/icons.png
```

Required: no.

Recommended format:

- transparent PNG
- 4 columns x 3 rows
- each cell 64 x 64 px
- icon centered in the cell
- safe padding around the icon
- limited-color or high-contrast icon style

Frame order:

```text
row 1: play, track, leaderboard, help
row 2: settings, music, minimap, coach
row 3: sensitivity, reset, back, share
```

Fallback:

If no final icon atlas is available, the programmatic icon fallback can ship only if it is explicitly marked `fallback-approved` in `docs/commercialization-asset-rights-register.md`.

Acceptance criteria:

- every icon is understandable without reading long text
- icons remain readable at small button sizes
- atlas alignment matches `src/racer/RacerUiIconAtlas.ts`
- no copied icon set unless license allows commercial game redistribution

## Background music brief

Runtime path:

```text
assets/packs/default/audio/music/racer.mp3
```

Required: yes.

Creative direction:

- energetic arcade racing loop
- short-session friendly
- not too aggressive for casual WeChat play
- should not mask UI sfx if optional sfx are added

Technical requirements:

- mp3 format
- loopable or acceptable repeated playback
- normalized volume
- compressed for package size
- no copyrighted samples unless explicitly licensed

Acceptance criteria:

- license allows commercial use and WeChat package redistribution
- no copyright claim risk known at approval time
- acceptable loop behavior during multiple races
- package size remains acceptable

## Sound effects brief

Runtime paths:

```text
assets/packs/default/audio/sfx/engine-loop.mp3
assets/packs/default/audio/sfx/crash.mp3
assets/packs/default/audio/sfx/menu-confirm.mp3
```

Required: no.

Creative direction:

- engine loop should be subtle, not fatiguing
- crash sound should communicate impact without being harsh
- menu confirm should be short and polished

Technical requirements:

- mp3 format for WeChat compatibility
- small file size
- normalized volume
- optional files must not block gameplay if missing

Acceptance criteria:

- missing sfx produces only optional fallback behavior
- provided sfx are licensed for commercial distribution
- sounds do not drown out music or make replay annoying

## Share card image brief

Runtime/config path:

```text
release-private/share-card.png
```

or configured through `src/racer/RacerWechatConfig.ts` `share.imageUrl` in a private release process.

Required: no.

Creative direction:

- show speed, track, and friendly competition
- include final game name or approved fallback title
- avoid fake rewards or misleading claims
- avoid real brands or unlicensed logos

Acceptance criteria:

- commercial-safe image rights are recorded
- readable when displayed as a WeChat share card
- can be omitted if text-only share is approved as `fallback-approved`

## Source file expectations

Recommended source files should be stored outside the runtime bundle unless needed at runtime.

Suggested private/source structure:

```text
art-source/background/
art-source/sprites/
art-source/ui/logo/
art-source/ui/icons/
audio-source/music/
audio-source/sfx/
release-private/share-card.png
```

Do not commit private licensed source files if the license forbids redistribution. Record the proof location in `docs/commercialization-asset-rights-register.md` instead.

## Production handoff checklist

Before handing assets to integration:

- [ ] Required PNG and MP3 files are exported to the expected runtime paths.
- [ ] Sprite atlas frame positions are compatible with `SpriteAtlas.ts`, or required code changes are documented.
- [ ] UI icon atlas order matches `RacerUiIconAtlas.ts`.
- [ ] Asset source/license/proof fields are filled in `docs/commercialization-asset-rights-register.md`.
- [ ] Required assets are marked `candidate` or `approved`.
- [ ] Optional missing assets are marked for `fallback-approved` review.
- [ ] Package size impact is checked.
- [ ] Real-device screenshot/video review is scheduled.

## Integration checklist

After assets are copied:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

Then verify in WeChat DevTools and on device:

- [ ] background renders without seam or blur issues
- [ ] player car stays visible
- [ ] traffic and hazards are readable
- [ ] UI logo or fallback is readable
- [ ] UI icon atlas or fallback is readable
- [ ] music plays and loops acceptably
- [ ] optional sfx do not block gameplay if missing
- [ ] no release asset lacks license proof
