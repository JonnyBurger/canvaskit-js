import type { RuntimeEffectContext } from "../RuntimeEffect";

import { ShaderJS } from "./Shader";

export class RuntimeEffectShader extends ShaderJS {
  constructor(private readonly ctx: RuntimeEffectContext) {
    super();
  }

  getTexture(width: number, height: number) {
    const { gl, canvas } = this.ctx;
    canvas.width = width;
    canvas.height = height;
    this.ctx.children.forEach(({ shader, location, index }) => {
      gl.activeTexture(gl[`TEXTURE${index}` as "TEXTURE0"]);
      // Upload the image into the texture
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        // TODO: remove hardcoding
        shader.getTexture(width, height)
      );
      // Use the texture
      gl.uniform1i(location, index);
    });
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return this.ctx.canvas;
  }
}