import type { MaybePromiseOrUndef } from "./base";

export interface CellAddress {
  col: number;
  row: number;
}
export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldGetter<T> = (record: T) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldSetter<T> = (record: T, value: any) => boolean;
export interface FieldAssessor<T> {
  get: FieldGetter<T>;
  set: FieldSetter<T>;
}

export type FieldDef<T> = keyof T | FieldGetter<T> | FieldAssessor<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldData = MaybePromiseOrUndef<any>;
