# Contour Minimap Design — 赛道轮廓小地图

**Date:** 2026-07-12  
**Status:** Approved for implementation planning  
**Product:** 极速公路 (WeChat mini-game racer)  
**Scope:** Replace the in-race bar-style “赛道雷达” with a market-style full-track outline minimap at top-right.

---

## 1. Goal

Give players a commercial, glanceable **whole-track outline** during race play:

- See the full lap shape (not only near-road curve slices).
- See own position along the loop.
- See nearby traffic as dots on the outline.
- Stay capsule-safe and non-blocking on WeChat landscape.

**Non-goals (this iteration):**

- Draggable / zoomable minimap
- Named corner labels on the map
- True top-down 3D projection
- Dual HUD (outline card + old left radar bar at once)
- Showing the minimap while paused or on finish/menu

---

## 2. Product decisions (locked)

| Decision | Choice |
|----------|--------|
| Visual style | Scheme 1 — pure track-outline hero card |
| Screen position | A — top-right |
| Near-road bar radar | Removed when outline is shown (no dual layer) |
| Settings toggle | Reuse existing `miniMapEnabled` / storage key `racer.v4.mini_map_enabled` |
| Default | On (unchanged) |
| Short / small screens | Hide when `layout.small \|\| height < 430` (same policy as current radar) |
| Pause / finish / menu | Do not draw |
| Click / hit target | None — display only |

---

## 3. Current state (baseline)

| Area | Today |
|------|--------|
| Renderer | `src/racer/RacerMiniMap.ts` — title “赛道雷达”, 9-slice curve preview bar, traffic dots on bar, progress strip |
| Layout | `layout.miniMap.panel` under left HUD (`hudPanel` below-left); `previewBar` + `progressBar` sub-rects |
| Gate | `RACER_UI_FLAGS.showMiniMap && options.miniMapEnabled`; early-return on short screens |
| Settings copy | “赛道雷达” / subtitle “弯道预告和车辆提示” (in-race settings + frontend settings row) |
| Data | `RacerState.segments[].curve`, `position`, `trackLength`, `cars[].z/offset`; tracks from `RacerTrackDefinition.sections` |

This is enough geometry to integrate heading from curves and produce a closed 2D polyline per track.

---

## 4. UX / visual design

### 4.1 Card chrome

- **Shape:** Rounded square card (not full-width bar).
- **Size:** Side length clamp roughly **96–120 px** from screen height/width (exact formula in layout section).
- **Fill / stroke:** Reuse `RACER_UI_THEME.panel.minimap` + `panel.border`; optional soft outer shadow consistent with HUD.
- **Title:** Optional compact label **「赛道」** or omit title to maximize path area. Prefer **no full “赛道雷达” title bar** — path is the hero. If a label is kept, 10–11px muted text at card top-left, single line.
- **Progress:** Prefer **gold stroke on the driven portion of the outline** over a separate bottom percentage bar. Optional tiny `%` or omit (progress already exists on center HUD bar).

### 4.2 Outline content

| Layer | Treatment |
|-------|-----------|
| Full loop (undriven) | Semi-transparent cool gray / cyan stroke, ~2px |
| Driven arc | Gold stroke (`accent.gold` / `minimap.progress`) from start → current position |
| Start marker | Small gap or short tick at lap origin |
| Player | Larger gold disc (~3.5–4.5px) + short heading tick along tangent |
| Traffic | Up to **6–8** red/coral dots (`accent.traffic`) mapped by `car.z` → arc length; skip self; prefer cars within one lap distance |

### 4.3 Hierarchy vs other HUD

- Left: existing HUD panel (speed / lap / time) unchanged.
- Center top: race progress bar unchanged.
- **Right top:** WeChat capsule (system) → **pause button** → **contour minimap below / inset of pause**, never overlapping capsule or pause hit circle.
- Right bottom: brake / nitro untouched.
- Left bottom: joystick untouched.

---

## 5. Layout metrics

### 5.1 Placement (top-right)

Relative to existing `pauseButton` in `buildRacerUiLayout`:

```text
pauseButton ≈ circle(width - r - 20, pauseSafeY + r, r)
  pauseSafeY = max(96, height * 0.17)
  r = small ? 24 : 28
```

Minimap panel:

