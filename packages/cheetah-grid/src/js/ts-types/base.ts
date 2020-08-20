/* eslint-disable @typescript-eslint/no-unused-vars -- bug? */
export type MaybeUndef<T> = T | undefined;
export type PromiseOrUndef<T> = undefined | Promise<T | undefined>;
export type PromiseMaybeUndef<T> = Promise<T | undefined>;

export type MaybePromise<T> = T | Promise<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeCall<T, A extends any[]> = T | ((...args: A) => T);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybePromiseOrCall<T, A extends any[]> =
  | T
  | Promise<T>
  | ((...args: A) => T);

export type MaybePromiseOrUndef<T> = T | undefined | Promise<T | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeCallOrUndef<T, A extends any[]> =
  | undefined
  | T
  | ((...args: A) => T);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybePromiseOrCallOrUndef<T, A extends any[]> =
  | T
  | undefined
  | Promise<T | undefined>
  | ((...args: A) => T);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PromiseMaybeUndefOrCall<T, A extends any[]> =
  | Promise<T | undefined>
  | ((...args: A) => T);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PromiseMaybeCallOrUndef<T, A extends any[]> = Promise<
  MaybeCallOrUndef<T, A>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export interface RectProps {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export type ColorDef = CanvasRenderingContext2D["fillStyle"];
