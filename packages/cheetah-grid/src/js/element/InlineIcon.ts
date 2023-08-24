import * as fonts from "../internal/fonts";
import type { AnyFunction, ColorDef } from "../ts-types";
import { Inline } from "./Inline";
import type { InlineDrawOption } from "./Inline";

export type InlineIconConstructorOption = {
  width?: number;
  font?: string;
  content?: string;
  color?: ColorDef;
  offsetTop?: number;
  offsetLeft?: number;
};
export class InlineIcon extends Inline {
  private _icon: InlineIconConstructorOption;
  constructor(icon: InlineIconConstructorOption) {
    super();
    this._icon = icon || {};
  }
  width({ ctx }: { ctx: CanvasRenderingContext2D }): number {
    const icon = this._icon;
    if (icon.width) {
      return icon.width;
    }
    if (icon.font && fonts.check(icon.font, icon.content || "")) {
      ctx.save();
      ctx.canvas.style.letterSpacing = "normal";
      try {
        ctx.font = icon.font || ctx.font;
        return ctx.measureText(icon.content || "").width;
      } finally {
        ctx.canvas.style.letterSpacing = "";
        ctx.restore();
      }
    }
    return 0; //unknown
  }
  font(): string | null {
    return this._icon.font ?? null;
  }
  color(): ColorDef | null {
    return this._icon.color ?? null;
  }
  canDraw(): boolean {
    const icon = this._icon;
    return icon.font ? fonts.check(icon.font, icon.content || "") : true;
  }
  onReady(callback: AnyFunction): void {
    const icon = this._icon;
    if (icon.font && !fonts.check(icon.font, icon.content || "")) {
      fonts.load(icon.font, icon.content || "", callback);
    }
  }
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
    const icon = this._icon;
    if (icon.content) {
      ctx.canvas.style.letterSpacing = "normal";
      try {
        // eslint-disable-next-line no-self-assign
        ctx.font = ctx.font; // To apply letterSpacing, we need to reset it.
        canvashelper.fillTextRect(
          ctx,
          icon.content,
          rect.left,
          rect.top,
          rect.width,
          rect.height,
          {
            offset: offset + 1,
            padding: {
              left: offsetLeft + (this._icon.offsetLeft || 0),
              right: offsetRight,
              top: offsetTop + (this._icon.offsetTop || 0),
              bottom: offsetBottom,
            },
          }
        );
      } finally {
        ctx.canvas.style.letterSpacing = "";
      }
    }
  }
  canBreak(): boolean {
    return false;
  }
  toString(): string {
    return "";
  }
}