```text
size = clamp(min(width, height) * 0.14, 96, 120)
gapBelowPause = 10–12
rightInset = 14–18

panel.w = panel.h = size
panel.x = width - rightInset - size
panel.y = pauseButton.y + pauseButton.r + gapBelowPause
```

**Collision rules:**

1. `panel` must not intersect pause circle expanded by ~8px padding.
2. On short wide screens where `panel.y + panel.h` would collide with nitro safe zone, **hide** (already covered by height &lt; 430 / small) rather than shrink below 96 unless validation forces a lower floor later.
3. Nitro layout already uses `nitroSafeTop = pauseButton.y + pauseButton.r + nitroRadius + 14`. Minimap sits between pause and nitro vertically on tall screens; if vertical stack is tight, hide minimap — do not move nitro.

### 5.2 Layout type shape

Replace bar-centric `RacerMiniMapLayout` with outline-centric fields:

```ts
export interface RacerMiniMapLayout {
  panel: RacerRect;
  /** Inner rect for path fit (panel inset ~10–12px). */
  pathBounds: RacerRect;
}
```

Remove `previewBar` and `progressBar` from the layout type once render no longer needs them. Update all consumers / validators that assert those keys.

### 5.3 Safe-area summary

| Constraint | Rule |
|------------|------|
| WeChat capsule | Pause already under capsule; minimap only under pause |
| Left notch (landscape home indicator strip) | Not relevant to top-right map |
| Thumb zones | Map is top-right, above nitro; not a touch target |

---

## 6. Data pipeline

### 6.1 Outline generation

**Input:** For the active track, either:

- `state.segments` (preferred at runtime — already expanded), or
- `track.sections` (same curves; fewer points, coarser).

**Algorithm (runtime cache):**

1. Sample points along the loop. Practical approach:
   - Walk segments (or every Nth segment) with cumulative heading:
     - `heading += segment.curve * headingScale`
     - `x += cos(heading) * step`
     - `y += sin(heading) * step`
   - `headingScale` chosen so commercial tracks produce a readable closed shape (tune once; document constant in code).
2. Close the path (append first point or force close stroke).
3. Compute bounding box; fit into `pathBounds` with uniform scale + padding; center the path.
4. Store:
   - `points: { x, y }[]` in panel/path space **or** unit-space + transform each frame (unit-space + layout transform is cleaner when panel moves).
   - Optional: cumulative arc-length table for mapping `position` / `car.z` → point index.

**Cache key:** `track.id` (or `trackLength` + section signature). Invalidate when track changes (race start / track select). Do **not** rebuild every frame.

### 6.2 Position mapping

- Player progress: `t = wrap(position / trackLength)` in `[0, 1)`.
- Sample outline at arc-length fraction `t` for player dot and driven stroke end.
- Player heading tick: tangent from neighboring outline points (or from integrated heading at that sample).
- Traffic: `tCar = wrap(car.z / trackLength)`; same sampling; draw up to 8 dots.

### 6.3 Where code lives

| Module | Responsibility |
|--------|----------------|
| `RacerMiniMap.ts` | Cache outline; draw panel, path, player, traffic; short-screen early return |
| `RacerUiLayout.ts` | Top-right `panel` + `pathBounds`; drop old bar rects |
| `RacerUiRenderer.ts` | Unchanged call site: `miniMap.render` when flag + enabled; ensure only during playing HUD path |
| `RacerUiTheme.ts` | Extend `minimap` tokens for outline stroke / driven stroke / player if needed; keep traffic accent |
| Settings UI | Rename labels (see §7); same toggle handler |
| `scripts/validate-sprint-a.mjs` | Tokens for layout fields / copy strings |

No new storage keys. No new analytics event names required (`minimap_toggle` remains valid).

---

## 7. Settings & copy

| Surface | Old | New |
|---------|-----|-----|
| Setting title | 赛道雷达 | **赛道小地图** |
| Setting subtitle (in-race card) | 弯道预告和车辆提示 | **整圈轮廓与车位** |
| Frontend settings row | 赛道雷达 | **赛道小地图** (same on/off) |
| In-map title (if any) | 赛道雷达 | Prefer none or **赛道** |

Storage / API remain `isMiniMapEnabled` / `setMiniMapEnabled` / `miniMapEnabled`.

