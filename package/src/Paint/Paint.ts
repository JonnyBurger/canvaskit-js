/* eslint-disable no-bitwise */
import type {
  ColorSpace,
  EmbindEnumEntity,
  Paint,
  PathEffect,
} from "canvaskit-wasm";

import { Paint as NativePaint } from "../c2d";
import type { InputColor } from "../Core";
import { StrokeJoin, StrokeCap, PaintStyle, nativeColor } from "../Core";
import type { ShaderJS } from "../Shader";
import type { ImageFilterJS } from "../ImageFilter";
import { HostObject } from "../HostObject";
import type { MaskFilterJS } from "../MaskFilter/MaskFilter";
import type { ColorFilterJS } from "../ColorFilter/ColorFilter";

import { nativeBlendMode } from "./BlendMode";

export class PaintJS extends HostObject<"Paint"> implements Paint {
  private color = Float32Array.of(0, 0, 0, 1);
  private colorFilter: ColorFilterJS | null = null;
  private imageFilter: ImageFilterJS | null = null;
  private maskFilter: MaskFilterJS | null = null;
  private blendMode: GlobalCompositeOperation | null = null;

  private paint = new NativePaint();

  constructor() {
    super("Paint");
  }

  getPaint() {
    return this.paint;
  }

  copy(): Paint {
    const { color, blendMode, imageFilter, colorFilter, maskFilter } = this;
    const paint = new PaintJS();
    paint.paint = this.paint.copy();
    if (color !== null) {
      paint.color = color;
    }
    paint.blendMode = blendMode;
    if (imageFilter) {
      paint.imageFilter = imageFilter;
    }
    if (colorFilter) {
      paint.colorFilter = colorFilter;
    }
    if (maskFilter) {
      paint.maskFilter = maskFilter;
    }
    return paint;
  }
  getColor() {
    return this.color;
  }
  getStrokeCap() {
    return lineCap(this.paint.getStrokeCap());
  }
  getStrokeJoin() {
    return lineJoin(this.paint.getStrokeJoin());
  }
  getStrokeMiter() {
    return this.paint.getStrokeMiter();
  }
  getStrokeWidth() {
    return this.paint.getStrokeWidth();
  }
  setAlphaf(alpha: number) {
    this.color[3] = alpha;
    this.paint.setColor(nativeColor(this.color));
  }
  setAntiAlias(_aa: boolean): void {}
  setBlendMode(mode: EmbindEnumEntity): void {
    this.blendMode = nativeBlendMode(mode);
  }
  setColor(color: InputColor, _colorSpace?: ColorSpace | undefined): void {
    if (color instanceof Float32Array) {
      this.color = color;
    } else {
      this.color = Float32Array.from(color);
    }
    this.paint.setColor(nativeColor(this.color));
  }
  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    _colorSpace?: ColorSpace | undefined
  ): void {
    this.color = new Float32Array([r, g, b, a]);
  }
  setColorFilter(filter: ColorFilterJS | null): void {
    this.colorFilter = filter;
  }
  setColorInt(colorInt: number, _colorSpace?: ColorSpace | undefined) {
    // Extract the color components
    let alpha = (colorInt >>> 24) & 255;
    let red = (colorInt >> 16) & 255;
    let green = (colorInt >> 8) & 255;
    let blue = colorInt & 255;

    // Normalize the color components to [0, 1]
    alpha /= 255;
    red /= 255;
    green /= 255;
    blue /= 255;
    this.setColor(Float32Array.of(red, green, blue, alpha));
  }
  setDither(_shouldDither: boolean): void {
    throw new Error("Method not implemented.");
  }
  setImageFilter(filter: ImageFilterJS | null): void {
    this.imageFilter = filter;
  }
  setMaskFilter(filter: MaskFilterJS | null): void {
    this.maskFilter = filter;
  }
  setPathEffect(_effect: PathEffect | null): void {
    throw new Error("Method not implemented.");
  }
  setShader(shader: ShaderJS | null): void {
    if (!shader) {
      throw new Error("Shader cannot be null");
    }
    this.paint.setShader(shader.getShader());
  }
  setStrokeCap(cap: EmbindEnumEntity): void {
    this.paint.setStrokeCap(nativeLineCap(cap));
  }
  setStrokeJoin(join: EmbindEnumEntity): void {
    this.paint.setStrokeJoin(nativeLineJoin(join));
  }
  setStrokeMiter(limit: number): void {
    this.paint.setStrokeMiter(limit);
  }
  setStrokeWidth(width: number): void {
    this.paint.setStrokeWidth(width);
  }
  setStyle(style: EmbindEnumEntity): void {
    this.paint.setStrokeStyle(style === PaintStyle.Stroke);
  }
}

const lineCap = (cap: CanvasLineCap) => {
  switch (cap) {
    case "butt":
      return StrokeCap.Butt;
    case "round":
      return StrokeCap.Round;
    case "square":
      return StrokeCap.Square;
    default:
      throw new Error(`Unknown line cap: ${cap}`);
  }
};

const nativeLineCap = (cap: EmbindEnumEntity) => {
  switch (cap.value) {
    case 0:
      return "butt";
    case 1:
      return "round";
    case 2:
      return "square";
    default:
      throw new Error(`Unknown line cap: ${cap.value}`);
  }
};

const lineJoin = (join: string) => {
  switch (join) {
    case "miter":
      return StrokeJoin.Miter;
    case "round":
      return StrokeJoin.Round;
    case "bevel":
      return StrokeJoin.Bevel;
    default:
      throw new Error(`Unknown line cap: ${join}`);
  }
};

const nativeLineJoin = (join: EmbindEnumEntity) => {
  switch (join.value) {
    case 0:
      return "miter";
    case 1:
      return "round";
    case 2:
      return "bevel";
    default:
      throw new Error(`Unknown line cap: ${join.value}`);
  }
};

// const resetCanvasContext = (ctx: CanvasRenderingContext2D) => {
//   ctx.globalAlpha = 1;
//   ctx.globalCompositeOperation = "source-over";
//   ctx.imageSmoothingEnabled = true;
//   ctx.imageSmoothingQuality = "low";
//   ctx.fillStyle = "#000000";
//   ctx.strokeStyle = "#000000";
//   ctx.lineWidth = 1;
//   ctx.lineCap = "butt";
//   ctx.lineJoin = "miter";
//   ctx.miterLimit = 10;
//   ctx.shadowBlur = 0;
//   ctx.shadowColor = "rgba(0, 0, 0, 0)";
//   ctx.shadowOffsetX = 0;
//   ctx.shadowOffsetY = 0;
//   ctx.setTransform(1, 0, 0, 1, 0, 0);
//   ctx.filter = "none";
//   ctx.font = "10px sans-serif";
//   ctx.textAlign = "start";
//   ctx.textBaseline = "alphabetic";
//   ctx.direction = "inherit";
// };
