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
