import type {
  CellAddress,
  CellRange,
  MaybeCall,
  MaybePromise,
} from "../ts-types";

const isNode =
  typeof window === "undefined" || typeof window.window === "undefined";

type ArrayElementPredicate<E> = (t: E, i: number, arr: E[]) => boolean;
// type ObjectElementPredicate<T, K extends keyof T> = (
//   t: T[K],
//   key?: K,
//   obj?: T
// ) => boolean;

type ArrayElementFunction<E> = (t: E, i: number, arr: E[]) => void;
type ObjectElementFunction<T, K extends keyof T> = (
  t: T[K],
  key: K,
  obj: T
) => void;
let arrayFind: <T>(
  arr: T[],
  predicate: ArrayElementPredicate<T>
) => T | undefined;
let arrayFindIndex: <T>(
  arr: T[],
  predicate: ArrayElementPredicate<T>
) => number;
const array = {
  get find(): typeof arrayFind {
    if (arrayFind) {
      return arrayFind;
    }
    if (Array.prototype.find) {
      arrayFind = <T>(
        arr: T[],
        predicate: ArrayElementPredicate<T>
      ): T | undefined => Array.prototype.find.call(arr, predicate);
    } else {
      arrayFind = <T>(
        arr: T[],
        predicate: ArrayElementPredicate<T>
      ): T | undefined => {
        const index = array.findIndex(arr, predicate);
        return index >= 0 ? arr[index] : undefined;
      };
    }
    return arrayFind;
  },
  get findIndex(): typeof arrayFindIndex {
    if (arrayFindIndex) {
      return arrayFindIndex;
    }
    if (Array.prototype.findIndex) {
      arrayFindIndex = <T>(
        arr: T[],
        predicate: ArrayElementPredicate<T>
      ): number => Array.prototype.findIndex.call(arr, predicate);
    } else {
      arrayFindIndex = <T>(
        arr: T[],
        predicate: ArrayElementPredicate<T>
      ): number => {
        const { length } = arr;
        for (let i = 0; i < length; i++) {
          const value = arr[i];
          if (predicate(value, i, arr)) {
            return i;
          }
        }
        return -1;
      };
    }
    return arrayFindIndex;
  },
};

function analyzeUserAgent(): {
  IE: boolean;
  Edge: boolean;
  Chrome: boolean;
  Firefox: boolean;
  Safari: boolean;
} {
  if (isNode) {
    return {
      IE: false,
      Edge: false,
      Chrome: false,
      Firefox: false,
      Safari: false,
    };
  } else {
    const ua = window.navigator.userAgent.toLowerCase();
    return {
      IE: !!/(msie|trident)/.exec(ua),
      Edge: ua.indexOf("edge") > -1,
      Chrome: ua.indexOf("chrome") > -1 && ua.indexOf("edge") === -1,
      Firefox: ua.indexOf("firefox") > -1,
      Safari: ua.indexOf("safari") > -1 && ua.indexOf("edge") === -1,
    };
  }
}
const { IE, Chrome, Firefox, Edge, Safari } = analyzeUserAgent();

function setReadonly<T, K extends keyof T>(obj: T, name: K, value: T[K]): void {
  Object.defineProperty(obj, name, {
    enumerable: false,
    configurable: true,
    value,
  });
}

