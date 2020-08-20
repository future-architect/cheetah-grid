import * as path2DManager from "../internal/path2DManager";
import type { AnyFunction, ColorDef } from "../ts-types";
import { Inline } from "./Inline";
import type { InlineDrawOption } from "./Inline";
import { calcStartPosition } from "../internal/canvases";

export type InlinePath2DConstructorOption = {
  path: Path2D | string;
  width: number;
  height: number;
  color?: ColorDef;
};

export class InlinePath2D extends Inline {
  private _path: Path2D;
  private _width: number;
  private _height: number;
  private _color?: ColorDef;
  constructor({ path, width, height, color }: InlinePath2DConstructorOption) {
    super();
    // このタイミングでないとIEでPath2Dのpolyfillが反映されない
    const Path2D = path2DManager.getPath2D();
    this._path = new Path2D(path);
    this._width = width;
    this._height = height;
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
    rect,
    offset,
    offsetLeft,
    offsetRight,
    offsetTop,
    offsetBottom,
  }: InlineDrawOption): void {
    offset++;
    const padding = {
      left: offsetLeft,
      right: offsetRight,
      top: offsetTop,
      bottom: offsetBottom,
    };
    ctx.save();
    try {
      ctx.beginPath();
      ctx.rect(rect.left, rect.top, rect.width, rect.height);
      //clip
      ctx.clip();

      //文字描画
      const pos = calcStartPosition(ctx, rect, this._width, this._height, {
        offset,
        padding,
      });
      ctx.translate(pos.x, pos.y);
      ctx.fill(this._path);
    } finally {
      ctx.restore();
    }
  }
  canBreak(): boolean {
    return false;
  }
  toString(): string {
    return "";
  }
}
