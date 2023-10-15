import type { RenderingContext } from "../Constants";
import type { ImageFilter } from "../ImageFilter";
import type { Shader } from "../Shader";
import type { Drawable } from "../Drawable";
import type { SVGContext } from "../SVG";

export class Paint {
  private stroke?: boolean;
  private color?: string;
  private alpha?: number;
  private blendMode?: GlobalCompositeOperation;

  private lineWidth?: number;
  private lineCap?: CanvasLineCap;
  private lineJoin?: CanvasLineJoin;
  private miterLimit?: number;

  private shader?: Shader;
  private imageFilter?: ImageFilter;

  constructor() {}

  setColor(color: string) {
    this.color = color;
    return this;
  }

  setImageFilter(imageFilter: ImageFilter) {
    this.imageFilter = imageFilter;
    return this;
  }

  applyToContext(
    ctx: RenderingContext,
    svgCtx: SVGContext,
    ctm: DOMMatrix,
    drawable: Drawable
  ) {
    if (this.color && !this.stroke) {
      ctx.fillStyle = this.color;
    }
    if (this.color && this.stroke) {
      ctx.strokeStyle = this.color;
    }
    if (this.lineWidth) {
      ctx.lineWidth = this.lineWidth;
    }
    if (this.lineCap) {
      ctx.lineCap = this.lineCap;
    }
    if (this.lineJoin) {
      ctx.lineJoin = this.lineJoin;
    }
    if (this.miterLimit) {
      ctx.miterLimit = this.miterLimit;
    }
    if (this.alpha) {
      ctx.globalAlpha = this.alpha;
    }
    if (this.blendMode) {
      ctx.globalCompositeOperation = this.blendMode;
    }
    if (this.shader) {
      this.shader.applyToContext(ctx, ctm);
    }
    if (this.imageFilter) {
      const { id, filters } = this.imageFilter;
      const url = svgCtx.create(id, filters);
      ctx.filter = url;
    }
    drawable.draw(ctx, ctm, this.stroke);
  }
}