export function each<E>(obj: E[], fn: ArrayElementFunction<E>): void;
export function each<T, K extends keyof T>(
  obj: T,
  fn: ObjectElementFunction<T, K>
): void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function each(obj: any, fn: any): void {
  for (const key in obj) {
    fn(obj[key], key, obj);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(obj: any): obj is Record<string, any> {
  return obj === Object(obj);
}

export function omit<T, K extends keyof T>(source: T, omits: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key in source) {
    if (omits.indexOf(key as never) >= 0) {
      continue;
    }
    Object.defineProperty(result, key, {
      get() {
        return source[key];
      },
      set(val) {
        source[key] = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
  return result;
}

export function defaults<T>(source: T, defs: Partial<T>): T {
  const keys: string[] = [];
  const result = {} as T;
  for (const key in source) {
    keys.push(key);
    Object.defineProperty(result, key, {
      get() {
        const val = source[key];
        return val === undefined ? defs[key] : val;
      },
      set(val) {
        source[key] = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
  for (const key in defs) {
    if (keys.indexOf(key) >= 0) {
      continue;
    }
    Object.defineProperty(result, key, {
      get() {
        const val = source[key];
        return val === undefined ? defs[key] : val;
      },
      set(val) {
        source[key] = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
  return result;
}

export function extend<T, U>(t: T, u: U): T & U;
export function extend<T, U, V>(t: T, u: U, v: V): T & U & V;
export function extend<T>(...args: T[]): T;
export function extend<T>(...args: T[]): T {
  const result = {} as T;
  args.forEach((source) => {
    for (const key in source) {
      Object.defineProperty(result, key, {
        get() {
          return source[key];
        },
        set(val) {
          source[key] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
  return result;
}
function isDescendantElement(root: HTMLElement, target: HTMLElement): boolean {
  while (target.parentElement) {
    const p = target.parentElement;
    if (root === p) {
      return true;
    }
    target = p;
  }
  return false;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function applyChainSafe(
  obj: any,
  fn: (value: any, name: string) => any,
  ...names: string[]
): any {
  let value = obj;
  for (let i = 0; i < names.length && value != null; i++) {
    value = fn(value, names[i]);
  }
  return value;
}
function getChainSafe(obj: any, ...names: string[]): any {
  return applyChainSafe(obj, (val, name) => val[name], ...names);
}
function getOrApply<_T, A extends any[]>(
  value: undefined,
  ...args: A
): undefined;
function getOrApply<_T, A extends any[]>(value: null, ...args: A): null;
function getOrApply<T, A extends any[]>(value: MaybeCall<T, A>, ...args: A): T;
function getOrApply<T, A extends any[]>(value: MaybeCall<T, A>, ...args: A): T {
  if (typeof value === "function") {
    return (value as any)(...args);
  } else {
    return value;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
function endsWith(
  str: string,
  searchString: string,
  position?: number
): boolean {
  const subjectString = str.toString();
  if (
    typeof position !== "number" ||
    !isFinite(position) ||
    Math.floor(position) !== position ||
    position > subjectString.length
  ) {
    position = subjectString.length;
  }
  position -= searchString.length;
  const lastIndex = subjectString.lastIndexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}
function genChars(s: string): { next(): string | null } {
  // Surrogate Code Point
  // [\uD800-\uDBFF]
  // Variation Selectors
  // FVS [\u180B-\u180D]
  // VS1～VS16 [\uFE00-\uFE0F]
  // VS17～VS256 \uDB40[\uDD00-\uDDEF]
  const re =
    /([\uD800-\uDBFF][\uDC00-\uDFFF]|\r\n|[^\uD800-\uDFFF])([\u180B-\u180D]|[\uFE00-\uFE0F]|\uDB40[\uDD00-\uDDEF])?/g;
  return {
    next(): string | null {
      const res = re.exec(s);
      return res !== null ? res[0] : null;
    },
  };
}
export type GenWordsResult = {
  next(): string | null;
};
function genWords(s: string): GenWordsResult {
  const re = /[!-~]+|[^!-~\s]+|\s+/g;
  return {
    next(): string | null {
      const res = re.exec(s);
      return res !== null ? res[0] : null;
    },
  };
}

export function isPromise<T>(
  data: T | Promise<T> | undefined
): data is Promise<T> {
  return Boolean(data && typeof (data as Promise<T>).then === "function");
}
function then<T, R>(
  result: MaybePromise<T>,
  callback: (arg: T) => MaybePromise<R>
): MaybePromise<R>;
function then<T, R>(
  result: MaybePromise<T>,
  callback: (arg: T) => R
): MaybePromise<R>;
function then<T, R>(
  result: MaybePromise<T>,
  callback: (arg: T) => R
): MaybePromise<R> {
  return isPromise(result) ? result.then((r) => callback(r)) : callback(result);
}
function getMouseButtons(e: MouseEvent): number {
  if (e.buttons != null) {
    return e.buttons;
  }
  /*for legacy*/
  if (e.which != null) {
    if (e.which === 3) {
      //right?
      return 4;
    }
    if (e.which === 2) {
      //middle?
      return 4;
    }
    return e.which; //left or no
  }

  if (e.button === 0 || e.button === 1) {
    return 1; //candidate left
  }
  if (e.button === 2) {
    return 2; // right
  }
  return 0; //no or middle?
}
function getKeyCode(e: KeyboardEvent): number {
  return e.keyCode || e.which;
}
function isTouchEvent(e: TouchEvent | MouseEvent): e is TouchEvent {
  return !!(e as TouchEvent).changedTouches;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIgnoreCase(obj: any, name: string): any {
  if (obj[name]) {
    return obj[name];
  }
  const l = name.toLowerCase();
  if (obj[l]) {
    return obj[l];
  }
  const u = name.toLowerCase();
  if (obj[u]) {
    return obj[u];
  }
  for (const k in obj) {
    if (k.toLowerCase() === l) {
      return obj[k];
    }
  }
  return undefined;
}
function cancel(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
}

function toBoxArray<T>(obj: T | T[]): [T, T, T, T] {
  if (!Array.isArray(obj)) {
    return [obj /*top*/, obj /*right*/, obj /*bottom*/, obj /*left*/];
  }
  if (obj.length === 3) {
    return [
      obj[0] /*top*/,
      obj[1] /*right*/,
      obj[2] /*bottom*/,
      obj[1] /*left*/,
    ];
  }
  if (obj.length === 2) {
    return [
      obj[0] /*top*/,
      obj[1] /*right*/,
      obj[0] /*bottom*/,
      obj[1] /*left*/,
    ];
  }
  if (obj.length === 1) {
    return [
      obj[0] /*top*/,
      obj[0] /*right*/,
      obj[0] /*bottom*/,
      obj[0] /*left*/,
    ];
  }
  return obj as [T, T, T, T];
}

export {
  isNode,
  isDescendantElement,
  getChainSafe,
  applyChainSafe,
  getOrApply,
  getIgnoreCase,
  then,
  array,
};

export function cellEquals(a: CellAddress, b: CellAddress): boolean {
  return a.col === b.col && a.row === b.row;
}
export function cellInRange(
  range: CellRange,
  col: number,
  row: number
): boolean {
  return (
    range.start.col <= col &&
    col <= range.end.col &&
    range.start.row <= row &&
    row <= range.end.row
  );
}

export const browser = {
  IE,
  Edge,
  Chrome,
  Firefox,
  Safari,
  // Chrome 16777216 (onl Chrome 33554431)
  // FireFox 17895588
  // IE 10737433
  heightLimit: Chrome ? 16777216 : Firefox ? 17895588 : 10737433, // default IE limit
};

export const obj = {
  setReadonly,
  isObject,
};
export const str = {
  endsWith,
  genChars,
  genWords,
};
export const event = {
  getMouseButtons,
  getKeyCode,
  isTouchEvent,
  cancel,
};
export const style = {
  toBoxArray,
};
export const emptyFn = Function.prototype;
