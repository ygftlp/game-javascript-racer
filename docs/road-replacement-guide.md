# Road Replacement Guide

This document explains how the current pseudo-3D road works and how to replace or upgrade it for a commercial release.

## Current road model

The current road is not a road texture image. It is a procedural pseudo-3D road rendered with Canvas polygons.

The road pipeline is:

1. `src/racer/config.ts` defines global road constants and shared track types.
2. `src/racer/RacerRoadTheme.ts` defines reusable road palettes.
3. `src/racer/RacerTrackDefinition.ts` defines the track registry, track sections, road theme, roadside theme, and target laps.
4. `src/racer/RacerState.ts` expands the selected track sections into many road segments and applies the selected track road theme.
5. `src/scenes/RacerScene.ts` owns the currently selected track and reads its `targetLaps` for race completion, HUD, help text, and result submission.
6. `src/racer/RacerSettings.ts` persists the selected track id so the next launch restores the same track.
7. `src/racer/RacerStorage.ts` stores best lap times per track id.
8. Each `Segment` stores `z1`, `z2`, `y1`, `y2`, `curve`, color, roadside sprites, and traffic cars.
9. `src/racer/Pseudo3DRenderer.ts` projects each segment into screen space.
10. `Pseudo3DRenderer.drawSegment()` draws grass, rumble strips, road surface, and lane markers as polygons.

## Current road constants

Defined in `src/racer/config.ts`:

```ts
export const RACER_CONFIG = {
  roadWidth: 2000,
  segmentLength: 200,
  rumbleLength: 3,
  lanes: 3,
  fieldOfView: 100,
  cameraHeight: 1000,
  drawDistance: 260,
  centrifugal: 0.3,
  maxSpeed: 9000
};
```

Important values:

- `roadWidth`: logical road width used for projection and car offset.
- `segmentLength`: length of one road segment in world units.
- `rumbleLength`: how often the road alternates light/dark strips.
- `lanes`: lane marker count.
- `drawDistance`: how many segments are projected and drawn.
- `centrifugal`: how strongly curves push the player outward.

## Current road theme

The default release road theme is referenced through `src/racer/RacerTrackDefinition.ts`:

```ts
export const ACTIVE_RACER_TRACK = DEFAULT_OUTRUN_TRACK;
```

The default track uses `COMMERCIAL_ASPHALT_ROAD_THEME`, defined in `src/racer/RacerRoadTheme.ts`.

`COMMERCIAL_ASPHALT_ROAD_THEME` uses:

- dark asphalt road colors,
- cleaner lane markers,
- red-white rumble strip alternation,
- darker start/finish treatment,
- matching fog color for distant segments.

`LEGACY_GREEN_ROAD_THEME` is kept for reference and regression comparison.

## Current track registry

`src/racer/RacerTrackDefinition.ts` now exposes a multi-track registry:

```ts
export const RACER_TRACKS = [
  DEFAULT_OUTRUN_TRACK,
  COAST_SPRINT_TRACK,
  CITY_NIGHT_TRACK
];
```

Current selectable tracks:

| Track | ID | Target laps | Roadside theme | Purpose |
|---|---|---:|---|---|
| 极速公路 | `default-outrun-loop` | 3 | `legacy` | Default balanced track |
| 海岸冲刺 | `coast-sprint` | 2 | `coast` | Short, fast mobile sprint |
| 城市夜跑 | `city-night-run` | 3 | `night` | Denser curve rhythm, future neon theme |

The menu uses the `切换赛道` button to cycle through this registry with `getNextRacerTrack()`.

The selected track id is persisted through `RacerSettings` under `racer.v4.selected_track_id` and restored by `RacerScene` using `findRacerTrackById()`.

Best lap records are stored per track id through `RacerStorage`, so a short sprint track does not overwrite the best lap display for a longer track.

## Current default track output

The default track is defined by `DEFAULT_OUTRUN_TRACK.sections` in `src/racer/RacerTrackDefinition.ts`:

