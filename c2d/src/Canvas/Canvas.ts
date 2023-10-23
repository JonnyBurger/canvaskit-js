import { IndexedHostObject, type RenderingContext } from "../Constants";
import type { Drawable } from "../Drawable";
import { DrawableImage, DrawablePath } from "../Drawable";
import type { ImageFilter } from "../ImageFilter";
import { Paint } from "../Paint";
import type { Path } from "../Path";
import { SVGContext } from "../SVG";

interface CanvasContext {
  matrix: DOMMatrix;
  clip: Path | null;
  imageFilter: ImageFilter | null;
  renderingCtx: RenderingContext;
}

export class Canvas extends IndexedHostObject {
  private stack: CanvasContext[] = [];
  private svgCtx: SVGContext;

  constructor(renderingCtx: RenderingContext) {
    super("canvas");
    this.stack.push({
      matrix: new DOMMatrix(),
      clip: null,
      imageFilter: null,
      renderingCtx,
    });
    this.svgCtx = new SVGContext(this.id);
  }

  get ctx() {
    return this.stack[this.stack.length - 1];
  }

  save(imageFilter?: ImageFilter) {
    const isLayer = imageFilter !== undefined;
    this.stack.push({
      matrix: DOMMatrix.fromMatrix(this.ctx.matrix),
      clip: this.ctx.clip,
      imageFilter: imageFilter ?? null,
      renderingCtx: isLayer ? this.makeLayer() : this.ctx.renderingCtx,
    });
  }

  concat(matrix: DOMMatrix) {
    this.ctx.matrix.multiplySelf(matrix);
  }

  resetMatrix() {
    this.ctx.matrix = new DOMMatrix();
  }

  getMatrix() {
    return DOMMatrix.fromMatrix(this.ctx.matrix);
  }

  clip(path: Path) {
    this.ctx.clip = path;
    this.ctx.renderingCtx.clip(path.getPath2D(this.ctx.matrix));
  }

  restore() {
    const { imageFilter, renderingCtx } = this.ctx;
    this.stack.pop();
    if (imageFilter) {
      const paint = new Paint();
      paint.setImageFilter(imageFilter);
      paint.applyToContext(
        this.ctx.renderingCtx,
        this.svgCtx,
        new DOMMatrix(),
        new DrawableImage(
          renderingCtx instanceof OffscreenCanvasRenderingContext2D
            ? renderingCtx.canvas.transferToImageBitmap()
            : renderingCtx.canvas
        )
      );
    }
  }

  draw(drawable: Drawable, paint: Paint) {
    paint.applyToContext(
      this.ctx.renderingCtx,
      this.svgCtx,
      this.ctx.matrix,
      drawable
    );
  }

  drawPath(path: Path, paint: Paint) {
    paint.applyToContext(
      this.ctx.renderingCtx,
      this.svgCtx,
      this.ctx.matrix,
      new DrawablePath(path)
    );
  }

  private makeLayer() {
    const canvas = new OffscreenCanvas(
      this.ctx.renderingCtx.canvas.width,
      this.ctx.renderingCtx.canvas.height
    );
    const ctx = canvas.getContext("2d")!;
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }
    if (this.ctx.clip) {
      ctx.clip(this.ctx.clip.getPath2D(this.ctx.matrix));
    }
    ctx.drawImage(this.ctx.renderingCtx.canvas, 0, 0);
    return ctx;
  }
}
