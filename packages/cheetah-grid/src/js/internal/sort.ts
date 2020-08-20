import type { MaybePromise } from "../ts-types";
import { isPromise } from "./utils";

function createArray<T>(get: (i: number) => T, length: number): T[] {
  const array = new Array<T>(length);
  for (let i = 0; i < length; i++) {
    array[i] = get(i);
  }
  return array;
}
function createArrayPromise<R>(
  get: (i: number) => MaybePromise<R>,
  getField: undefined,
  length: number
): Promise<{ v: R; f: R }[]>;
function createArrayPromise<R, F>(
  get: (i: number) => MaybePromise<R>,
  getField: (r: R) => MaybePromise<F>,
  length: number
): Promise<{ v: R; f: F }[]>;
function createArrayPromise<R, F>(
  get: (i: number) => MaybePromise<R>,
  getField: ((r: R) => MaybePromise<F>) | undefined,
  length: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  return new Promise((resolve) => {
    const plist = [];
    const array = new Array<{ v: MaybePromise<R>; f: MaybePromise<R> }>(length);
    for (let i = 0; i < length; i++) {
      const data = get(i);
      const record = {
        v: data,
        f: data,
      };
      array[i] = record;
      if (isPromise(data)) {
        plist.push(
          data.then((v) => {
            record.v = v;
            record.f = v;
          })
        );
      }
    }
    Promise.all(plist)
      .then(() =>
        getField == null
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (array as any)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setArrayField(array as any, getField)
      )
      .then(resolve);
  });
}
function setArrayField<R, F>(
  array: { v: R; f: R | F }[],
  getField: (r: R) => MaybePromise<F>
): Promise<{ v: R; f: F }[]> {
  return new Promise((resolve) => {
    const { length } = array;
    const plist = [];
    for (let i = 0; i < length; i++) {
      const record = array[i];
      const f = getField(record.v);
      if (isPromise(f)) {
        plist.push(
          f.then((v) => {
            record.f = v;
          })
        );
      } else {
        record.f = f;
      }
    }
    Promise.all(plist).then(() => resolve(array as { v: R; f: F }[]));
  });
}
export function sortArray<T>(
  array: T[],
  compare: (a: T, b: T) => number
): void {
  Array.prototype.sort.call(array, compare);
}

export function sort<R, _F>(
  get: (i: number) => R,
  set: (i: number, r: R) => void,
  length: number,
  compare: (a: R, b: R) => number
): void;
export function sort<R, F>(
  get: (i: number) => R,
  set: (i: number, r: R) => void,
  length: number,
  compare: (a: F, b: F) => number,
  getField: (r: R) => F
): void;
export function sort<R, F>(
  get: (i: number) => R,
  set: (i: number, r: R) => void,
  length: number,
  compare: ((a: R, b: R) => number) | ((a: F, b: F) => number),
  getField?: (r: R) => F
): void {
  const old = createArray(get, length);
  if (getField != null) {
    old.sort((r1, r2) =>
      (compare as (a: F, b: F) => number)(getField(r1), getField(r2))
    );
  } else {
    old.sort(compare as (a: R, b: R) => number);
  }
  for (let i = 0; i < length; i++) {
    set(i, old[i]);
  }
}

export function sortPromise<R, _F>(
  get: (i: number) => MaybePromise<R>,
  set: (i: number, r: R) => void,
  length: number,
  compare: (a: R, b: R) => number
): void;
export function sortPromise<R, F>(
  get: (i: number) => MaybePromise<R>,
  set: (i: number, r: R) => void,
  length: number,
  compare: (a: F, b: F) => number,
  getField: (r: R) => MaybePromise<F | undefined>
): Promise<void>;
export function sortPromise<R, F>(
  get: (i: number) => MaybePromise<R>,
  set: (i: number, r: R) => void,
  length: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compare: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getField?: any
): Promise<void> {
  if (typeof Promise !== "undefined") {
    return createArrayPromise(get, getField, length).then((array) => {
      array.sort((r1, r2) => compare(r1.f, r2.f));
      for (let i = 0; i < length; i++) {
        set(i, array[i].v);
      }
    });
  } else {
    sort(
      get as (i: number) => R,
      set,
      length,
      compare as (a: F, b: F) => number,
      getField as (r: R) => F
    );
    const dummyPromise: Promise<undefined> = {
      then(fn: () => void): Promise<undefined> {
        fn();
        return dummyPromise;
      },
      catch(): Promise<undefined> {
        return dummyPromise;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    return dummyPromise;
  }
}