| Section | Length segments | Curve | Hill | Meaning |
|---:|---:|---:|---:|---|
| 1 | 45 | 0 | 0 | Opening straight |
| 2 | 60 | 1.6 | 18 | Right curve, uphill |
| 3 | 45 | -2.2 | -8 | Left curve, slight downhill |
| 4 | 70 | 0.8 | 28 | Mild right curve, stronger uphill |
| 5 | 35 | 0 | -16 | Straight downhill |
| 6 | 80 | -2.8 | 4 | Strong left curve |
| 7 | 65 | 2.4 | -20 | Strong right curve, downhill |
| 8 | 90 | 0 | 0 | Long straight |
| 9 | 60 | -1.8 | 24 | Left curve, uphill |
| 10 | 70 | 2.6 | -28 | Strong right curve, downhill |
| 11 | 120 | 0 | 0 | Final straight |

Total segment count: `45 + 60 + 45 + 70 + 35 + 80 + 65 + 90 + 60 + 70 + 120 = 740`.

Total track length: `740 * RACER_CONFIG.segmentLength`, currently `148000` world units.

The default target lap count is `DEFAULT_OUTRUN_TRACK.targetLaps`, currently `3`.

## How segments are generated

`RacerState.resetRoad()` iterates the selected track sections.

For each section:

- `length` controls how many segments are generated.
- `curve` is copied to every segment inside the section.
- `hill` becomes a Y elevation delta over the section.
- `z1` / `z2` are generated from the segment index and `segmentLength`.
- `y1` / `y2` interpolate from section start height to section end height.
- `color` alternates between selected track road theme `light` and `dark` by segment index.

Start and finish colors are applied from the selected track `roadTheme.start` and `roadTheme.finish` after all segments are built.

## How target laps are used

`RacerScene` reads the selected track `targetLaps` as its source of truth.

This value controls:

- race finish condition,
- HUD lap counter,
- help screen objective text,
- result screen completed-laps display,
- leaderboard / share result payload.

Do not add a new hardcoded `TARGET_LAPS` constant in `RacerScene`. Change the track definition instead.

## How the road is drawn

`Pseudo3DRenderer.drawSegment()` draws four layers per segment:

1. Grass rectangle.
2. Rumble strip polygon.
3. Main road polygon.
4. Lane marker polygons.

Current draw order:

```ts
ctx.fillStyle = segment.color.grass;
ctx.fillRect(0, p2.y, state.width, p1.y - p2.y);

this.polygon(... segment.color.rumble);
this.polygon(... segment.color.road);

if (segment.color.lane) {
  this.polygon(... segment.color.lane);
}
```

Distant fog uses `state.activeTrack.roadTheme.fog`, so selected tracks can eventually have different fog palettes.

This means the road can be reskinned by changing a theme, but not by replacing one road image. Road shape is generated from segment projection.

## Replacement levels

### Level 1: Fast visual reskin

Use this when you only need the road to look less prototype-like.

Change:

- `src/racer/RacerRoadTheme.ts`
- `COMMERCIAL_ASPHALT_ROAD_THEME.light`
- `COMMERCIAL_ASPHALT_ROAD_THEME.dark`
- `COMMERCIAL_ASPHALT_ROAD_THEME.start`
- `COMMERCIAL_ASPHALT_ROAD_THEME.finish`
- `COMMERCIAL_ASPHALT_ROAD_THEME.fog`

Pros:

- Very low risk.
- No gameplay changes.
- No atlas work.

Cons:

- Still uses polygon road rendering, not textured asphalt.

### Level 2: Replace track layout and race length

Use this when you want a different course or different race duration.

Change the `sections` and `targetLaps` fields in `src/racer/RacerTrackDefinition.ts`:

```ts
export const DEFAULT_OUTRUN_TRACK: RacerTrackDefinition = {
  id: 'default-outrun-loop',
  name: '极速公路',
  roadTheme: COMMERCIAL_ASPHALT_ROAD_THEME,
  roadsideTheme: 'legacy',
  targetLaps: 3,
  sections: [
    { length: 80, curve: 0, hill: 0 },
    { length: 70, curve: 1.2, hill: 12 },
    { length: 55, curve: -2.0, hill: -10 },
    { length: 100, curve: 0, hill: 0 }
  ]
};
```

Rules:

- Positive `curve` means right curve.
- Negative `curve` means left curve.
- Larger absolute curve means sharper curve.
- Positive `hill` means uphill.
- Negative `hill` means downhill.
- Keep at least one long straight at the start for onboarding.
- Avoid too many strong curves before the player learns controls.
- Use lower `targetLaps` for long tracks and higher `targetLaps` for short tracks.

