import type {
  RuntimeEffectFactory as CKRuntimeEffectFactory,
  InputMatrix,
  MallocObj,
  RuntimeEffect,
  Shader,
  SkSLUniform,
  TracedShader,
} from "canvaskit-wasm";

import { HostObject } from "./HostObject";
import { createContext } from "./Shaders";
import { normalizeArray } from "./Values";
import { ShaderLite } from "./Shader";

export interface RTContext {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  program: WebGLProgram;
}

interface UniformProcessingState {
  uniformIndex: number;
}

const processUniform = (
  ctx: RTContext,
  state: UniformProcessingState,
  uniforms: Float32Array,
  uniformInfo: WebGLActiveInfo,
  size: number,
  setter: (loc: WebGLUniformLocation | null, subarr: Float32Array) => void
) => {
  const { gl, program } = ctx;
  const { name } = uniformInfo;
  const location = gl.getUniformLocation(program, name);
  if (!location) {
    console.error("Could not find uniform location for " + name);
  }
  setter(
    gl.getUniformLocation(program, name),
    uniforms.subarray(
      state.uniformIndex,
      state.uniformIndex + size * uniformInfo.size
    )
  );
  state.uniformIndex += size;
};

class RuntimeEffectLite
  extends HostObject<RuntimeEffect>
  implements RuntimeEffect
{
  constructor(private readonly ctx: RTContext) {
    super();
  }

  makeShader(
    _uniforms: MallocObj | Float32Array | number[],
    localMatrix?: InputMatrix | undefined
  ): Shader {
    const { gl, program } = this.ctx;
    const uniforms = normalizeArray(_uniforms);
    const state = { uniformIndex: 0 };
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformInfo = gl.getActiveUniform(program, i)!;
      if (uniformInfo.type === gl.FLOAT) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          1,
          gl.uniform1fv.bind(gl)
        );
      } else if (uniformInfo.type === gl.FLOAT_VEC2) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          2,
          gl.uniform2fv.bind(gl)
        );
      } else if (uniformInfo.type === gl.FLOAT_VEC3) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          3,
          gl.uniform3fv.bind(gl)
        );
      } else if (uniformInfo.type === gl.FLOAT_VEC4) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          4,
          gl.uniform4fv.bind(gl)
        );
      } else if (uniformInfo.type === gl.FLOAT_MAT2) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          4,
          (loc, subarr) => gl.uniformMatrix2fv(loc, false, subarr)
        );
      } else if (uniformInfo.type === gl.FLOAT_MAT3) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          9,
          (loc, subarr) => gl.uniformMatrix3fv(loc, false, subarr)
        );
      } else if (uniformInfo.type === gl.FLOAT_MAT4) {
        processUniform(
          this.ctx,
          state,
          uniforms,
          uniformInfo,
          16,
          (loc, subarr) => gl.uniformMatrix4fv(loc, false, subarr)
        );
      }
      // Add more cases if your shader uses more types of uniforms
    }

    // If a local matrix is provided, set it as a uniform
    if (localMatrix) {
      throw new Error("localMatrix not implemented yet");
    }
    // if (localMatrix && localMatrix.length === 16) {
    //   const localMatrixLocation = gl.getUniformLocation(program, "localMatrix");
    //   gl.uniformMatrix4fv(
    //     localMatrixLocation,
    //     false,
    //     new Float32Array(localMatrix)
    //   );
    // }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return new ShaderLite(this.ctx.canvas);
  }
  makeShaderWithChildren(
    _uniforms: MallocObj | Float32Array | number[],
    _children?: Shader[] | undefined,
    _localMatrix?: InputMatrix | undefined
  ): Shader {
    throw new Error("Method not implemented.");
  }
  getUniform(index: number): SkSLUniform {
    const { gl, program } = this.ctx;
    const uniformInfo = gl.getActiveUniform(program, index);
    if (!uniformInfo) {
      throw new Error(`No uniform at index ${index}`);
    }

    let rows = 1;
    let columns = 1;
    let isInteger = false;

    switch (uniformInfo.type) {
      case gl.FLOAT:
        break;
      case gl.FLOAT_VEC2:
        rows = 2;
        break;
      case gl.FLOAT_VEC3:
        rows = 3;
        break;
      case gl.FLOAT_VEC4:
        rows = 4;
        break;
      case gl.FLOAT_MAT2:
        rows = 2;
        columns = 2;
        break;
      case gl.FLOAT_MAT3:
        rows = 3;
        columns = 3;
        break;
      case gl.FLOAT_MAT4:
        rows = 4;
        columns = 4;
        break;
      case gl.INT:
        isInteger = true;
        break;
      case gl.INT_VEC2:
        isInteger = true;
        rows = 2;
        break;
      case gl.INT_VEC3:
        isInteger = true;
        rows = 3;
        break;
      case gl.INT_VEC4:
        isInteger = true;
        rows = 4;
        break;
      default:
        throw new Error("Unsupported uniform type: " + uniformInfo.type);
    }
    const uniform: SkSLUniform = {
      columns,
      rows,
      slot: index,
      isInteger,
    };

    return uniform;
  }
  getUniformCount(): number {
    const { gl, program } = this.ctx;
    return gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  }
  getUniformFloatCount(): number {
    const { gl, program } = this.ctx;
    let floatCount = 0;
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformCount; i++) {
      const uniformInfo = gl.getActiveUniform(program, i);
      if (uniformInfo && uniformInfo.type === gl.FLOAT) {
        floatCount++;
      }
    }
    return floatCount;
  }
  getUniformName(index: number): string {
    const { gl, program } = this.ctx;
    const uniformInfo = gl.getActiveUniform(program, index);
    if (!uniformInfo) {
      throw new Error(`No uniform at index ${index}`);
    }
    return uniformInfo.name;
  }
}

export const RuntimeEffectFactory: CKRuntimeEffectFactory = {
  Make(
    sksl: string,
    callback?: ((err: string) => void) | undefined
  ): RuntimeEffect | null {
    const ctx = createContext(sksl, callback);
    if (ctx === null) {
      return null;
    }
    return new RuntimeEffectLite(ctx);
  },
  MakeTraced(
    _shader: Shader,
    _traceCoordX: number,
    _traceCoordY: number
  ): TracedShader {
    throw new Error("Method not implemented.");
  },
};