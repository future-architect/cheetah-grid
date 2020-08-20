import type { AnyFunction, ColorDef } from "../ts-types";
import { Inline } from "./Inline";
import type { InlineDrawOption } from "./Inline";

export type InlineDrawerFunction = (options: InlineDrawOption) => void;
export class InlineDrawer extends Inline {
  private _draw: InlineDrawerFunction;
  private _width: number;
  // private _height: number;
  private _color?: ColorDef;
  constructor({
    draw,
    width,
    // height,
    color,
  }: {
    draw: InlineDrawerFunction;
    width: number;
    height: number;
    color?: ColorDef;
  }) {
    super();

    this._draw = draw;
    this._width = width;
    // this._height = height;
    this._color = color;
  }
  width(_arg: { ctx: CanvasRenderingContext2D }): number {
    return this._width;
  }
  font(): string | null {
    return null;
  }
  color(): ColorDef | null {
    return this._color ?? null;
  }
  canDraw(): boolean {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReady(_callback: AnyFunction): void {}
  draw({
    ctx,
    canvashelper,
    rect,
    offset,
    offsetLeft,
    offsetRight,
    offsetTop,
    offsetBottom,
  }: InlineDrawOption): void {
    this._draw({
      ctx,
      canvashelper,
      rect,
      offset,
      offsetLeft,
      offsetRight,
      offsetTop,
      offsetBottom,
    });
  }
  canBreak(): boolean {
    return false;
  }
  toString(): string {
    return "";
  }
}
