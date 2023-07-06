/* eslint-disable prefer-destructuring */
import { PathVerb } from "../Core";
import { saturate } from "../math";

import type { PathComponent } from "./PathComponents";
import {
  CubicPathComponent,
  LinearPathComponent,
  QuadraticPathComponent,
} from "./PathComponents";

export type Applier<T> = (comp: T, index: number) => void;

export class Contour {
  components: PathComponent[] = [];

  constructor(public closed: boolean) {}

  getPosTanAtLength(length: number, output: Float32Array) {
    let found = false;
    let offset = 0;
    for (const component of this.components) {
      const componentLength = component.length();
      const nextOffset = offset + componentLength;
      if (nextOffset >= length) {
        const l0 = Math.max(0, length - offset);
        const pos = component.pointAtLength(l0);
        const tan = component.tangentAtLength(l0);
        output[0] = pos[0];
        output[1] = pos[1];
        output[2] = tan[0];
        output[3] = tan[1];
        found = true;
      }
      offset = nextOffset;
    }
    if (!found) {
      const p2 = this.getLastComponent().p2;
      output[0] = p2[0];
      output[1] = p2[1];
    }
  }

  getSegment(startT: number, stopT: number) {
    const totalLength = this.length();
    const start = saturate(startT) * totalLength;
    const stop = saturate(stopT) * totalLength;
    const trimmedContour = new Contour(false);
    if (start >= stop) {
      return trimmedContour;
    }
    let offset = 0;
    this.components.forEach((component) => {
      const componentLength = component.length();
      const nextOffset = offset + componentLength;
      if (nextOffset <= start || offset >= stop) {
        offset = nextOffset;
        return;
      }
      const t0 = Math.max(0, (start - offset) / componentLength);
      const t1 = Math.min(1, (stop - offset) / componentLength);
      //console.log(`component.getSegment(${t0}, ${t1});`);
      const partialContour = component.segment(t0, t1);
      trimmedContour.components.push(partialContour);
      offset = nextOffset;
    });
    return trimmedContour;
  }

  enumerateComponents(
    linearApplier?: Applier<LinearPathComponent>,
    quadApplier?: Applier<QuadraticPathComponent>,
    cubicApplier?: Applier<CubicPathComponent>
  ) {
    this.components.forEach((comp, index) => {
      if (comp instanceof LinearPathComponent && linearApplier) {
        linearApplier(comp, index);
      } else if (comp instanceof QuadraticPathComponent && quadApplier) {
        quadApplier(comp, index);
      } else if (comp instanceof CubicPathComponent && cubicApplier) {
        cubicApplier(comp, index);
      }
    });
  }

  length() {
    return this.components.reduce((acc, c) => acc + c.length(), 0);
  }

  getLastComponent() {
    return this.components[this.components.length - 1];
  }

  toCmds() {
    if (this.components.length === 0) {
      return [];
    }
    const [comp] = this.components;
    const cmds = [PathVerb.Move, comp.p1[0], comp.p1[1]];
    const cmdToAdd = this.components.map((c) => c.toCmd());
    if (this.closed) {
      cmdToAdd[cmdToAdd.length - 1] = [PathVerb.Close];
    }
    cmds.push(...cmdToAdd.flat());
    return cmds;
  }

  toSVGString() {
    if (this.components.length === 0) {
      return "";
    }
    const [comp] = this.components;
    const cmds = [`M${comp.p1[0]} ${comp.p1[1]}`];
    cmds.push(...this.components.map((c) => c.toSVGString()));
    if (this.closed) {
      cmds[cmds.length - 1] = "Z";
    }
    return cmds.join(" ");
  }
}
