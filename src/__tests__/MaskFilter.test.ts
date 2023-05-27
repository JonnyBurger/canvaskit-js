import { checkImage, skia } from "./setup";

describe("MaskFilter", () => {
  it("Solid mask filter", async () => {
    const image = await skia.eval(({ CanvasKit, width, height, canvas }) => {
      const paint = new CanvasKit.Paint();
      paint.setBlendMode(CanvasKit.BlendMode.Multiply);
      paint.setMaskFilter(
        CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, 10, false)
      );
      const cyan = paint.copy();
      const r = 92;
      cyan.setColor(CanvasKit.CYAN);
      canvas.drawCircle(r, r, r, cyan);
      // Magenta Circle
      const magenta = paint.copy();
      magenta.setColor(CanvasKit.MAGENTA);
      canvas.drawCircle(width - r, r, r, magenta);
      // Yellow Circle
      const yellow = paint.copy();
      yellow.setColor(CanvasKit.YELLOW);
      canvas.drawCircle(width / 2, height - r, r, yellow);
    });

    checkImage(image, "snapshots/image-filters/solid-blur.png", {
      overwrite: true,
    });
  });
});
