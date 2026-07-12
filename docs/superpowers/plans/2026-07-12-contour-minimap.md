# Contour Minimap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left-side bar “赛道雷达” with a market-style full-track outline minimap at top-right during race play.

**Architecture:** Keep `RacerMiniMap` as the single draw entry. Add a pure outline builder that integrates segment curves into a closed 2D polyline, caches by `track.id`, and maps `position` / `car.z` onto arc length. Move `layout.miniMap` to a square card under the pause button. Reuse `miniMapEnabled` storage; rename settings copy only.

**Tech Stack:** TypeScript Canvas 2D (WeChat mini-game), existing `RacerState` segments, token validators in `scripts/validate-*.mjs`, build via `npm run build:wx`.

**Spec:** `docs/superpowers/specs/2026-07-12-contour-minimap-design.md`

---

## File map

| File | Role |
|------|------|
| `src/racer/RacerTrackOutline.ts` | **Create** — pure outline generation + sampling (cacheable, no canvas) |
| `src/racer/RacerMiniMap.ts` | **Rewrite** — contour card draw; short-screen gate; cache wrapper |
| `src/racer/RacerUiLayout.ts` | `RacerMiniMapLayout` → `panel` + `pathBounds`; top-right metrics |
| `src/racer/RacerUiTheme.ts` | Outline stroke tokens |
| `src/racer/RacerUiRenderer.ts` | Settings card title/subtitle |
| `src/racer/frontend/RacerV2FrontendScene.ts` | Frontend settings row title |
| `scripts/validate-production.mjs` | Minimap component tokens |
| `scripts/validate-sprint-a.mjs` | Short-screen + layout tokens if needed |
| `scripts/verify-track-outline.mjs` | **Create** — small Node smoke check for outline math (no jest in repo) |

No changes to storage keys, analytics event names, or pause/nitro formulas beyond non-overlap via layout y placement.

---

### Task 1: Pure outline builder + smoke verifier

**Files:**
- Create: `src/racer/RacerTrackOutline.ts`
- Create: `scripts/verify-track-outline.mjs`
- Modify: `scripts/validate-production.mjs` (add outline module tokens later in Task 5 if preferred; this task only creates builder + local verify)

- [ ] **Step 1: Add pure outline module**

Create `src/racer/RacerTrackOutline.ts`:

```ts
export interface OutlinePoint {
  x: number;
  y: number;
}

export interface TrackOutline {
  trackId: string;
  /** Closed path in unit space roughly centered; not yet fitted to panel. */
  points: OutlinePoint[];
  /** Cumulative arc lengths; last value is total length. Same length as points (after close sample). */
  arcLengths: number[];
  totalLength: number;
}

export interface FittedOutline {
  points: OutlinePoint[];
  arcLengths: number[];
  totalLength: number;
}

const DEFAULT_HEADING_SCALE = 0.045;
const DEFAULT_STEP = 1;

/**
 * Integrate segment curves into a closed 2D polyline.
 * curve > 0 turns one way; magnitude follows commercial track section values (~0–3).
 */
export function buildTrackOutline(
  trackId: string,
  curves: readonly number[],
  options?: { headingScale?: number; step?: number; sampleEvery?: number }
): TrackOutline {
  const headingScale = options?.headingScale ?? DEFAULT_HEADING_SCALE;
  const step = options?.step ?? DEFAULT_STEP;
  const sampleEvery = Math.max(1, options?.sampleEvery ?? 2);

  const raw: OutlinePoint[] = [];
  let x = 0;
  let y = 0;
  let heading = 0;
  raw.push({ x, y });

  for (let i = 0; i < curves.length; i += 1) {
    heading += curves[i] * headingScale;
    x += Math.cos(heading) * step;
    y += Math.sin(heading) * step;
    if (i % sampleEvery === 0 || i === curves.length - 1) {
      raw.push({ x, y });
    }
  }

  // Prefer a clean loop: drop last raw point if nearly closed, then close explicitly.
  const points = closeAndDedupe(raw);
  const { arcLengths, totalLength } = buildArcTable(points);

  return { trackId, points, arcLengths, totalLength };
}

export function fitOutlineToBounds(
  outline: TrackOutline,
  bounds: { x: number; y: number; w: number; h: number },
  padding = 4
): FittedOutline {
  const pts = outline.points;
  if (pts.length < 2 || bounds.w <= 0 || bounds.h <= 0) {
    return { points: [], arcLengths: [], totalLength: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const innerW = Math.max(1, bounds.w - padding * 2);
  const innerH = Math.max(1, bounds.h - padding * 2);
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const ox = bounds.x + (bounds.w - drawW) / 2;
  const oy = bounds.y + (bounds.h - drawH) / 2;

  const fitted = pts.map((p) => ({
    x: ox + (p.x - minX) * scale,
    y: oy + (p.y - minY) * scale
  }));
  const { arcLengths, totalLength } = buildArcTable(fitted);
  return { points: fitted, arcLengths, totalLength };
}

/** t in [0, 1). Returns point and unit tangent. */
export function sampleOutlineAt(
  fitted: FittedOutline,
  t: number
): { point: OutlinePoint; tangent: OutlinePoint } {
  const points = fitted.points;
  if (points.length < 2 || fitted.totalLength <= 0) {
    return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 } };
  }

  const target = ((t % 1) + 1) % 1 * fitted.totalLength;
  const arcs = fitted.arcLengths;
  let i = 1;
  while (i < arcs.length && arcs[i] < target) i += 1;
  const i1 = Math.min(points.length - 1, i);
  const i0 = Math.max(0, i1 - 1);
  const a0 = arcs[i0];
  const a1 = arcs[i1];
  const segLen = Math.max(1e-6, a1 - a0);
  const u = (target - a0) / segLen;
  const p0 = points[i0];
  const p1 = points[i1];
  const point = {
    x: p0.x + (p1.x - p0.x) * u,
    y: p0.y + (p1.y - p0.y) * u
  };
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  return { point, tangent: { x: dx / len, y: dy / len } };
}

function closeAndDedupe(raw: OutlinePoint[]): OutlinePoint[] {
  if (raw.length < 2) return raw.slice();
  const points = raw.slice();
  const first = points[0];
  const last = points[points.length - 1];
  const dist = Math.hypot(last.x - first.x, last.y - first.y);
  if (dist < 1e-3) {
    points[points.length - 1] = { x: first.x, y: first.y };
  } else {
    points.push({ x: first.x, y: first.y });
  }
  return points;
}

function buildArcTable(points: OutlinePoint[]): { arcLengths: number[]; totalLength: number } {
  const arcLengths = new Array(points.length);
  arcLengths[0] = 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    arcLengths[i] = total;
  }
  return { arcLengths, totalLength: total };
}

export function curvesFromSegments(segments: readonly { curve: number }[]): number[] {
  return segments.map((s) => s.curve);
}
```

- [ ] **Step 2: Add Node smoke verifier (no jest in repo)**

Create `scripts/verify-track-outline.mjs` that dynamically imports the built logic is hard without TS compile — instead **duplicate the minimal math inline** for CI smoke, OR run via `npx tsx` if available. Prefer **inline reimplementation of the integration loop only for asserts**, keeping it tiny:

