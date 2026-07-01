export type RacerUiIconName =
  | 'play'
  | 'track'
  | 'leaderboard'
  | 'help'
  | 'settings'
  | 'music'
  | 'minimap'
  | 'coach'
  | 'sensitivity'
  | 'reset'
  | 'back'
  | 'share';

export class RacerUiIcons {
  render(ctx: CanvasRenderingContext2D, icon: RacerUiIconName, x: number, y: number, size: number, color: string, accent = color): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (icon) {
      case 'play':
        this.play(ctx, size, color);
        break;
      case 'track':
        this.track(ctx, size, color, accent);
        break;
      case 'leaderboard':
        this.leaderboard(ctx, size, color, accent);
        break;
      case 'help':
        this.help(ctx, size, color);
        break;
      case 'settings':
        this.settings(ctx, size, color, accent);
        break;
      case 'music':
        this.music(ctx, size, color, accent);
        break;
      case 'minimap':
        this.minimap(ctx, size, color, accent);
        break;
      case 'coach':
        this.coach(ctx, size, color, accent);
        break;
      case 'sensitivity':
        this.sensitivity(ctx, size, color, accent);
        break;
      case 'reset':
        this.reset(ctx, size, color, accent);
        break;
      case 'back':
        this.back(ctx, size, color);
        break;
      case 'share':
        this.share(ctx, size, color, accent);
        break;
    }

    ctx.restore();
  }

  private play(ctx: CanvasRenderingContext2D, size: number, color: string): void {
    const r = size / 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 0.58);
    ctx.lineTo(r * 0.58, 0);
    ctx.lineTo(-r * 0.32, r * 0.58);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  private track(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.58);
    ctx.bezierCurveTo(-r * 0.72, r * 0.15, -r * 0.28, -r * 0.18, -r * 0.18, -r * 0.58);
    ctx.moveTo(r * 0.5, r * 0.58);
    ctx.bezierCurveTo(r * 0.72, r * 0.15, r * 0.28, -r * 0.18, r * 0.18, -r * 0.58);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(1.5, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.52);
    ctx.lineTo(0, r * 0.28);
    ctx.moveTo(0, r * 0.08);
    ctx.lineTo(0, -r * 0.14);
    ctx.moveTo(0, -r * 0.34);
    ctx.lineTo(0, -r * 0.56);
    ctx.stroke();
  }

  private leaderboard(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    const w = r * 0.35;
    this.bar(ctx, -w * 1.35, -r * 0.05, w, r * 0.65, color);
    this.bar(ctx, -w * 0.05, -r * 0.45, w, r * 1.05, accent);
    this.bar(ctx, w * 1.25, r * 0.12, w, r * 0.48, color);
  }

  private help(ctx: CanvasRenderingContext2D, size: number, color: string): void {
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `bold ${Math.round(size * 0.75)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText('?', 0, r * 0.04);
  }

  private settings(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.58, Math.sin(a) * r * 0.58);
      ctx.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
      ctx.stroke();
    }
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.47, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  }

  private music(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, -r * 0.58);
    ctx.lineTo(-r * 0.05, r * 0.25);
    ctx.moveTo(-r * 0.05, -r * 0.58);
    ctx.lineTo(r * 0.5, -r * 0.46);
    ctx.lineTo(r * 0.5, r * 0.08);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, r * 0.32, r * 0.24, r * 0.16, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.28, r * 0.14, r * 0.24, r * 0.16, -0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  private minimap(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    this.roundedRectPath(ctx, -r * 0.72, -r * 0.5, r * 1.44, r, r * 0.18);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(1.5, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.15);
    ctx.lineTo(-r * 0.22, -r * 0.12);
    ctx.lineTo(r * 0.04, r * 0.1);
    ctx.lineTo(r * 0.34, -r * 0.22);
    ctx.lineTo(r * 0.56, r * 0.02);
    ctx.stroke();
  }

  private coach(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    this.roundedRectPath(ctx, -r * 0.7, -r * 0.48, r * 1.4, r * 0.82, r * 0.16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.28, r * 0.34);
    ctx.lineTo(-r * 0.46, r * 0.62);
    ctx.lineTo(-r * 0.08, r * 0.36);
    ctx.stroke();
    ctx.fillStyle = accent;
    for (const x of [-0.34, 0, 0.34]) {
      ctx.beginPath();
      ctx.arc(r * x, -r * 0.08, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private sensitivity(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, r * 0.16, r * 0.68, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.16);
    ctx.lineTo(r * 0.48, -r * 0.28);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, r * 0.16, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  private reset(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, Math.PI * 0.15, Math.PI * 1.75);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, -r * 0.68);
    ctx.lineTo(r * 0.36, -r * 0.62);
    ctx.lineTo(r * 0.1, -r * 0.28);
    ctx.closePath();
    ctx.fill();
  }

  private back(ctx: CanvasRenderingContext2D, size: number, color: string): void {
    const r = size / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(r * 0.5, 0);
    ctx.lineTo(-r * 0.48, 0);
    ctx.moveTo(-r * 0.48, 0);
    ctx.lineTo(-r * 0.06, -r * 0.42);
    ctx.moveTo(-r * 0.48, 0);
    ctx.lineTo(-r * 0.06, r * 0.42);
    ctx.stroke();
  }

  private share(ctx: CanvasRenderingContext2D, size: number, color: string, accent: string): void {
    const r = size / 2;
    const points: Array<[number, number]> = [[-r * 0.48, r * 0.18], [r * 0.36, -r * 0.42], [r * 0.42, r * 0.45]];
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.stroke();
    ctx.fillStyle = accent;
    for (const [px, py] of points) {
      ctx.beginPath();
      ctx.arc(px, py, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string): void {
    ctx.fillStyle = fill;
    this.roundedRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.22);
    ctx.fill();
  }

  private roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
    const r = Math.min(radius, w / 2, h / 2);
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
  }
}
