import type { Texture } from '../engine';
import { RACER_UI_THEME } from './RacerUiTheme';

export interface RacerUiLogoOptions {
  title: string;
  subtitle: string;
  small: boolean;
  maxWidth: number;
  texture?: Texture | null;
}

export class RacerUiLogo {
  render(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, options: RacerUiLogoOptions): void {
    if (this.drawTextureLogo(ctx, centerX, centerY, options)) return;

    const theme = RACER_UI_THEME.brandLogo;
    const w = Math.min(options.maxWidth, options.small ? theme.smallWidth : theme.width);
    const h = options.small ? theme.smallHeight : theme.height;
    const x = centerX - w / 2;
    const y = centerY - h / 2;

    ctx.save();
    this.drawLogoPlate(ctx, x, y, w, h);
    this.drawSpeedStripes(ctx, x, y, w, h);
    this.drawBadge(ctx, x, y, h, options.small);
    this.drawLogoText(ctx, x, y, w, h, options);
    ctx.restore();
  }

  private drawTextureLogo(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, options: RacerUiLogoOptions): boolean {
    const texture = options.texture;
    if (!texture?.loaded) return false;

    const theme = RACER_UI_THEME.brandLogo;
    const maxW = Math.min(options.maxWidth, options.small ? theme.imageSmallMaxWidth : theme.imageMaxWidth);
    const maxH = options.small ? theme.imageSmallMaxHeight : theme.imageMaxHeight;
    const image = texture.image as unknown as CanvasImageSource;
    const sourceW = Math.max(1, Number(texture.image.width) || maxW);
    const sourceH = Math.max(1, Number(texture.image.height) || maxH);
    const scale = Math.min(maxW / sourceW, maxH / sourceH);
    const w = Math.max(1, Math.round(sourceW * scale));
    const h = Math.max(1, Math.round(sourceH * scale));
    const x = Math.round(centerX - w / 2);
    const y = Math.round(centerY - h / 2);

    try {
      ctx.save();
      ctx.shadowColor = theme.imageShadow;
      ctx.shadowBlur = theme.imageShadowBlur;
      ctx.shadowOffsetY = theme.imageShadowOffsetY;
      ctx.drawImage(image, x, y, w, h);
      ctx.restore();
      return true;
    } catch (error) {
      console.warn('[racer] brand logo draw failed, using procedural fallback', error);
      ctx.restore();
      return false;
    }
  }

  private drawLogoPlate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    const theme = RACER_UI_THEME.brandLogo;
    this.roundedRectPath(ctx, x + theme.shadowOffsetX, y + theme.shadowOffsetY, w, h, theme.radius);
    ctx.fillStyle = theme.shadow;
    ctx.fill();

    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, theme.plateTop);
    gradient.addColorStop(1, theme.plateBottom);
    this.roundedRectPath(ctx, x, y, w, h, theme.radius);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = theme.stroke;
    ctx.lineWidth = theme.strokeWidth;
    ctx.stroke();

    this.roundedRectPath(ctx, x + theme.innerInset, y + theme.innerInset, w - theme.innerInset * 2, h - theme.innerInset * 2, Math.max(4, theme.radius - theme.innerInset));
    ctx.strokeStyle = theme.innerStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawSpeedStripes(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    const theme = RACER_UI_THEME.brandLogo;
    ctx.save();
    this.roundedRectPath(ctx, x, y, w, h, theme.radius);
    ctx.clip();

    const stripeW = h * 0.18;
    for (let index = 0; index < 4; index += 1) {
      const sx = x + w - h * 0.95 + index * stripeW * 1.35;
      ctx.beginPath();
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx + stripeW, y + h);
      ctx.lineTo(sx + stripeW + h * 0.42, y);
      ctx.lineTo(sx + h * 0.42, y);
      ctx.closePath();
      ctx.fillStyle = index % 2 === 0 ? theme.stripePrimary : theme.stripeSecondary;
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, small: boolean): void {
    const theme = RACER_UI_THEME.brandLogo;
    const badgeR = small ? theme.badgeSmallRadius : theme.badgeRadius;
    const badgeX = x + badgeR + theme.badgeOffsetX;
    const badgeY = y + h / 2;

    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeFill;
    ctx.fill();
    ctx.strokeStyle = theme.badgeStroke;
    ctx.lineWidth = theme.strokeWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(badgeX - badgeR * 0.28, badgeY - badgeR * 0.5);
    ctx.lineTo(badgeX + badgeR * 0.5, badgeY);
    ctx.lineTo(badgeX - badgeR * 0.28, badgeY + badgeR * 0.5);
    ctx.closePath();
    ctx.fillStyle = theme.badgeIcon;
    ctx.fill();
  }

  private drawLogoText(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, options: RacerUiLogoOptions): void {
    const theme = RACER_UI_THEME.brandLogo;
    const titleSize = options.small ? theme.titleSmallSize : theme.titleSize;
    const subtitleSize = options.small ? theme.subtitleSmallSize : theme.subtitleSize;
    const textX = x + (options.small ? theme.textSmallX : theme.textX);
    const titleY = y + h / 2 - (options.small ? theme.titleSmallLift : theme.titleLift);
    const subtitleY = y + h / 2 + (options.small ? theme.subtitleSmallDrop : theme.subtitleDrop);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.lineWidth = theme.titleStrokeWidth;
    ctx.strokeStyle = theme.titleStroke;
    ctx.strokeText(options.title, textX, titleY);
    ctx.fillStyle = theme.titleFill;
    ctx.fillText(options.title, textX, titleY);

    ctx.font = `bold ${subtitleSize}px sans-serif`;
    ctx.fillStyle = theme.subtitleFill;
    ctx.fillText(options.subtitle, textX + theme.subtitleOffsetX, subtitleY);
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
