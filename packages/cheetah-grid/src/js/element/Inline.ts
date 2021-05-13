import type { AnyFunction, ColorDef, InlineAPI, RectProps } from "../ts-types";
import type { Canvashelper } from "../tools/canvashelper";
import type { GenWordsResult } from "../internal/utils";
import { str } from "../internal/utils";

function getWidth(ctx: CanvasRenderingContext2D, content: string): number {
  return ctx.measureText(content).width;
}

function breakWidth(
  ctx: CanvasRenderingContext2D,
  content: string,
  itr: GenWordsResult,
  candidateIndex: number,
  width: number
): {
  before: Inline | null;
  after: Inline | null;
} {
  const chars = [];
  let ret = itr.next();
  for (let i = 0; i < candidateIndex && ret !== null; i++, ret = itr.next()) {
    chars.push(ret);
  }
  let beforeWidth = getWidth(ctx, chars.join(""));
  if (beforeWidth > width) {
    while (chars.length) {
      const c = chars.pop();
      beforeWidth -= getWidth(ctx, c || "");
      if (beforeWidth <= width) {
        break;
      }
    }
  } else if (beforeWidth < width) {
    while (ret !== null) {
      const charWidth = getWidth(ctx, ret);
      if (beforeWidth + charWidth > width) {
        break;
      }
      chars.push(ret);
      beforeWidth += charWidth;
      ret = itr.next();
    }
  }
  const beforeContent = chars.join("").replace(/\s+$/, "");
  const afterContent = content.slice(beforeContent.length).replace(/^\s+/, "");
  return {
    before: beforeContent ? new Inline(beforeContent) : null,
    after: afterContent ? new Inline(afterContent) : null,
  };
}

export type InlineDrawOption = {
  ctx: CanvasRenderingContext2D;
  canvashelper: Canvashelper;
  rect: RectProps;
  offset: number;
  offsetLeft: number;
  offsetRight: number;
  offsetTop: number;
  offsetBottom: number;
};
export class Inline implements InlineAPI {
  private _content: string;
  constructor(content?: string) {
    this._content = content != null ? content : "";
  }
  width({ ctx }: { ctx: CanvasRenderingContext2D }): number {
    return getWidth(ctx, this._content);
  }
  font(): string | null {
    return null;
  }
  color(): ColorDef | null {
    return null;
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
    canvashelper.fillTextRect(
      ctx,
      this._content,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      {
        offset: offset + 1,
        padding: {
          left: offsetLeft,
          right: offsetRight,
          top: offsetTop,
          bottom: offsetBottom,
        },
      }
    );
  }
  canBreak(): boolean {
    return !!this._content;
  }
  splitIndex(index: number): {
    before: Inline | null;
    after: Inline | null;
  } {
    const content = this._content;
    const itr = str.genChars(content);
    const chars = [];
    let ret = itr.next();
    for (let i = 0; i < index && ret !== null; i++, ret = itr.next()) {
      chars.push(ret);
    }
    const beforeContent = chars.join("");
    const afterContent = content.slice(beforeContent.length);
    return {
      before: beforeContent ? new Inline(beforeContent) : null,
      after: afterContent ? new Inline(afterContent) : null,
    };
  }
  breakWord(
    ctx: CanvasRenderingContext2D,
    width: number
  ): {
    before: Inline | null;
    after: Inline | null;
  } {
    const content = this._content;
    const allWidth = this.width({ ctx });
    const candidate = Math.floor((this._content.length * width) / allWidth);
    const itr = str.genWords(content);
    return breakWidth(ctx, content, itr, candidate, width);
  }
  breakAll(
    ctx: CanvasRenderingContext2D,
    width: number
  ): {
    before: Inline | null;
    after: Inline | null;
  } {
    const content = this._content;
    const allWidth = this.width({ ctx });
    const candidate = Math.floor((this._content.length * width) / allWidth);
    const itr = str.genChars(content);
    return breakWidth(ctx, content, itr, candidate, width);
  }
  toString(): string {
    return this._content;
  }
}
