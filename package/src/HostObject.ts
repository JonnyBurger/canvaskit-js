import type { EmbindObject } from "canvaskit-wasm";

export abstract class HostObject<T extends string>
  // TODO: we have a patch in cavanskit that will sanitize this type once landed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implements EmbindObject<any>
{
  abstract __type__: T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clone(): any {
    throw new Error("Method not implemented.");
  }
  delete(): void {}
  deleteLater(): void {}
  isAliasOf(_other: unknown): boolean {
    throw new Error("Method not implemented.");
  }
  isDeleted(): boolean {
    return false;
  }
}

export abstract class IndexedHostObject<
  T extends string
> extends HostObject<T> {
  public readonly id;

  constructor(prefix: string) {
    super();
    this.id = `${prefix}-${
      Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
    }`;
  }
}
