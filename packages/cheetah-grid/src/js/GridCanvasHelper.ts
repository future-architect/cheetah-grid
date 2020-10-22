import * as calc from "./internal/calc";
import * as canvashelper from "./tools/canvashelper";
import * as fonts from "./internal/fonts";
import * as inlineUtils from "./element/inlines";
import * as themes from "./themes";
import type {
  CellContext,
  ColorDef,
  ColorPropertyDefine,
  ColorsPropertyDefine,
  FontPropertyDefine,
  GridCanvasHelperAPI,
  LineClamp,
  ListGridAPI,
  RectProps,
  RequiredThemeDefine,
  StylePropertyFunctionArg,
  TextOverflow,
} from "./ts-types";
import type { Inline, InlineDrawOption } from "./element/Inline";
import { calcStartPosition, getFontSize } from "./internal/canvases";
import {
  cellEquals,
  cellInRange,
  getChainSafe,
  getOrApply,
  style,
} from "./internal/utils";
import { InlineDrawer } from "./element/InlineDrawer";
import type { RGBA } from "./internal/color";
import { Rect } from "./internal/Rect";
import type { SimpleColumnIconOption } from "./ts-types-internal";
import { colorToRGB } from "./internal/color";

const { toBoxArray } = style;

const INLINE_ELLIPSIS = inlineUtils.of("\u2026");

type ColorsDef = ColorDef | (ColorDef | null)[];