### Level 3: Add multiple tracks

Use this when the game needs track selection or themed stages.

Recommended pattern:

```ts
export const COAST_TRACK: RacerTrackDefinition = {
  id: 'coast-sprint',
  name: '海岸冲刺',
  roadTheme: COMMERCIAL_ASPHALT_ROAD_THEME,
  roadsideTheme: 'coast',
  targetLaps: 3,
  sections: [...]
};

export const RACER_TRACKS = [DEFAULT_OUTRUN_TRACK, COAST_TRACK];
```

`RacerScene` currently cycles through `RACER_TRACKS` from the menu and persists the selected track. Later this can become a dedicated track-select screen with locked/unlocked states.

### Level 4: Replace roadside art

Use this when you want a commercial road environment.

Change:

- `assets/packs/default/images/background.png`
- `assets/packs/default/images/sprites.png`
- `src/racer/SpriteAtlas.ts`
- `RacerState.resetRoadsideSprites()` placement rules

This changes trees, signs, buildings, mountains, sky, roadside props, and traffic visuals.

### Level 5: Add textured road support

Use this when you want asphalt texture, road cracks, lane arrows, neon strips, or theme-specific pavement.

Recommended implementation:

1. Keep segment projection the same.
2. Keep `drawSegment()` polygon shape calculation.
3. Add optional road texture strips inside the road polygon.
4. Use clipping if needed:
   - create road polygon path
   - `ctx.save()`
   - `ctx.clip()`
   - draw repeating asphalt strip or procedural noise
   - `ctx.restore()`
5. Keep fallback color rendering if texture is missing.

Do not replace the road with one large bitmap. It will not curve or scale correctly in a pseudo-3D renderer.

## Commercial replacement recommendation

For the next commercial pass, do this order:

1. Keep current procedural road math.
2. Continue tuning `RacerRoadTheme.ts` for stronger road readability.
3. Use `RacerTrackDefinition.ts` for new route layouts and target lap counts.
4. Replace background and roadside atlas art.
5. Tune `RACER_TRACKS` for smoother difficulty and better session length.
6. Only after this, consider textured asphalt.

## Files to edit by task

| Goal | File |
|---|---|
| Change road colors | `src/racer/RacerRoadTheme.ts` |
| Change curve/hill layout | `src/racer/RacerTrackDefinition.ts` / track `sections` |
| Change target lap count | `src/racer/RacerTrackDefinition.ts` / `targetLaps` |
| Add/remove selectable tracks | `src/racer/RacerTrackDefinition.ts` / `RACER_TRACKS` |
| Change active default track | `src/racer/RacerTrackDefinition.ts` / `ACTIVE_RACER_TRACK` |
| Change saved selected track | `src/racer/RacerSettings.ts` / `SELECTED_TRACK_ID_KEY` |
| Change best-lap persistence | `src/racer/RacerStorage.ts` / `bestLapKey(trackId)` |
| Change segment generation | `src/racer/RacerState.ts` |
| Change road drawing | `src/racer/Pseudo3DRenderer.ts` |
| Change background image atlas | `src/racer/SpriteAtlas.ts` |
| Change background art file | `assets/packs/default/images/background.png` |
| Change roadside props | `src/racer/SpriteAtlas.ts` + `RacerState.resetRoadsideSprites()` |
| Change minimap curve preview | `src/racer/RacerMiniMap.ts` |

## QA checklist after replacing roads

- Player car remains visible through hills and strong curves.
- Start line and finish strips still appear.
- Minimap curve preview matches the actual road direction.
- Traffic cars stay inside lanes visually.
- Roadside props do not overlap the road center.
- Rumble strip contrast is visible on low-brightness screens.
- Lane lines do not flicker on small screens.
- The new palette works with HUD and minimap contrast.
- Menu `切换赛道` cycles through every entry in `RACER_TRACKS`.
- Relaunch restores the last selected track.
- Each track shows its own best lap record.
- Race ends at the selected track configured `targetLaps` count.
- Help screen, HUD, result screen, share payload, and leaderboard payload all show the same selected track target lap count.