---

## 8. Render lifecycle

```text
playing + showMiniMap + miniMapEnabled + !small + height >= 430
  → ensureOutlineCached(trackId, segments)
  → draw panel
  → draw full outline
  → draw driven gold arc
  → draw traffic dots
  → draw player marker
else
  → no-op
```

Paused / finished overlays continue to draw over the race; minimap is **not** drawn in those modes (same as “only when main playing HUD draws it” today via `RacerUiRenderer` playing branch).

---

## 9. Theme tokens

Reuse existing where possible. Suggested additions under `RACER_UI_THEME.minimap` (names illustrative):

| Token | Role |
|-------|------|
| `outline` | Full loop undriven stroke |
| `outlineDriven` | Driven gold stroke (or reuse `progress`) |
| `player` | Player disc (or reuse gold) |
| `traffic` | Already on `accent.traffic` |
| Deprecate for this UI | `straight` / `leftCurve` / `rightCurve` / bar `cursor` (may remain unused or removed if nothing else needs them) |

---

## 10. Validation & QA

### 10.1 Automated

- `npm run typecheck`
- `validate:sprint-a` / production validators: update string tokens (`赛道小地图`, layout keys `pathBounds` if asserted, remove obsolete `previewBar` assertions if present).
- `build:wx` → `verify:wx` → `dist/wechat`.

### 10.2 Manual (WeChat / landscape)

1. **Three tracks:** 极速公路 / 海岸冲刺 / 城市夜跑 — outlines distinguishable, closed loops, not a single blob.
2. **Player motion:** Dot advances along outline; completes full loop each lap without jumping backward (except lap wrap, which is expected).
3. **Traffic:** Dots appear on path; count capped; no crash with empty `cars`.
4. **Safe area:** No overlap with capsule, pause, nitro, left HUD, center progress.
5. **Toggle:** Settings off → gone; on → restored; persists after restart.
6. **Short screen:** height &lt; 430 or small layout → hidden.
7. **Pause / finish:** Map not shown (or not competing with modal).
8. **Performance:** Outline not rebuilt every frame; race stays smooth on mid WeChat devices.

### 10.3 Success criteria

1. Market-style outline readable at a glance on common 16:9 landscape mini-game sizes.
2. Self position and progress arc correct around the loop.
3. Top-right placement clear of WeChat capsule and pause.
4. Short screens do not crowd controls.
5. Settings toggle works with renamed copy; default on.

---

## 11. Implementation boundaries

**In scope**

- Rewrite `RacerMiniMap` render path to contour style.
- Move layout to top-right; reshape `RacerMiniMapLayout`.
- Theme / copy / validator token updates.
- Cache outline per track id.

**Out of scope**

- Home menu mock minimap
- Leaderboard integration
- New power-up markers on map
- Changing pause / nitro layout formulas beyond ensuring non-overlap with the new panel

**Risk notes**

- Curve integration scale is empirical: if a track looks too circular or too linear, adjust `headingScale` / sampling density once with visual check on all three tracks.
- Removing left radar may disappoint players who used near-road curve colors; mitigated by market outline popularity and settings description clarity.

---

## 12. File touch list

| File | Change |
|------|--------|
| `src/racer/RacerMiniMap.ts` | Contour render + cache |
| `src/racer/RacerUiLayout.ts` | Top-right panel + `pathBounds` |
| `src/racer/RacerUiTheme.ts` | Outline-related tokens |
| `src/racer/RacerUiRenderer.ts` | Settings card title/subtitle only if needed |
| `src/racer/frontend/RacerV2FrontendScene.ts` | Settings row title |
| `scripts/validate-sprint-a.mjs` (and related validators) | Tokens |
| Optional: small unit helper if outline math extracted | Same package, no new runtime service |

---

## 13. Spec self-review

| Check | Result |
|-------|--------|
| Placeholders | None (no TBD) |
| Consistency | Position A + Scheme 1 + single outline card throughout |
| Scope | Single feature; one implementation plan |
| Ambiguity resolved | Title optional but path-hero preferred; progress on outline not bar; hide on short screens; no pause display; reuse toggle key |

---

## 14. Next step

After user review of this file, create an implementation plan via writing-plans, then implement and verify with the build pipeline above.
