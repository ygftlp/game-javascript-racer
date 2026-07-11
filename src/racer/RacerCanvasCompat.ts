type RoundRectRadius = number | DOMPointInit | Array<number | DOMPointInit>;

type MutableCanvasContext = CanvasRenderingContext2D & {
  roundRect?: (x: number, y: number, width: number, height: number, radii?: RoundRectRadius) => CanvasRenderingContext2D;
};

function resolveRadius(radii: RoundRectRadius | undefined): number {
  if (typeof radii === 'number') return Math.max(0, radii);
  if (Array.isArray(radii)) {
    const first = radii[0];
    if (typeof first === 'number') return Math.max(0, first);
    return Math.max(0, Number(first?.x) || 0);
  }
  return Math.max(0, Number(radii?.x) || 0);
}

function roundRectFallback(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radii: RoundRectRadius = 0
): CanvasRenderingContext2D {
  const radius = Math.min(resolveRadius(radii), Math.abs(width) / 2, Math.abs(height) / 2);
  const right = x + width;
  const bottom = y + height;

  this.moveTo(x + radius, y);
  this.lineTo(right - radius, y);
  this.quadraticCurveTo(right, y, right, y + radius);
  this.lineTo(right, bottom - radius);
  this.quadraticCurveTo(right, bottom, right - radius, bottom);
  this.lineTo(x + radius, bottom);
  this.quadraticCurveTo(x, bottom, x, bottom - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  return this;
}

export function installRacerCanvasCompatibility(ctx: CanvasRenderingContext2D): void {
  const compatible = ctx as MutableCanvasContext;
  if (typeof compatible.roundRect === 'function') return;

  // Some WeChat Canvas contexts are native, non-extensible host objects. Assigning
  // a fallback method to them can throw before the first frame and leave a black
  // screen. All active racer UI paths already have local rounded-rectangle helpers,
  // so failure to install this optional compatibility method is safe.
  try {
    if (Object.isExtensible(compatible)) compatible.roundRect = roundRectFallback;
  } catch (error) {
    console.warn('[racer] Canvas context does not allow roundRect compatibility installation', error);
  }
}
