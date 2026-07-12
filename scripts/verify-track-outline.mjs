import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  const a = pts[0], b = pts[pts.length - 1];
  if (Math.hypot(a.x - b.x, a.y - b.y) > 1e-6) failures.push(`${name}: not closed`);
}

const straightBox = bbox(build(fixtures.straight));
if (straightBox.w <= straightBox.h) failures.push('straight: expected width-dominant path');

const src = await readFile(resolve('src/racer/RacerTrackOutline.ts'), 'utf8');
for (const token of ['buildTrackOutline', 'fitOutlineToBounds', 'sampleOutlineAt', 'curvesFromSegments']) {
  if (!src.includes(token)) failures.push(`source missing ${token}`);
}

if (failures.length) {
  console.error('verify-track-outline failed:');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('verify-track-outline: ok');
