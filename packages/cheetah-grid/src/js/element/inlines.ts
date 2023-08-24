import * as icons from "../icons";
import * as path2DManager from "../internal/path2DManager";
import type { IconDefine } from "../ts-types";
import { Inline } from "./Inline";
import type { InlineDrawOption } from "./Inline";
import { InlineDrawer } from "./InlineDrawer";
import { InlineIcon } from "./InlineIcon";
import { InlineImage } from "./InlineImage";
import { InlinePath2D } from "./InlinePath2D";
import { InlineSvg } from "./InlineSvg";
import type { PaddingOption } from "../internal/canvases";
import type { SimpleColumnIconOption } from "../ts-types-internal";
import { calcStartPosition } from "../internal/canvases";

function drawRegisteredIcon(
  ctx: CanvasRenderingContext2D,
  icon: IconDefine,
  drawWidth: number,
  drawHeight: number,
  left: number,
  top: number,
  width: number,
  height: number,
  { offset = 2, padding }: { offset?: number; padding?: PaddingOption } = {}
): void {
  const rect = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
  ctx.save();
  try {
    ctx.beginPath();
    ctx.rect(rect.left, rect.top, rect.width, rect.height);
    //clip
    ctx.clip();

    //文字描画
    const pos = calcStartPosition(ctx, rect, drawWidth, drawHeight, {
      offset,
      padding,
    });
    path2DManager.fill(icon, ctx, pos.x, pos.y, drawWidth, drawHeight);
  } finally {
    ctx.restore();
  }
}

function isIconConstructorOption(
  icon: SimpleColumnIconOption
): icon is SimpleColumnIconOption & { font: string; content: string } {
  if (icon.font && icon.content) {
    return true;
  }
  return false;
}

function isInlineImageConstructorOption(
  icon: SimpleColumnIconOption
): icon is SimpleColumnIconOption & { src: string } {
  if (icon.src) {
    return true;
  }
  return false;
}

function isInlineSvgConstructorOption(
  icon: SimpleColumnIconOption
): icon is SimpleColumnIconOption & {
  path: string;
  width: number;
  height: number;
} {
  if (icon.path) {
    return true;
  }
  return false;
}

export function iconOf(icon: SimpleColumnIconOption): Inline;
export function iconOf(icon: null): null;
export function iconOf(icon: SimpleColumnIconOption | null): Inline | null {
  if (icon instanceof Inline) {
    return icon;
  }
  if (!icon) {
    return null;
  }
  if (isIconConstructorOption(icon)) {
    return new InlineIcon(icon);
  }
  if (isInlineImageConstructorOption(icon)) {
    return new InlineImage({
      src: icon.src,
      width: icon.width,
      height: icon.width,
    });
  }
  if (icon.svg) {
    return new InlineSvg({
      svg: icon.svg,
      width: icon.width,
      height: icon.width,
    });
  }
  if (isInlineSvgConstructorOption(icon)) {
    return new InlinePath2D({
      path: icon.path,
      width: icon.width,
      height: icon.width,
      color: icon.color,
    });
  }
  const registeredIcons = icons.get();
  if (icon.name && registeredIcons[icon.name]) {
    const registeredIcon = registeredIcons[icon.name];
    const width =
      icon.width || Math.max(registeredIcon.width, registeredIcon.height);
    return new InlineDrawer({
      draw({
        ctx,
        rect,
        offset,
        offsetLeft,
        offsetRight,
        offsetTop,
        offsetBottom,
      }: InlineDrawOption): void {
        drawRegisteredIcon(
          ctx,
          registeredIcon,
          width,
          width,
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
      },
      width,
      height: width,
      color: icon.color,
    });
  }
  return new InlineIcon(icon);
}
export function of(content: string | Inline): Inline;
export function of(content?: string | Inline | null): null;
export function of(content?: string | Inline | null): Inline | null {
  if (content == null) {
    return null;
  }
  if (content instanceof Inline) {
    return content;
  }
  return new Inline(content);
}
export function buildInlines(
  icons: SimpleColumnIconOption[] | null | undefined,
  inline: Inline | string | (string | Inline)[]
): Inline[] {
  const result: Inline[] = [];
  if (icons) {
    result.push(
      ...icons
        .map((icon) => iconOf(icon))
        .filter((i: Inline | null): i is Inline => i != null)
    );
  }
  if (
    Array.isArray(inline)
    // && inline.filter(il => il instanceof Inline).length <- ?
  ) {
    result.push(...inline.map((il) => of(il)).filter((i) => i != null));
  } else {
    const il = of(inline);
    if (il) {
      result.push(il);
    }
  }
  return result;
}
export function string(inline: Inline | string | (string | Inline)[]): string {
  return buildInlines(undefined, inline).join("");
}