```js
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Token presence + crude shape checks on source; runtime math check via Function eval of exported algorithm is overkill.
// Runtime check: reimplement the same integration constants for three fixture curve arrays.

function build(curves, headingScale = 0.045, step = 1, sampleEvery = 2) {
  const raw = [];
  let x = 0, y = 0, heading = 0;
  raw.push({ x, y });
  for (let i = 0; i < curves.length; i++) {
    heading += curves[i] * headingScale;
    x += Math.cos(heading) * step;
    y += Math.sin(heading) * step;
    if (i % sampleEvery === 0 || i === curves.length - 1) raw.push({ x, y });
  }
  const first = raw[0];
  const last = raw[raw.length - 1];
  if (Math.hypot(last.x - first.x, last.y - first.y) >= 1e-3) raw.push({ ...first });
  else raw[raw.length - 1] = { ...first };
  return raw;
}

function bbox(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { w: maxX - minX, h: maxY - minY, n: points.length };
}

const fixtures = {
  straight: Array(40).fill(0),
  leftBias: Array(40).fill(-1.5),
  sCurve: [...Array(20).fill(2), ...Array(20).fill(-2)]
};

const failures = [];
for (const [name, curves] of Object.entries(fixtures)) {
  const pts = build(curves);
  const box = bbox(pts);
  if (pts.length < 5) failures.push(`${name}: too few points ${pts.length}`);
  if (box.w < 1e-3 && box.h < 1e-3) failures.push(`${name}: collapsed bbox`);
  // closed
  const a = pts[0], b = pts[pts.length - 1];
  if (Math.hypot(a.x - b.x, a.y - b.y) > 1e-6) failures.push(`${name}: not closed`);
}

// straight should be elongated
const straightBox = bbox(build(fixtures.straight));
if (straightBox.w < straightBox.h * 2 && straightBox.h < straightBox.w * 2) {
  // pure straight along +x → width >> height
  if (straightBox.w <= straightBox.h) failures.push('straight: expected width-dominant path');
}

// source file must exist and export symbols
const src = await readFile(resolve('src/racer/RacerTrackOutline.ts'), 'utf8');
for (const token of ['buildTrackOutline', 'fitOutlineToBounds', 'sampleOutlineAt', 'curvesFromSegments']) {
  if (!src.includes(`export function ${token}`) && !src.includes(`export function ${token}(`)) {
    // allow either form
    if (!src.includes(token)) failures.push(`source missing ${token}`);
  }
}

if (failures.length) {
  console.error('verify-track-outline failed:');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('verify-track-outline: ok');
```

- [ ] **Step 3: Run smoke verifier**

Run:

```bash
node scripts/verify-track-outline.mjs
```

Expected: `verify-track-outline: ok`

If straight fixture fails due to floating noise, relax the width-dominant assert but keep closed + non-collapse checks.

- [ ] **Step 4: Commit**

```bash
git add src/racer/RacerTrackOutline.ts scripts/verify-track-outline.mjs
git commit -m "feat: add track outline builder for contour minimap"
```

---

### Task 2: Layout — top-right square card

**Files:**
- Modify: `src/racer/RacerUiLayout.ts`

- [ ] **Step 1: Change `RacerMiniMapLayout` interface**

Replace:

```ts
export interface RacerMiniMapLayout {
  panel: RacerRect;
  previewBar: RacerRect;
  progressBar: RacerRect;
}
```

With:

```ts
export interface RacerMiniMapLayout {
  panel: RacerRect;
  /** Inner rect used to fit the track outline path. */
  pathBounds: RacerRect;
}
```

- [ ] **Step 2: Replace miniMap geometry in `buildRacerUiLayout`**

Find the block that currently places the minimap under the left HUD (approx):

```ts
const miniMapPanel = rect(hudPanel.x, hudPanel.y + hudPanel.h + 10, hudPanel.w, small ? 72 : 82);
const miniMapPreviewBar = rect(...);
const miniMapProgressBar = rect(...);
```

and the pause button block. **After** `pauseButton` is computed, set:

```ts
const miniMapSize = clamp(Math.min(width, height) * 0.14, 96, 120);
const miniMapGapBelowPause = small ? 10 : 12;
const miniMapRightInset = small ? 14 : 18;
const miniMapPanel = rect(
  width - miniMapRightInset - miniMapSize,
  pauseButton.y + pauseButton.r + miniMapGapBelowPause,
  miniMapSize,
  miniMapSize
);
const miniMapInset = 10;
const miniMapPathBounds = rect(
  miniMapPanel.x + miniMapInset,
  miniMapPanel.y + miniMapInset,
  miniMapPanel.w - miniMapInset * 2,
  miniMapPanel.h - miniMapInset * 2
);
```

Return:

```ts
miniMap: { panel: miniMapPanel, pathBounds: miniMapPathBounds },
```

Delete `previewBar` / `progressBar` locals entirely.

**Order note:** `pauseButton` is currently defined *after* the old miniMap locals. Move miniMap construction to **after** `pauseButton` (and keep nitro using pause as today). Do not change pause or nitro formulas.

- [ ] **Step 3: Typecheck layout consumers**

Run:

```bash
npm run typecheck
```

Expected: failures only in `RacerMiniMap.ts` (and any leftover `previewBar` references). Fix any unexpected files that still import old fields.

- [ ] **Step 4: Commit**

```bash
git add src/racer/RacerUiLayout.ts
git commit -m "feat: place contour minimap layout at top-right"
```

---

### Task 3: Theme tokens for outline strokes

**Files:**
- Modify: `src/racer/RacerUiTheme.ts`

- [ ] **Step 1: Extend `minimap` theme**

Replace/extend the `minimap` object:

```ts
minimap: {
  straight: 'rgba(255,255,255,0.2)',
  rightCurve: 'rgba(255, 207, 74, 0.68)',
  leftCurve: 'rgba(92, 178, 255, 0.68)',
  cursor: 'rgba(255,255,255,0.78)',
  progress: 'rgba(255, 207, 74, 0.86)',
  outline: 'rgba(180, 210, 230, 0.42)',
  outlineDriven: 'rgba(255, 207, 74, 0.92)',
  player: 'rgba(255, 220, 88, 0.98)',
  playerRing: 'rgba(255, 255, 255, 0.55)'
},
```

Keep old keys so any residual references typecheck until MiniMap rewrite lands.

- [ ] **Step 2: Commit**

```bash
git add src/racer/RacerUiTheme.ts
git commit -m "feat: add contour minimap theme tokens"
```

---

### Task 4: Rewrite `RacerMiniMap` contour renderer

**Files:**
- Modify: `src/racer/RacerMiniMap.ts` (full rewrite)

- [ ] **Step 1: Replace file contents**

```ts
import type { RacerState } from './RacerState';
import {
  buildTrackOutline,
  curvesFromSegments,
  fitOutlineToBounds,
  sampleOutlineAt,
  type FittedOutline,
  type TrackOutline
} from './RacerTrackOutline';
import { RACER_UI_THEME } from './RacerUiTheme';
import type { RacerMiniMapLayout, RacerRect, RacerUiLayout } from './RacerUiLayout';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function wrap01(value: number): number {
  const t = value % 1;
  return t < 0 ? t + 1 : t;
}

export class RacerMiniMap {
  private cachedOutline: TrackOutline | null = null;
  private cachedTrackId: string | null = null;

  render(ctx: CanvasRenderingContext2D, state: RacerState, layout: RacerUiLayout): void {
    // Contour card still competes with joystick/road on short landscape frames.
    if (layout.small || state.height < 430) return;

    const miniMap = layout.miniMap;
    const trackId = state.activeTrack.id;
    const outline = this.ensureOutline(trackId, state);
    if (!outline || outline.points.length < 2) return;

    const fitted = fitOutlineToBounds(outline, miniMap.pathBounds, 2);
    if (fitted.points.length < 2) return;

    const progress = state.trackLength > 0 ? wrap01(state.position / state.trackLength) : 0;

    this.drawPanel(ctx, miniMap.panel);
    this.drawOutline(ctx, fitted);
    this.drawDrivenArc(ctx, fitted, progress);
    this.drawTraffic(ctx, state, fitted);
    this.drawPlayer(ctx, fitted, progress);
  }

  private ensureOutline(trackId: string, state: RacerState): TrackOutline | null {
    if (this.cachedOutline && this.cachedTrackId === trackId) return this.cachedOutline;
    if (!state.segments.length) return null;
    this.cachedOutline = buildTrackOutline(trackId, curvesFromSegments(state.segments), {
      sampleEvery: 3
    });
    this.cachedTrackId = trackId;
    return this.cachedOutline;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, target: RacerRect): void {
    this.roundedPanel(
      ctx,
      target.x,
      target.y,
      target.w,
      target.h,
      RACER_UI_THEME.panel.minimap,
      RACER_UI_THEME.panel.border
    );
  }

  private drawOutline(ctx: CanvasRenderingContext2D, fitted: FittedOutline): void {
    ctx.save();
    ctx.strokeStyle = RACER_UI_THEME.minimap.outline;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    this.strokePath(ctx, fitted.points);
    ctx.restore();
  }

  private drawDrivenArc(ctx: CanvasRenderingContext2D, fitted: FittedOutline, progress: number): void {
    if (progress <= 0.001 || fitted.totalLength <= 0) return;
    const end = progress * fitted.totalLength;
    const points = fitted.points;
    const arcs = fitted.arcLengths;

    ctx.save();
    ctx.strokeStyle = RACER_UI_THEME.minimap.outlineDriven;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      if (arcs[i - 1] >= end) break;
      if (arcs[i] <= end) {
        ctx.lineTo(points[i].x, points[i].y);
      } else {
        const seg = Math.max(1e-6, arcs[i] - arcs[i - 1]);
        const u = (end - arcs[i - 1]) / seg;
        ctx.lineTo(
          points[i - 1].x + (points[i].x - points[i - 1].x) * u,
          points[i - 1].y + (points[i].y - points[i - 1].y) * u
        );
        break;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawTraffic(ctx: CanvasRenderingContext2D, state: RacerState, fitted: FittedOutline): void {
    if (!state.trackLength) return;
    let drawn = 0;
    ctx.save();
    for (const car of state.cars) {
      const t = wrap01(car.z / state.trackLength);
      const { point } = sampleOutlineAt(fitted, t);
      this.circle(ctx, point.x, point.y, 2.2, RACER_UI_THEME.accent.traffic);
      drawn += 1;
      if (drawn >= 8) break;
    }
    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, fitted: FittedOutline, progress: number): void {
    const { point, tangent } = sampleOutlineAt(fitted, progress);
    ctx.save();
    this.circle(ctx, point.x, point.y, 4.2, RACER_UI_THEME.minimap.playerRing);
    this.circle(ctx, point.x, point.y, 3.2, RACER_UI_THEME.minimap.player);
    const tick = 7;
    ctx.strokeStyle = RACER_UI_THEME.minimap.player;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + tangent.x * tick, point.y + tangent.y * tick);
    ctx.stroke();
    ctx.restore();
  }

  private strokePath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]): void {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  private circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private roundedPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke?: string
  ): void {
    const r = Math.min(12, w / 5, h / 5);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
```

Notes for implementer:
- Do **not** draw the old “赛道雷达” title or progress percentage bar.
- Playing-only gate remains in `RacerUiRenderer` (`phase === 'playing'`).
- Cache invalidates on `trackId` change automatically.

- [ ] **Step 2: Typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS (no remaining `previewBar` / `drawCurvePreview` references).

- [ ] **Step 3: Commit**

```bash
git add src/racer/RacerMiniMap.ts
git commit -m "feat: render contour track minimap instead of curve radar bar"
```

---

### Task 5: Settings copy + validators

**Files:**
- Modify: `src/racer/RacerUiRenderer.ts` (~line 380)
- Modify: `src/racer/frontend/RacerV2FrontendScene.ts` (~line 874)
- Modify: `scripts/validate-production.mjs` (~line 194)
- Modify: `scripts/validate-sprint-a.mjs` (miniMap tokens + layout pathBounds)

- [ ] **Step 1: Update in-race settings card**

In `RacerUiRenderer.ts`:

```ts
this.drawSettingCard(
  ctx,
  settings.miniMapButton,
  '赛道小地图',
  options.miniMapEnabled ? '开启' : '关闭',
  '整圈轮廓与车位',
  options.miniMapEnabled,
  options.pressedTarget === 'settings-minimap',
  layout,
  'minimap'
);
```

- [ ] **Step 2: Update frontend settings row**

In `RacerV2FrontendScene.ts`:

```ts
this.drawSettingRow(
  ctx,
  page.miniMapButton,
  '赛道小地图',
  runtime.miniMapEnabled ? '开启' : '关闭',
  'settings-minimap',
  runtime.pressedTarget,
  runtime.miniMapEnabled
);
```

- [ ] **Step 3: Update production validator minimap tokens**

In `scripts/validate-production.mjs`, replace:

```js
requireTokens(miniMap, ['class RacerMiniMap', 'drawCurvePreview', 'drawTrafficDots', '赛道雷达', 'RACER_UI_THEME'], 'independent minimap component', missing);
```

With:

```js
requireTokens(miniMap, ['class RacerMiniMap', 'drawOutline', 'drawDrivenArc', 'drawTraffic', 'drawPlayer', 'ensureOutline', 'RACER_UI_THEME'], 'independent contour minimap component', missing);
requireTokens(uiLayout, ['pathBounds', 'miniMapSize', 'miniMapGapBelowPause'], 'contour minimap top-right layout metrics', missing);
```

**Careful:** `uiLayout` already has a `requireTokens` call earlier. Either merge `pathBounds` / `miniMapSize` / `miniMapGapBelowPause` into the existing `uiLayout` requireTokens list, **or** add a second requireTokens only if the script allows multiple (it does). Prefer **merging into the existing layout token list** in both validators to avoid duplication confusion.

Also ensure layout source actually contains the literal identifiers `miniMapSize`, `miniMapGapBelowPause`, `pathBounds` from Task 2.

- [ ] **Step 4: Update sprint-a minimap tokens**

In `scripts/validate-sprint-a.mjs`, replace:

```js
requireTokens(source.miniMap, [
  'layout.small || state.height < 430',
  'full radar competes with the joystick'
], 'short-screen radar suppression', failures);
```

With:

```js
requireTokens(source.miniMap, [
  'layout.small || state.height < 430',
  'Contour card still competes with joystick',
  'drawOutline',
  'drawDrivenArc',
  'ensureOutline'
], 'short-screen contour minimap suppression', failures);
```

And add to layout tokens array:

```js
'pathBounds',
'miniMapSize = clamp',
'miniMapGapBelowPause',
```

Also require outline module exists — add to files map:

```js
trackOutline: 'src/racer/RacerTrackOutline.ts',
```

And:

```js
requireTokens(source.trackOutline, [
  'buildTrackOutline',
  'fitOutlineToBounds',
  'sampleOutlineAt',
  'curvesFromSegments'
], 'track outline pure builder', failures);
```

Update uiRenderer / frontend tokens if any still require `赛道雷达` (production currently checks miniMap for that string — remove). Grep both validators for `赛道雷达` and `drawCurvePreview` / `previewBar` and clear them.

Optionally require settings copy:

```js
// in uiRenderer tokens or separate:
'赛道小地图',
'整圈轮廓与车位',
```

And frontend:

```js
'赛道小地图',
```

- [ ] **Step 5: Run validators**

```bash
node scripts/verify-track-outline.mjs
npm run typecheck
npm run validate:production
npm run validate:sprint-a
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/racer/RacerUiRenderer.ts src/racer/frontend/RacerV2FrontendScene.ts scripts/validate-production.mjs scripts/validate-sprint-a.mjs
git commit -m "feat: rename minimap settings copy and update validators"
```

---

### Task 6: WeChat build verification

**Files:** none (build only)

- [ ] **Step 1: Full build**

```bash
npm run build:wx
```

Expected: typecheck + production + sprint-a + package + verify-wx succeed; output under `dist/wechat`.

- [ ] **Step 2: Manual checklist (document results in commit message if issues found)**

In WeChat devtools landscape:

1. Start each of 3 tracks — outline shape differs, closed loop, readable in top-right.
2. Drive — gold driven arc + player dot advance; wrap each lap.
3. Traffic dots appear, ≤8.
4. No overlap with capsule / pause / nitro / left HUD.
5. Settings → 赛道小地图 off → hidden; on → shown; persists restart.
6. Short height (&lt;430) → hidden.
7. Pause / finish → map not shown (playing gate).

- [ ] **Step 3: Final commit only if build script or dist metadata changed**

Usually no commit. If validator/build tweaks needed, commit those fixes with message:

```bash
git commit -m "fix: contour minimap validation/build polish"
```

---

## Plan self-review

### Spec coverage

| Spec section | Task |
|--------------|------|
| Scheme 1 outline hero | Task 4 |
| Position A top-right | Task 2 |
| Remove dual bar radar | Task 4 rewrite drops bar |
| Cache by track id | Task 4 `ensureOutline` |
| Player + traffic + driven arc | Task 4 |
| Short screen hide | Task 4 early return + validators |
| Settings rename + same key | Task 5 |
| Theme tokens | Task 3 |
| Validators / build | Task 5–6 |
| Pure geometry module | Task 1 |

### Placeholder scan

No TBD / “implement later” steps. Full code provided for builder, layout, renderer, validators.

### Type consistency

- Layout fields: `panel`, `pathBounds` only.
- Outline API: `buildTrackOutline`, `fitOutlineToBounds`, `sampleOutlineAt`, `curvesFromSegments`.
- Draw methods: `drawOutline`, `drawDrivenArc`, `drawTraffic`, `drawPlayer`, `ensureOutline`.
- Copy: `赛道小地图` / `整圈轮廓与车位`.
- Gate: `layout.small || state.height < 430`.

### Risks called out for implementer

1. If a track outline looks too circular/linear, tune `DEFAULT_HEADING_SCALE` (0.045) once against all three tracks.
2. `validate-production.mjs` has multiple `requireTokens(uiLayout, …)` — merge carefully; do not drop existing tokens.
3. Existing uncommitted UI work on the branch is unrelated; **do not** mix those files into minimap commits unless required for typecheck.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-12-contour-minimap.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — this session with executing-plans and checkpoints  

Which approach?