function invalidateCell<T>(context: CellContext, grid: ListGridAPI<T>): void {
  const { col, row } = context;
  grid.invalidateCell(col, row);
}
function getColor<T>(
  color: ColorPropertyDefine,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorDef;
function getColor<T>(
  color: ColorsPropertyDefine,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorsDef;
function getColor<T>(
  color: undefined,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): undefined;
function getColor<T>(
  color: ColorPropertyDefine | ColorsPropertyDefine | undefined,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorDef | ColorsDef | undefined {
  return getOrApply(color, {
    col,
    row,
    grid,
    context,
  });
}
function getFont<T>(
  font: FontPropertyDefine | undefined,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): string | undefined {
  if (font == null) {
    return undefined;
  }
  return getOrApply(font, {
    col,
    row,
    grid,
    context,
  });
}
function getThemeColor<
  R,
  T extends ColorPropertyDefine | ColorsPropertyDefine | string
>(grid: ListGridAPI<R>, ...names: string[]): T {
  const gridThemeColor = getChainSafe(grid.theme, ...names);
  if (gridThemeColor == null) {
    // use default theme
    return getChainSafe(themes.getDefault(), ...names);
  }
  if (typeof gridThemeColor !== "function") {
    return gridThemeColor;
  }
  let defaultThemeColor: ColorDef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((args: StylePropertyFunctionArg): any => {
    const color = gridThemeColor(args);
    if (color != null) {
      // use grid theme
      return color;
    }
    // use default theme
    defaultThemeColor =
      defaultThemeColor || getChainSafe(themes.getDefault(), ...names);
    return getOrApply(defaultThemeColor, args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
function testFontLoad<T>(
  font: string | undefined,
  value: string,
  context: CellContext,
  grid: ListGridAPI<T>
): boolean {
  if (font) {
    if (!fonts.check(font, value)) {
      fonts.load(font, value, () => invalidateCell(context, grid));
      return false;
    }
  }
  return true;
}

function drawInlines<T>(
  ctx: CanvasRenderingContext2D,
  inlines: Inline[],
  rect: RectProps,
  offset: number,
  offsetTop: number,
  offsetBottom: number,
  col: number,
  row: number,
  grid: ListGridAPI<T>
): void {
  function drawInline(
    inline: Inline,
    offsetLeft: number,
    offsetRight: number
  ): void {
    if (inline.canDraw()) {
      ctx.save();
      try {
        ctx.fillStyle = getColor(
          inline.color() || ctx.fillStyle,
          col,
          row,
          grid,
          ctx
        );
        ctx.font = inline.font() || ctx.font;
        inline.draw({
          ctx,
          canvashelper,
          rect,
          offset,
          offsetLeft,
          offsetRight,
          offsetTop,
          offsetBottom,
        });
      } finally {
        ctx.restore();
      }
    } else {
      inline.onReady(() => grid.invalidateCell(col, row));
      //noop
    }
  }
  if (inlines.length === 1) {
    //1件の場合は幅計算が不要なため分岐
    const inline = inlines[0];
    drawInline(inline, 0, 0);
  } else {
    const inlineWidths = inlines.map(
      (inline) => (inline.width({ ctx }) || 0) - 0
    );
    let offsetRight = inlineWidths.reduce((a, b) => a + b);

    let offsetLeft = 0;
    inlines.forEach((inline, index) => {
      const inlineWidth = inlineWidths[index];
      offsetRight -= inlineWidth;
      drawInline(inline, offsetLeft, offsetRight);
      offsetLeft += inlineWidth;
    });
  }
}

function buildInlines(
  icons: SimpleColumnIconOption[] | undefined,
  inline: string
): Inline[] {
  return inlineUtils.buildInlines(icons, inline || "");
}

function inlineToString(inline: Inline | string): string {
  return inlineUtils.string(inline);
}

function getOverflowInline(textOverflow?: TextOverflow): Inline {
  if (!isAllowOverflow(textOverflow) || textOverflow === "ellipsis") {
    return INLINE_ELLIPSIS;
  }
  textOverflow = textOverflow.trim();
  if (textOverflow.length === 1) {
    return inlineUtils.of(textOverflow[0]);
  }
  return INLINE_ELLIPSIS;
}

function isAllowOverflow(textOverflow?: TextOverflow): textOverflow is string {
  return Boolean(
    textOverflow && textOverflow !== "clip" && typeof textOverflow === "string"
  );
}

function getOverflowInlinesIndex(
  ctx: CanvasRenderingContext2D,
  inlines: Inline[],
  width: number
): {
  index: number;
  lineWidth: number;
  remWidth: number;
} | null {
  const maxWidth = width - 3; /*buffer*/
  let lineWidth = 0;
  for (let i = 0; i < inlines.length; i++) {
    const inline = inlines[i];
    const inlineWidth = (inline.width({ ctx }) || 0) - 0;
    if (lineWidth + inlineWidth > maxWidth) {
      return {
        index: i,
        lineWidth,
        remWidth: maxWidth - lineWidth,
      };
    }
    lineWidth += inlineWidth;
  }
  return null;
}

function isOverflowInlines(
  ctx: CanvasRenderingContext2D,
  inlines: Inline[],
  width: number
): boolean {
  return !!getOverflowInlinesIndex(ctx, inlines, width);
}

function breakWidthInlines(
  ctx: CanvasRenderingContext2D,
  inlines: Inline[],
  width: number
): {
  beforeInlines: Inline[];
  overflow: boolean;
  afterInlines: Inline[];
} {
  const indexData = getOverflowInlinesIndex(ctx, inlines, width);
  if (!indexData) {
    return {
      beforeInlines: inlines,
      overflow: false,
      afterInlines: [],
    };
  }
  const { index, remWidth } = indexData;
  const inline = inlines[index];
  const beforeInlines = inlines.slice(0, index);
  const afterInlines = [];
  if (inline.canBreak()) {
    let { before, after } = inline.breakWord(ctx, remWidth);
    if (!before && !beforeInlines.length) {
      ({ before, after } = inline.breakAll(ctx, remWidth));
    }
    if (!before && !beforeInlines.length) {
      // Always return one char
      ({ before, after } = inline.splitIndex(1));
    }
    if (before) {
      beforeInlines.push(before);
    }
    if (after) {
      afterInlines.push(after);
    }
    afterInlines.push(...inlines.slice(index + 1));
  } else {
    if (!beforeInlines.length) {
      // Always return one char
      beforeInlines.push(inline);
    }
    afterInlines.push(...inlines.slice(beforeInlines.length));
  }
  return {
    beforeInlines,
    overflow: true,
    afterInlines,
  };
}

function truncateInlines(
  ctx: CanvasRenderingContext2D,
  inlines: Inline[],
  width: number,
  option?: TextOverflow
): {
  inlines: Inline[];
  overflow: boolean;
} {
  const indexData = getOverflowInlinesIndex(ctx, inlines, width);
  if (!indexData) {
    return {
      inlines,
      overflow: false,
    };
  }
  const { index, lineWidth } = indexData;
  const inline = inlines[index];
  const overflowInline = getOverflowInline(option);
  const ellipsisWidth = overflowInline.width({ ctx });
  const remWidth = width - lineWidth - ellipsisWidth;
  const result = inlines.slice(0, index);
  if (inline.canBreak()) {
    const { before } = inline.breakAll(ctx, remWidth);
    if (before) {
      result.push(before);
    }
  }
  result.push(overflowInline);
  return {
    inlines: result,
    overflow: true,
  };
}

function _inlineRect<T>(
  grid: ListGridAPI<T>,
  ctx: CanvasRenderingContext2D,
  inline: string,
  rect: RectProps,
  col: number,
  row: number,
  {
    offset,
    color,
    textAlign,
    textBaseline,
    font,
    textOverflow,
    icons,
  }: {
    offset: number;
    color?: ColorPropertyDefine;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    font?: string;
    textOverflow?: TextOverflow;
    icons?: SimpleColumnIconOption[];
  }
): void {
  //文字style
  ctx.fillStyle = getColor(color || ctx.fillStyle, col, row, grid, ctx);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font || ctx.font;

  let inlines = buildInlines(icons, inline);
  if (
    isAllowOverflow(textOverflow) &&
    isOverflowInlines(ctx, inlines, rect.width)
  ) {
    const { inlines: truncInlines, overflow } = truncateInlines(
      ctx,
      inlines,
      rect.width,
      textOverflow
    );
    inlines = truncInlines;
    grid.setCellOverflowText(col, row, overflow && inlineToString(inline));
  } else {
    grid.setCellOverflowText(col, row, false);
  }

  drawInlines(ctx, inlines, rect, offset, 0, 0, col, row, grid);
}

// eslint-disable-next-line complexity
function _multiInlineRect<T>(
  grid: ListGridAPI<T>,
  ctx: CanvasRenderingContext2D,
  multiInlines: string[],
  rect: RectProps,
  col: number,
  row: number,
  {
    offset,
    color,
    textAlign,
    textBaseline,
    font,
    lineHeight,
    autoWrapText,
    lineClamp,
    textOverflow,
    icons,
  }: {
    offset: number;
    color?: ColorPropertyDefine;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    font?: string;
    lineHeight: number;
    autoWrapText?: boolean;
    lineClamp: LineClamp;
    textOverflow?: TextOverflow;
    icons?: SimpleColumnIconOption[];
  }
): void {
  //文字style
  ctx.fillStyle = getColor(color || ctx.fillStyle, col, row, grid, ctx);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font || ctx.font;

  if (lineClamp === "auto") {
    const rectHeight =
      rect.height - offset * 2 - 2; /*offset added by Inline#draw*/
    lineClamp = Math.max(Math.floor(rectHeight / lineHeight), 1);
  }

  let buildedMultiInlines: Inline[][];
  if (autoWrapText || lineClamp > 0 || isAllowOverflow(textOverflow)) {
    const { width } = rect;
    buildedMultiInlines = [];
    const procLineClamp =
      lineClamp > 0
        ? (inlines: Inline[], hasNext: boolean): boolean => {
            if (buildedMultiInlines.length + 1 >= lineClamp) {
              if (inlines.length === 0 && hasNext) {
                buildedMultiInlines.push([getOverflowInline(textOverflow)]);
                grid.setCellOverflowText(
                  col,
                  row,
                  multiInlines.map(inlineToString).join("\n")
                );
              } else {
                const { inlines: truncInlines, overflow } = truncateInlines(
                  ctx,
                  inlines,
                  width,
                  textOverflow
                );
                buildedMultiInlines.push(
                  hasNext && !overflow
                    ? truncInlines.concat([getOverflowInline(textOverflow)])
                    : truncInlines
                );
                if (overflow || hasNext) {
                  grid.setCellOverflowText(
                    col,
                    row,
                    multiInlines.map(inlineToString).join("\n")
                  );
                }
              }
              return false;
            }
            return true;
          }
        : (): boolean => true;
    const procLine = autoWrapText
      ? (inlines: Inline[], hasNext: boolean): boolean => {
          if (!procLineClamp(inlines, hasNext)) {
            return false;
          }
          while (inlines.length) {
            if (!procLineClamp(inlines, hasNext)) {
              return false;
            }
            const { beforeInlines, afterInlines } = breakWidthInlines(
              ctx,
              inlines,
              width
            );
            buildedMultiInlines.push(beforeInlines);
            inlines = afterInlines;
          }
          return true;
        }
      : isAllowOverflow(textOverflow)
      ? (inlines: Inline[], hasNext: boolean): boolean => {
          if (!procLineClamp(inlines, hasNext)) {
            return false;
          }
          const { inlines: truncInlines, overflow } = truncateInlines(
            ctx,
            inlines,
            width,
            textOverflow
          );
          buildedMultiInlines.push(truncInlines);
          if (overflow) {
            grid.setCellOverflowText(
              col,
              row,
              multiInlines.map(inlineToString).join("\n")
            );
          }
          return true;
        }
      : (inlines: Inline[], hasNext: boolean): boolean => {
          if (!procLineClamp(inlines, hasNext)) {
            return false;
          }
          buildedMultiInlines.push(inlines);
          return true;
        };
    grid.setCellOverflowText(col, row, false);
    for (let lineRow = 0; lineRow < multiInlines.length; lineRow++) {
      const inline = multiInlines[lineRow];
      const buildedInline = buildInlines(
        lineRow === 0 ? icons : undefined,
        inline
      );
      if (!procLine(buildedInline, lineRow + 1 < multiInlines.length)) {
        break;
      }
    }
  } else {
    grid.setCellOverflowText(col, row, false);
    buildedMultiInlines = multiInlines.map((inline, lineRow) =>
      buildInlines(lineRow === 0 ? icons : undefined, inline)
    );
  }

  let paddingTop = 0;
  let paddingBottom = lineHeight * (buildedMultiInlines.length - 1);

  if (ctx.textBaseline === "top" || ctx.textBaseline === "hanging") {
    const em = getFontSize(ctx, ctx.font).height;
    const pad = (lineHeight - em) / 2;
    paddingTop += pad;
    paddingBottom -= pad;
  } else if (
    ctx.textBaseline === "bottom" ||
    ctx.textBaseline === "alphabetic" ||
    ctx.textBaseline === "ideographic"
  ) {
    const em = getFontSize(ctx, ctx.font).height;
    const pad = (lineHeight - em) / 2;
    paddingTop -= pad;
    paddingBottom += pad;
  }
  buildedMultiInlines.forEach((buildedInline) => {
    drawInlines(
      ctx,
      buildedInline,
      rect,
      offset,
      paddingTop,
      paddingBottom,
      col,
      row,
      grid
    );
    paddingTop += lineHeight;
    paddingBottom -= lineHeight;
  });
}
function calcElapsedColor(
  startColor: string,
  endColor: string,
  elapsedTime: number
): string {
  const startColorRGB = colorToRGB(startColor);
  const endColorRGB = colorToRGB(endColor);
  const getRGB = (colorName: keyof RGBA): number => {
    const start = startColorRGB[colorName];
    const end = endColorRGB[colorName];
    if (elapsedTime >= 1) {
      return end;
    }
    if (elapsedTime <= 0) {
      return start;
    }
    const diff = start - end;
    return Math.ceil(start - diff * elapsedTime);
  };
  return `rgb(${getRGB("r")}, ${getRGB("g")}, ${getRGB("b")})`;
}
function drawCheckbox<T>(
  ctx: CanvasRenderingContext2D,
  rect: RectProps,
  col: number,
  row: number,
  check: boolean,
  helper: GridCanvasHelper<T>,
  {
    animElapsedTime = 1,
    uncheckBgColor = helper.theme.checkbox.uncheckBgColor,
    checkBgColor = helper.theme.checkbox.checkBgColor,
    borderColor = helper.theme.checkbox.borderColor,
    textAlign = "center",
    textBaseline = "middle",
  }: {
    animElapsedTime?: number;
    uncheckBgColor?: ColorPropertyDefine;
    checkBgColor?: ColorPropertyDefine;
    borderColor?: ColorPropertyDefine;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
  },
  positionOpt = {}
): void {
  const boxWidth = canvashelper.measureCheckbox(ctx).width;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  const pos = calcStartPosition(
    ctx,
    rect,
    boxWidth + 1 /*罫線分+1*/,
    boxWidth + 1 /*罫線分+1*/,
    positionOpt
  );
  uncheckBgColor = helper.getColor(uncheckBgColor, col, row, ctx);
  checkBgColor = helper.getColor(checkBgColor, col, row, ctx);
  borderColor = helper.getColor(borderColor, col, row, ctx);
  if (0 < animElapsedTime && animElapsedTime < 1) {
    uncheckBgColor = check
      ? uncheckBgColor
      : calcElapsedColor(
          checkBgColor as string,
          uncheckBgColor as string,
          animElapsedTime
        );
    checkBgColor = check
      ? calcElapsedColor(
          uncheckBgColor as string,
          checkBgColor as string,
          animElapsedTime
        )
      : checkBgColor;
  }

  canvashelper.drawCheckbox(
    ctx,
    pos.x,
    pos.y,
    check ? animElapsedTime : false,
    {
      uncheckBgColor,
      checkBgColor,
      borderColor,
    }
  );
}

function drawRadioButton<T>(
  ctx: CanvasRenderingContext2D,
  rect: RectProps,
  col: number,
  row: number,
  check: boolean,
  helper: GridCanvasHelper<T>,
  {
    animElapsedTime = 1,
    checkColor = helper.theme.radioButton.checkColor,
    uncheckBorderColor = helper.theme.radioButton.uncheckBorderColor,
    checkBorderColor = helper.theme.radioButton.checkBorderColor,
    uncheckBgColor = helper.theme.radioButton.uncheckBgColor,
    checkBgColor = helper.theme.radioButton.checkBgColor,
    textAlign = "center",
    textBaseline = "middle",
  }: {
    animElapsedTime?: number;
    checkColor?: ColorPropertyDefine;
    uncheckBorderColor?: ColorPropertyDefine;
    checkBorderColor?: ColorPropertyDefine;
    uncheckBgColor?: ColorPropertyDefine;
    checkBgColor?: ColorPropertyDefine;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
  },
  positionOpt = {}
): void {
  const boxWidth = canvashelper.measureRadioButton(ctx).width;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  const pos = calcStartPosition(
    ctx,
    rect,
    boxWidth + 1 /*罫線分+1*/,
    boxWidth + 1 /*罫線分+1*/,
    positionOpt
  );
  checkColor = helper.getColor(checkColor, col, row, ctx);
  uncheckBorderColor = helper.getColor(uncheckBorderColor, col, row, ctx);
  checkBorderColor = helper.getColor(checkBorderColor, col, row, ctx);
  uncheckBgColor = helper.getColor(uncheckBgColor, col, row, ctx);
  checkBgColor = helper.getColor(checkBgColor, col, row, ctx);
  let borderColor = check ? checkBorderColor : uncheckBorderColor;
  let bgColor = check ? checkBgColor : uncheckBgColor;
  if (0 < animElapsedTime && animElapsedTime < 1) {
    borderColor = check
      ? calcElapsedColor(
          uncheckBorderColor as string,
          checkBorderColor as string,
          animElapsedTime
        )
      : calcElapsedColor(
          checkBorderColor as string,
          uncheckBorderColor as string,
          animElapsedTime
        );
    bgColor = check
      ? calcElapsedColor(
          uncheckBgColor as string,
          checkBgColor as string,
          animElapsedTime
        )
      : calcElapsedColor(
          checkBgColor as string,
          uncheckBgColor as string,
          animElapsedTime
        );
  }

  canvashelper.drawRadioButton(
    ctx,
    pos.x,
    pos.y,
    check ? animElapsedTime : 1 - animElapsedTime,
    {
      checkColor,
      borderColor,
      bgColor,
    }
  );
}
class ThemeResolver<T> implements RequiredThemeDefine {
  private _grid: ListGridAPI<T>;
  private _checkbox: RequiredThemeDefine["checkbox"] | null = null;
  private _radioButton: RequiredThemeDefine["radioButton"] | null = null;
  private _button: RequiredThemeDefine["button"] | null = null;
  private _header: RequiredThemeDefine["header"] | null = null;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
  }
  getThemeColor<
    T extends ColorPropertyDefine | ColorsPropertyDefine | FontPropertyDefine
  >(...name: string[]): T {
    return getThemeColor(this._grid, ...name);
  }
  get font(): string {
    return getThemeColor(this._grid, "font");
  }
  get underlayBackgroundColor(): string {
    return getThemeColor(this._grid, "underlayBackgroundColor");
  }
  // color
  get color(): ColorPropertyDefine {
    return getThemeColor(this._grid, "color");
  }
  get frozenRowsColor(): ColorPropertyDefine {
    return getThemeColor(this._grid, "frozenRowsColor");
  }
  // background
  get defaultBgColor(): ColorPropertyDefine {
    return getThemeColor(this._grid, "defaultBgColor");
  }
  get frozenRowsBgColor(): ColorPropertyDefine {
    return getThemeColor(this._grid, "frozenRowsBgColor");
  }
  get selectionBgColor(): ColorPropertyDefine {
    return getThemeColor(this._grid, "selectionBgColor");
  }
  get highlightBgColor(): ColorPropertyDefine {
    return getThemeColor(this._grid, "highlightBgColor");
  }
  // border
  get borderColor(): ColorsPropertyDefine {
    return getThemeColor(this._grid, "borderColor");
  }
  get frozenRowsBorderColor(): ColorsPropertyDefine {
    return getThemeColor(this._grid, "frozenRowsBorderColor");
  }
  get highlightBorderColor(): ColorsPropertyDefine {
    return getThemeColor(this._grid, "highlightBorderColor");
  }
  get checkbox(): RequiredThemeDefine["checkbox"] {
    const grid = this._grid;
    return (
      this._checkbox ||
      (this._checkbox = {
        get uncheckBgColor(): ColorPropertyDefine {
          return getThemeColor(grid, "checkbox", "uncheckBgColor");
        },
        get checkBgColor(): ColorPropertyDefine {
          return getThemeColor(grid, "checkbox", "checkBgColor");
        },
        get borderColor(): ColorPropertyDefine {
          return getThemeColor(grid, "checkbox", "borderColor");
        },
      })
    );
  }
  get radioButton(): RequiredThemeDefine["radioButton"] {
    const grid = this._grid;
    return (
      this._radioButton ||
      (this._radioButton = {
        get checkColor(): ColorPropertyDefine {
          return getThemeColor(grid, "radioButton", "checkColor");
        },
        get uncheckBorderColor(): ColorPropertyDefine {
          return getThemeColor(grid, "radioButton", "uncheckBorderColor");
        },
        get checkBorderColor(): ColorPropertyDefine {
          return getThemeColor(grid, "radioButton", "checkBorderColor");
        },
        get uncheckBgColor(): ColorPropertyDefine {
          return getThemeColor(grid, "radioButton", "uncheckBgColor");
        },
        get checkBgColor(): ColorPropertyDefine {
          return getThemeColor(grid, "radioButton", "checkBgColor");
        },
      })
    );
  }
  get button(): RequiredThemeDefine["button"] {
    const grid = this._grid;
    return (
      this._button ||
      (this._button = {
        get color(): ColorPropertyDefine {
          return getThemeColor(grid, "button", "color");
        },
        get bgColor(): ColorPropertyDefine {
          return getThemeColor(grid, "button", "bgColor");
        },
      })
    );
  }
  get header(): RequiredThemeDefine["header"] {
    const grid = this._grid;
    return (
      this._header ||
      (this._header = {
        get sortArrowColor(): ColorPropertyDefine {
          return getThemeColor(grid, "header", "sortArrowColor");
        },
      })
    );
  }
}

function strokeRect(
  ctx: CanvasRenderingContext2D,
  color: ColorsDef,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  if (!Array.isArray(color)) {
    if (color) {
      ctx.strokeStyle = color;
      ctx.strokeRect(left, top, width, height);
    }
  } else {
    const borderColors = toBoxArray(color);
    canvashelper.strokeColorsRect(ctx, borderColors, left, top, width, height);
  }
}

export class GridCanvasHelper<T> implements GridCanvasHelperAPI {
  private _grid: ListGridAPI<T>;
  private _theme: RequiredThemeDefine;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
    this._theme = new ThemeResolver(grid);
  }
  createCalculator(
    context: CellContext,
    font: string | undefined
  ): {
    calcWidth(width: number | string): number;
    calcHeight(height: number | string): number;
  } {
    return {
      calcWidth(width: number | string): number {
        return calc.toPx(width, {
          get full() {
            const rect = context.getRect();
            return rect.width;
          },
          get em() {
            return getFontSize(context.getContext(), font).width;
          },
        });
      },
      calcHeight(height: number | string): number {
        return calc.toPx(height, {
          get full() {
            const rect = context.getRect();
            return rect.height;
          },
          get em() {
            return getFontSize(context.getContext(), font).height;
          },
        });
      },
    };
  }
  getColor(
    color: ColorPropertyDefine,
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): ColorDef;
  getColor(
    color: ColorsPropertyDefine,
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): ColorsDef;
  getColor(
    color: ColorPropertyDefine | ColorsPropertyDefine,
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): ColorsDef {
    return getColor(color, col, row, this._grid, ctx);
  }
  toBoxArray(
    obj: ColorsDef
  ): [ColorDef | null, ColorDef | null, ColorDef | null, ColorDef | null] {
    return toBoxArray(obj);
  }
  toBoxPixelArray(
    value: number | string | (number | string)[],
    context: CellContext,
    font: string | undefined
  ): [number, number, number, number] {
    if (typeof value === "string" || Array.isArray(value)) {
      const calculator = this.createCalculator(context, font);
      const box = toBoxArray(value);
      return [
        calculator.calcHeight(box[0]),
        calculator.calcWidth(box[1]),
        calculator.calcHeight(box[2]),
        calculator.calcWidth(box[3]),
      ];
    }
    return toBoxArray(value);
  }
  get theme(): RequiredThemeDefine {
    return this._theme;
  }
  drawWithClip(
    context: CellContext,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): void {
    const drawRect = context.getDrawRect();
    if (!drawRect) {
      return;
    }
    const ctx = context.getContext();

    ctx.save();
    try {
      ctx.beginPath();
      ctx.rect(drawRect.left, drawRect.top, drawRect.width, drawRect.height);
      //clip
      ctx.clip();

      draw(ctx);
    } finally {
      ctx.restore();
    }
  }
  drawBorderWithClip(
    context: CellContext,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): void {
    const drawRect = context.getDrawRect();
    if (!drawRect) {
      return;
    }
    const rect = context.getRect();
    const ctx = context.getContext();
    ctx.save();
    try {
      //罫線用clip
      ctx.beginPath();
      let clipLeft = drawRect.left;
      let clipWidth = drawRect.width;
      if (drawRect.left === rect.left) {
        clipLeft += -1;
        clipWidth += 1;
      }
      let clipTop = drawRect.top;
      let clipHeight = drawRect.height;
      if (drawRect.top === rect.top) {
        clipTop += -1;
        clipHeight += 1;
      }
      ctx.rect(clipLeft, clipTop, clipWidth, clipHeight);
      ctx.clip();

      draw(ctx);
    } finally {
      ctx.restore();
    }
  }
  text(
    text: string,
    context: CellContext,
    {
      padding,
      offset = 2,
      color,
      textAlign = "left",
      textBaseline = "middle",
      font,
      textOverflow = "clip",
      icons,
    }: {
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    } = {}
  ): void {
    let rect = context.getRect();

    const { col, row } = context;

    if (!color) {
      ({ color } = this.theme);
      // header color
      const isFrozenCell = this._grid.isFrozenCell(col, row);
      if (isFrozenCell && isFrozenCell.row) {
        color = this.theme.frozenRowsColor;
      }
    }

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      if (padding) {
        const paddingNums = this.toBoxPixelArray(padding, context, font);
        const left = rect.left + paddingNums[3];
        const top = rect.top + paddingNums[0];
        const width = rect.width - paddingNums[1] - paddingNums[3];
        const height = rect.height - paddingNums[0] - paddingNums[2];
        rect = new Rect(left, top, width, height);
      }
      _inlineRect(this._grid, ctx, text, rect, col, row, {
        offset,
        color,
        textAlign,
        textBaseline,
        font,
        textOverflow,
        icons,
      });
    });
  }
  multilineText(
    multilines: string[],
    context: CellContext,
    {
      padding,
      offset = 2,
      color,
      textAlign = "left",
      textBaseline = "middle",
      font,
      lineHeight = "1em",
      autoWrapText = false,
      lineClamp = 0,
      textOverflow = "clip",
      icons,
    }: {
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
      lineHeight?: string | number;
      autoWrapText?: boolean;
      lineClamp?: LineClamp;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    } = {}
  ): void {
    let rect = context.getRect();

    const { col, row } = context;

    if (!color) {
      ({ color } = this.theme);
      // header color
      const isFrozenCell = this._grid.isFrozenCell(col, row);
      if (isFrozenCell && isFrozenCell.row) {
        color = this.theme.frozenRowsColor;
      }
    }

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      if (padding) {
        const paddingNums = this.toBoxPixelArray(padding, context, font);
        const left = rect.left + paddingNums[3];
        const top = rect.top + paddingNums[0];
        const width = rect.width - paddingNums[1] - paddingNums[3];
        const height = rect.height - paddingNums[0] - paddingNums[2];
        rect = new Rect(left, top, width, height);
      }
      const calculator = this.createCalculator(context, font);
      lineHeight = calculator.calcHeight(lineHeight);
      _multiInlineRect(this._grid, ctx, multilines, rect, col, row, {
        offset,
        color,
        textAlign,
        textBaseline,
        font,
        lineHeight,
        autoWrapText,
        lineClamp,
        textOverflow,
        icons,
      });
    });
  }
  fillText(
    text: string,
    x: number,
    y: number,
    context: CellContext,
    {
      color,
      textAlign = "left",
      textBaseline = "top",
      font,
    }: {
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
    } = {}
  ): void {
    const { col, row } = context;

    if (!color) {
      ({ color } = this.theme);
      // header color
      const isFrozenCell = this._grid.isFrozenCell(col, row);
      if (isFrozenCell && isFrozenCell.row) {
        color = this.theme.frozenRowsColor;
      }
    }
    const ctx = context.getContext();
    ctx.save();
    try {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      ctx.fillStyle = getColor(color, col, row, this._grid, ctx);
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;
      ctx.font = font || ctx.font;
      ctx.fillText(text, x, y);
    } finally {
      ctx.restore();
    }
  }
  fillCell(
    context: CellContext,
    {
      fillColor = this.theme.defaultBgColor,
    }: { fillColor?: ColorPropertyDefine } = {}
  ): void {
    const rect = context.getRect();

    this.drawWithClip(context, (ctx) => {
      const { col, row } = context;
      ctx.fillStyle = getColor(fillColor, col, row, this._grid, ctx);

      ctx.beginPath();
      ctx.rect(rect.left, rect.top, rect.width, rect.height);
      ctx.fill();
    });
  }
  fillCellWithState(
    context: CellContext,
    option: { fillColor?: ColorPropertyDefine } = {}
  ): void {
    option.fillColor = this.getFillColorState(context, option);
    this.fillCell(context, option);
  }
  fillRect(
    rect: RectProps,
    context: CellContext,
    {
      fillColor = this.theme.defaultBgColor,
    }: { fillColor?: ColorPropertyDefine } = {}
  ): void {
    const ctx = context.getContext();
    ctx.save();
    try {
      const { col, row } = context;
      ctx.fillStyle = getColor(fillColor, col, row, this._grid, ctx);

      ctx.beginPath();
      ctx.rect(rect.left, rect.top, rect.width, rect.height);
      ctx.fill();
    } finally {
      ctx.restore();
    }
  }
  fillRectWithState(
    rect: RectProps,
    context: CellContext,
    option: { fillColor?: ColorPropertyDefine } = {}
  ): void {
    option.fillColor = this.getFillColorState(context, option);

    this.fillRect(rect, context, option);
  }
  getFillColorState(
    context: CellContext,
    option: { fillColor?: ColorPropertyDefine } = {}
  ): ColorPropertyDefine {
    const sel = context.getSelection();
    const { col, row } = context;
    if (!cellEquals(sel.select, context) && cellInRange(sel.range, col, row)) {
      return this.theme.selectionBgColor;
    }
    if (option.fillColor) {
      return option.fillColor;
    }
    if (cellEquals(sel.select, context)) {
      return this.theme.highlightBgColor;
    }
    const isFrozenCell = this._grid.isFrozenCell(col, row);
    if (isFrozenCell && isFrozenCell.row) {
      return this.theme.frozenRowsBgColor;
    }
    return this.theme.defaultBgColor;
  }
  border(
    context: CellContext,
    {
      borderColor = this.theme.borderColor,
      lineWidth = 1,
    }: { borderColor?: ColorsPropertyDefine; lineWidth?: number } = {}
  ): void {
    const rect = context.getRect();

    this.drawBorderWithClip(context, (ctx) => {
      const { col, row } = context;
      const borderColors = getColor(borderColor, col, row, this._grid, ctx);

      if (lineWidth === 1) {
        ctx.lineWidth = 1;
        strokeRect(
          ctx,
          borderColors,
          rect.left - 0.5,
          rect.top - 0.5,
          rect.width,
          rect.height
        );
      } else if (lineWidth === 2) {
        ctx.lineWidth = 2;
        strokeRect(
          ctx,
          borderColors,
          rect.left,
          rect.top,
          rect.width - 1,
          rect.height - 1
        );
      } else {
        ctx.lineWidth = lineWidth;
        const startOffset = lineWidth / 2 - 1;
        strokeRect(
          ctx,
          borderColors,
          rect.left + startOffset,
          rect.top + startOffset,
          rect.width - lineWidth + 1,
          rect.height - lineWidth + 1
        );
      }
    });
  }
  // Unused in main
  borderWithState(
    context: CellContext,
    option: { borderColor?: ColorsPropertyDefine; lineWidth?: number } = {}
  ): void {
    const rect = context.getRect();
    const sel = context.getSelection();
    const { col, row } = context;

    //罫線
    if (cellEquals(sel.select, context)) {
      option.borderColor = this.theme.highlightBorderColor;
      option.lineWidth = 2;
      this.border(context, option);
    } else {
      // header color
      const isFrozenCell = this._grid.isFrozenCell(col, row);
      if (isFrozenCell?.row) {
        option.borderColor = this.theme.frozenRowsBorderColor;
      }

      option.lineWidth = 1;
      this.border(context, option);

      //追加処理
      const sel = this._grid.selection.select;
      if (sel.col + 1 === col && sel.row === row) {
        //右が選択されている
        this.drawBorderWithClip(context, (ctx) => {
          const borderColors = toBoxArray(
            getColor(
              this.theme.highlightBorderColor,
              sel.col,
              sel.row,
              this._grid,
              ctx
            )
          );
          ctx.lineWidth = 1;
          ctx.strokeStyle = borderColors[1] || ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(rect.left - 0.5, rect.top);
          ctx.lineTo(rect.left - 0.5, rect.bottom);
          ctx.stroke();
        });
      } else if (sel.col === col && sel.row + 1 === row) {
        //上が選択されている
        this.drawBorderWithClip(context, (ctx) => {
          const borderColors = toBoxArray(
            getColor(
              this.theme.highlightBorderColor,
              sel.col,
              sel.row,
              this._grid,
              ctx
            )
          );
          ctx.lineWidth = 1;
          ctx.strokeStyle = borderColors[0] || ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(rect.left, rect.top - 0.5);
          ctx.lineTo(rect.right, rect.top - 0.5);
          ctx.stroke();
        });
      }
    }
  }
  buildCheckBoxInline(
    check: boolean,
    context: CellContext,
    option: {
      animElapsedTime?: number;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      borderColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    } = {}
  ): InlineDrawer {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const ctx = context.getContext();
    const boxWidth = canvashelper.measureCheckbox(ctx).width;
    return new InlineDrawer({
      draw,
      width: boxWidth + 3,
      height: boxWidth + 1,
      color: undefined,
    });

    function draw({
      ctx,
      rect,
      offset,
      offsetLeft,
      offsetRight,
      offsetTop,
      offsetBottom,
    }: InlineDrawOption): void {
      const { col, row } = context;
      drawCheckbox(ctx, rect, col, row, check, self, option, {
        offset: offset + 1,
        padding: {
          left: offsetLeft + 1,
          right: offsetRight,
          top: offsetTop,
          bottom: offsetBottom,
        },
      });
    }
  }
  checkbox(
    check: boolean,
    context: CellContext,
    option: {
      animElapsedTime?: number;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      borderColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    } = {}
  ): void {
    this.drawWithClip(context, (ctx) => {
      const { col, row } = context;
      drawCheckbox(ctx, context.getRect(), col, row, check, this, option);
    });
  }
  radioButton(
    check: boolean,
    context: CellContext,
    option: {
      animElapsedTime?: number;
      checkColor?: ColorPropertyDefine;
      uncheckBorderColor?: ColorPropertyDefine;
      checkBorderColor?: ColorPropertyDefine;
      bgColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    } = {}
  ): void {
    this.drawWithClip(context, (ctx) => {
      const { col, row } = context;
      drawRadioButton(ctx, context.getRect(), col, row, check, this, option);
    });
  }
  button(
    caption: string,
    context: CellContext,
    {
      bgColor = this.theme.button.bgColor,
      padding,
      offset = 2,
      color = this.theme.button.color,
      textAlign = "center",
      textBaseline = "middle",
      shadow,
      font,
      textOverflow = "clip",
      icons,
    }: {
      bgColor?: ColorPropertyDefine;
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      shadow?: canvashelper.DrawButtonOption["shadow"];
      font?: FontPropertyDefine;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    } = {}
  ): void {
    const rect = context.getRect();

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      const { col, row } = context;
      const paddingNums = this.toBoxPixelArray(
        padding || rect.height / 8,
        context,
        font
      );
      const left = rect.left + paddingNums[3];
      const top = rect.top + paddingNums[0];
      const width = rect.width - paddingNums[1] - paddingNums[3];
      const height = rect.height - paddingNums[0] - paddingNums[2];

      bgColor = getColor(bgColor, context.col, context.row, this._grid, ctx);

      canvashelper.drawButton(ctx, left, top, width, height, {
        bgColor,
        radius: rect.height / 8,
        // offset,
        shadow,
      });
      _inlineRect(
        this._grid,
        ctx,
        caption,
        new Rect(left, top, width, height),
        col,
        row,
        {
          offset,
          color,
          textAlign,
          textBaseline,
          font,
          textOverflow,
          icons,
        }
      );
    });
  }
  testFontLoad(
    font: string | undefined,
    value: string,
    context: CellContext
  ): boolean {
    return testFontLoad(font, value, context, this._grid);
  }
}
