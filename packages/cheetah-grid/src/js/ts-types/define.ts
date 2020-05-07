import type { ColorDef } from "./base";
import type { ListGridAPI } from "./grid-engine";

// ****** Column Icon Options *******
export interface FontIcon<T> {
  font?: string;
  content?: keyof T;
  className?: string;
  tagName?: string;
  isLiga?: boolean;
  width?: number;
  height?: number;
  color?: string;
}

export interface ImageIcon<T> {
  src: keyof T | string;
  width?: number;
  height?: number;
}

export interface PathIcon<T> {
  path: keyof T | string;
  width: number;
  height: number;
  color?: string;
}

export interface SvgIcon<T> {
  svg: keyof T | string;
  width?: number;
  height?: number;
}

export interface NamedIcon<T> {
  name: keyof T | string;
  width?: number;
  height?: number;
}

export type ColumnIconOption<T> =
  | FontIcon<T>
  | ImageIcon<T>
  | PathIcon<T>
  | SvgIcon<T>
  | NamedIcon<T>;

// ****** Column Menu Items Options *******
export type ColumnMenuItemOptions =
  | ColumnMenuItemOption[]
  | SimpleColumnMenuItemOption[]
  | OldSimpleColumnMenuItemOption[]
  | string
  | ColumnMenuItemObjectOptions;
export interface ColumnMenuItemOption {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  label: string;
  classList?: string[];
  html?: string;
}
export interface SimpleColumnMenuItemOption {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  label: string;
}
/** @internal */
export interface OldSimpleColumnMenuItemOption {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  caption: string;
}
export interface ColumnMenuItemObjectOptions {
  [value: string]: string;
}

// ****** TextStyle Options *******
export type TextOverflow = "clip" | "ellipsis" | string /* a char */;
export type LineClamp = number | "auto";

// ****** Color Options *******
export interface StylePropertyFunctionArg {
  row: number;
  col: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ListGridAPI<any>;
  context: CanvasRenderingContext2D;
}

export type ColorPropertyDefine =
  | ColorDef
  | ((args: StylePropertyFunctionArg) => string)
  | ((args: StylePropertyFunctionArg) => CanvasGradient)
  | ((args: StylePropertyFunctionArg) => CanvasPattern);

export type ColorsPropertyDefine =
  | ColorPropertyDefine
  | (ColorDef | null)[]
  | ((args: StylePropertyFunctionArg) => (ColorDef | null)[]);

export type FontPropertyDefine =
  | string
  | ((args: StylePropertyFunctionArg) => string);
