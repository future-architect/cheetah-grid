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
  TreeBranchIconStyleDefine,
  TreeLineStyle,
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
import type { PaddingOption } from "./internal/canvases";
import type { RGBA } from "./internal/color";
import { Rect } from "./internal/Rect";
import type { SimpleColumnIconOption } from "./ts-types-internal";
import { colorToRGB } from "./internal/color";

const { toBoxArray } = style;

const INLINE_ELLIPSIS = inlineUtils.of("\u2026");

const TEXT_OFFSET = 2;
const CHECKBOX_OFFSET = TEXT_OFFSET + 1;

type ColorsDef = ColorDef | (ColorDef | null)[];

function invalidateCell<T>(context: CellContext, grid: ListGridAPI<T>): void {
  const { col, row } = context;
  grid.invalidateCell(col, row);
}
function getStyleProperty<T>(
  color: ColorPropertyDefine,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorDef;
function getStyleProperty<T>(
  color: ColorsPropertyDefine,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorsDef;
function getStyleProperty<T>(
  color: undefined,
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): undefined;
function getStyleProperty<T, P>(
  style: P | ((args: StylePropertyFunctionArg) => P),
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): P;
function getStyleProperty<T, P>(
  color:
    | ColorPropertyDefine
    | ColorsPropertyDefine
    | undefined
    | P
    | ((args: StylePropertyFunctionArg) => P),
  col: number,
  row: number,
  grid: ListGridAPI<T>,
  context: CanvasRenderingContext2D
): ColorDef | ColorsDef | undefined | P {
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
function getThemeValue<R, T>(grid: ListGridAPI<R>, ...names: string[]): T {
  const gridThemeValue = getChainSafe(grid.theme, ...names);
  if (gridThemeValue == null) {
    // use default theme
    return getChainSafe(themes.getDefault(), ...names);
  }
  if (typeof gridThemeValue !== "function") {
    return gridThemeValue;
  }
  let defaultThemeValue: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((args: StylePropertyFunctionArg): any => {
    const value = gridThemeValue(args);
    if (value != null) {
      // use grid theme
      return value;
    }
    // use default theme
    defaultThemeValue =
      defaultThemeValue || getChainSafe(themes.getDefault(), ...names);
    return getOrApply(defaultThemeValue, args);
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
        ctx.fillStyle = getStyleProperty(
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
  inline: string | (Inline | string)[]
): Inline[] {
  return inlineUtils.buildInlines(icons, inline || "");
}

function inlineToString(inline: Inline | string | (Inline | string)[]): string {
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
  inline: string | (Inline | string)[],
  drawRect: RectProps,
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
    trailingIcon,
  }: {
    offset: number;
    color?: ColorPropertyDefine;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    font?: string;
    textOverflow?: TextOverflow;
    icons?: SimpleColumnIconOption[];
    trailingIcon?: SimpleColumnIconOption;
  }
): void {
  //文字style
  ctx.fillStyle = getStyleProperty(color || ctx.fillStyle, col, row, grid, ctx);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font || ctx.font;

  let inlines = buildInlines(icons, inline);
  const trailingIconInline = trailingIcon
    ? inlineUtils.iconOf(trailingIcon)
    : null;

  let inlineDrawRect = drawRect;
  let { width } = drawRect;
  let trailingIconWidth = 0;
  if (trailingIconInline) {
    trailingIconWidth = trailingIconInline.width({ ctx });
    width -= trailingIconWidth;
    inlineDrawRect = new Rect(
      drawRect.left,
      drawRect.top,
      width,
      drawRect.height
    );
  }

  if (isAllowOverflow(textOverflow) && isOverflowInlines(ctx, inlines, width)) {
    const { inlines: truncInlines, overflow } = truncateInlines(
      ctx,
      inlines,
      width,
      textOverflow
    );
    inlines = truncInlines;
    grid.setCellOverflowText(col, row, overflow && inlineToString(inline));
  } else {
    grid.setCellOverflowText(col, row, false);
  }

  drawInlines(ctx, inlines, inlineDrawRect, offset, 0, 0, col, row, grid);

  if (trailingIconInline) {
    // Draw trailing icon
    let sumWidth = 0;
    inlines.forEach((inline) => {
      sumWidth += inline.width({ ctx });
    });
    const baseRect = new Rect(
      drawRect.left,
      drawRect.top,
      drawRect.width,
      drawRect.height
    );
    const trailingIconRect = baseRect.copy();
    if (width < sumWidth) {
      trailingIconRect.left =
        trailingIconRect.right - trailingIconWidth - offset;
    } else {
      trailingIconRect.left += sumWidth;
    }
    trailingIconRect.right = baseRect.right;
    drawInlines(
      ctx,
      [trailingIconInline],
      trailingIconRect,
      offset,
      0,
      0,
      col,
      row,
      grid
    );
  }
}

// eslint-disable-next-line complexity
function _multiInlineRect<T>(
  grid: ListGridAPI<T>,
  ctx: CanvasRenderingContext2D,
  multiInlines: string[],
  drawRect: RectProps,
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
    trailingIcon,
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
    trailingIcon?: SimpleColumnIconOption;
  }
): void {
  //文字style
  ctx.fillStyle = getStyleProperty(color || ctx.fillStyle, col, row, grid, ctx);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font || ctx.font;

  if (lineClamp === "auto") {
    const rectHeight =
      drawRect.height - offset * 2 - 2; /*offset added by Inline#draw*/
    lineClamp = Math.max(Math.floor(rectHeight / lineHeight), 1);
  }

  const trailingIconInline = trailingIcon
    ? inlineUtils.iconOf(trailingIcon)
    : null;
  let { width } = drawRect;
  let trailingIconWidth = 0;
  if (trailingIconInline) {
    trailingIconWidth = trailingIconInline.width({ ctx });
    width -= trailingIconWidth;
  }

  let buildedMultiInlines: Inline[][];
  if (autoWrapText || lineClamp > 0 || isAllowOverflow(textOverflow)) {
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
      drawRect,
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

  if (trailingIconInline) {
    // Draw trailing icon
    let maxWidth = 0;
    buildedMultiInlines.forEach((buildedInline) => {
      let sumWidth = 0;
      buildedInline.forEach((inline) => {
        sumWidth += inline.width({ ctx });
      });
      maxWidth = Math.max(maxWidth, sumWidth);
    });

    const baseRect = new Rect(
      drawRect.left,
      drawRect.top,
      drawRect.width,
      drawRect.height
    );
    const trailingIconRect = baseRect.copy();
    if (width < maxWidth) {
      trailingIconRect.left =
        trailingIconRect.right - trailingIconWidth - offset;
    } else {
      trailingIconRect.left += maxWidth;
    }
    trailingIconRect.right = baseRect.right;
    drawInlines(
      ctx,
      [trailingIconInline],
      trailingIconRect,
      offset,
      0,
      0,
      col,
      row,
      grid
    );
  }
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
  positionOpt: {
    offset?: number;
    padding?: PaddingOption;
  } = {}
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
  private _tree: RequiredThemeDefine["tree"] | null = null;
  private _header: RequiredThemeDefine["header"] | null = null;
  private _messages: RequiredThemeDefine["messages"] | null = null;
  private _indicators: RequiredThemeDefine["indicators"] | null = null;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
  }
  getThemeValue<
    T extends ColorPropertyDefine | ColorsPropertyDefine | FontPropertyDefine
  >(...name: string[]): T {
    return getThemeValue(this._grid, ...name);
  }
  get font(): string {
    return getThemeValue(this._grid, "font");
  }
  get underlayBackgroundColor(): string {
    return getThemeValue(this._grid, "underlayBackgroundColor");
  }
  // color
  get color(): ColorPropertyDefine {
    return getThemeValue(this._grid, "color");
  }
  get frozenRowsColor(): ColorPropertyDefine {
    return getThemeValue(this._grid, "frozenRowsColor");
  }
  // background
  get defaultBgColor(): ColorPropertyDefine {
    return getThemeValue(this._grid, "defaultBgColor");
  }
  get frozenRowsBgColor(): ColorPropertyDefine {
    return getThemeValue(this._grid, "frozenRowsBgColor");
  }
  get selectionBgColor(): ColorPropertyDefine {
    return getThemeValue(this._grid, "selectionBgColor");
  }
  get highlightBgColor(): ColorPropertyDefine {
    return getThemeValue(this._grid, "highlightBgColor");
  }
  // border
  get borderColor(): ColorsPropertyDefine {
    return getThemeValue(this._grid, "borderColor");
  }
  get frozenRowsBorderColor(): ColorsPropertyDefine {
    return getThemeValue(this._grid, "frozenRowsBorderColor");
  }
  get highlightBorderColor(): ColorsPropertyDefine {
    return getThemeValue(this._grid, "highlightBorderColor");
  }
  get checkbox(): RequiredThemeDefine["checkbox"] {
    const grid = this._grid;
    return (
      this._checkbox ||
      (this._checkbox = {
        get uncheckBgColor(): ColorPropertyDefine {
          return getCheckboxProp("uncheckBgColor");
        },
        get checkBgColor(): ColorPropertyDefine {
          return getCheckboxProp("checkBgColor");
        },
        get borderColor(): ColorPropertyDefine {
          return getCheckboxProp("borderColor");
        },
      })
    );

    function getCheckboxProp(prop: string): ColorPropertyDefine {
      return getThemeValue(grid, "checkbox", prop);
    }
  }
  get radioButton(): RequiredThemeDefine["radioButton"] {
    const grid = this._grid;
    return (
      this._radioButton ||
      (this._radioButton = {
        get checkColor(): ColorPropertyDefine {
          return getRadioButtonProp("checkColor");
        },
        get uncheckBorderColor(): ColorPropertyDefine {
          return getRadioButtonProp("uncheckBorderColor");
        },
        get checkBorderColor(): ColorPropertyDefine {
          return getRadioButtonProp("checkBorderColor");
        },
        get uncheckBgColor(): ColorPropertyDefine {
          return getRadioButtonProp("uncheckBgColor");
        },
        get checkBgColor(): ColorPropertyDefine {
          return getRadioButtonProp("checkBgColor");
        },
      })
    );

    function getRadioButtonProp(prop: string): ColorPropertyDefine {
      return getThemeValue(grid, "radioButton", prop);
    }
  }
  get button(): RequiredThemeDefine["button"] {
    const grid = this._grid;
    return (
      this._button ||
      (this._button = {
        get color(): ColorPropertyDefine {
          return getButtonProp("color");
        },
        get bgColor(): ColorPropertyDefine {
          return getButtonProp("bgColor");
        },
      })
    );

    function getButtonProp(prop: string): ColorPropertyDefine {
      return getThemeValue(grid, "button", prop);
    }
  }
  get tree(): RequiredThemeDefine["tree"] {
    const grid = this._grid;
    return (
      this._tree ||
      (this._tree = {
        get lineStyle(): TreeLineStyle {
          return getTreeProp("lineStyle");
        },
        get lineColor(): ColorPropertyDefine {
          return getTreeProp("lineColor");
        },
        get lineWidth(): number {
          return getTreeProp("lineWidth");
        },
        get treeIcon(): TreeBranchIconStyleDefine {
          return getTreeProp("treeIcon");
        },
      })
    );

    function getTreeProp<
      T extends
        | ColorPropertyDefine
        | number
        | TreeLineStyle
        | TreeBranchIconStyleDefine
    >(prop: string): T {
      return getThemeValue(grid, "tree", prop);
    }
  }
  get header(): RequiredThemeDefine["header"] {
    const grid = this._grid;
    return (
      this._header ||
      (this._header = {
        get sortArrowColor(): ColorPropertyDefine {
          return getThemeValue(grid, "header", "sortArrowColor");
        },
      })
    );
  }
  get messages(): RequiredThemeDefine["messages"] {
    const grid = this._grid;
    return (
      this._messages ||
      (this._messages = {
        get infoBgColor(): ColorPropertyDefine {
          return getMessageProp("infoBgColor");
        },
        get errorBgColor(): ColorPropertyDefine {
          return getMessageProp("errorBgColor");
        },
        get warnBgColor(): ColorPropertyDefine {
          return getMessageProp("warnBgColor");
        },
        get boxWidth(): number {
          return getMessageProp("boxWidth");
        },
        get markHeight(): number {
          return getMessageProp("markHeight");
        },
      })
    );

    function getMessageProp<T extends ColorPropertyDefine | number>(
      prop: string
    ): T {
      return getThemeValue(grid, "messages", prop);
    }
  }
  get indicators(): RequiredThemeDefine["indicators"] {
    const grid = this._grid;
    return (
      this._indicators ||
      (this._indicators = {
        get topLeftColor(): ColorPropertyDefine {
          return getIndicatorsProp("topLeftColor");
        },
        get topLeftSize(): number {
          return getIndicatorsProp("topLeftSize");
        },
        get topRightColor(): ColorPropertyDefine {
          return getIndicatorsProp("topRightColor");
        },
        get topRightSize(): number {
          return getIndicatorsProp("topRightSize");
        },
        get bottomRightColor(): ColorPropertyDefine {
          return getIndicatorsProp("bottomRightColor");
        },
        get bottomRightSize(): number {
          return getIndicatorsProp("bottomRightSize");
        },
        get bottomLeftColor(): ColorPropertyDefine {
          return getIndicatorsProp("bottomLeftColor");
        },
        get bottomLeftSize(): number {
          return getIndicatorsProp("bottomLeftSize");
        },
      })
    );

    function getIndicatorsProp<T extends ColorPropertyDefine | number>(
      prop: string
    ): T {
      return getThemeValue(grid, "indicators", prop);
    }
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

function getPaddedRect(
  rect: RectProps,
  padding: number | string | (number | string)[] | undefined,
  font: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  helper: GridCanvasHelper<any>,
  context: CellContext
) {
  if (!padding) {
    return rect;
  }
  const {
    0: pTop,
    1: pRight,
    2: pBottom,
    3: pLeft,
  } = helper.toBoxPixelArray(padding, context, font);
  const left = rect.left + pLeft;
  const top = rect.top + pTop;
  const width = rect.width - pRight - pLeft;
  const height = rect.height - pTop - pBottom;
  return new Rect(left, top, width, height);
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
    return getStyleProperty(color, col, row, this._grid, ctx);
  }
  getStyleProperty<T>(
    style: T | ((args: StylePropertyFunctionArg) => T),
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): T {
    return getStyleProperty(style, col, row, this._grid, ctx);
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
    text: string | (Inline | string)[],
    context: CellContext,
    {
      padding,
      offset = TEXT_OFFSET,
      color,
      textAlign = "left",
      textBaseline = "middle",
      font,
      textOverflow = "clip",
      icons,
      trailingIcon,
    }: {
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
      trailingIcon?: SimpleColumnIconOption;
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

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      const rect = getPaddedRect(
        context.getRect(),
        padding,
        font,
        this,
        context
      );
      _inlineRect(this._grid, ctx, text, rect, col, row, {
        offset,
        color,
        textAlign,
        textBaseline,
        font,
        textOverflow,
        icons,
        trailingIcon,
      });
    });
  }
  multilineText(
    lines: string[],
    context: CellContext,
    {
      padding,
      offset = TEXT_OFFSET,
      color,
      textAlign = "left",
      textBaseline = "middle",
      font,
      lineHeight = "1em",
      autoWrapText = false,
      lineClamp = 0,
      textOverflow = "clip",
      icons,
      trailingIcon,
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
      trailingIcon?: SimpleColumnIconOption;
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

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      const rect = getPaddedRect(
        context.getRect(),
        padding,
        font,
        this,
        context
      );
      const calculator = this.createCalculator(context, font);
      lineHeight = calculator.calcHeight(lineHeight);
      _multiInlineRect(this._grid, ctx, lines, rect, col, row, {
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
        trailingIcon,
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
      ctx.fillStyle = getStyleProperty(color, col, row, this._grid, ctx);
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
      ctx.fillStyle = getStyleProperty(fillColor, col, row, this._grid, ctx);

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
      ctx.fillStyle = getStyleProperty(fillColor, col, row, this._grid, ctx);

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
      const borderColors = getStyleProperty(
        borderColor,
        col,
        row,
        this._grid,
        ctx
      );

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
            getStyleProperty(
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
            getStyleProperty(
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
    option: Parameters<GridCanvasHelperAPI["buildCheckBoxInline"]>[2] = {}
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
        offset: offset + (CHECKBOX_OFFSET - TEXT_OFFSET),
        padding: {
          left: offsetLeft + (CHECKBOX_OFFSET - TEXT_OFFSET),
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
    {
      padding,
      animElapsedTime,
      offset = CHECKBOX_OFFSET,
      uncheckBgColor,
      checkBgColor,
      borderColor,
      textAlign,
      textBaseline,
    }: Parameters<GridCanvasHelperAPI["checkbox"]>[2] = {}
  ): void {
    this.drawWithClip(context, (ctx) => {
      const { col, row } = context;
      drawCheckbox(
        ctx,
        getPaddedRect(
          context.getRect(),
          padding,
          undefined /* font */,
          this,
          context
        ),
        col,
        row,
        check,
        this,
        {
          animElapsedTime,
          uncheckBgColor,
          checkBgColor,
          borderColor,
          textAlign,
          textBaseline,
        },
        { offset, padding: { left: CHECKBOX_OFFSET - TEXT_OFFSET } }
      );
    });
  }
  radioButton(
    check: boolean,
    context: CellContext,
    {
      padding,
      animElapsedTime,
      offset = CHECKBOX_OFFSET,
      checkColor,
      uncheckBorderColor,
      checkBorderColor,
      uncheckBgColor,
      checkBgColor,
      textAlign,
      textBaseline,
    }: Parameters<GridCanvasHelperAPI["radioButton"]>[2] = {}
  ): void {
    this.drawWithClip(context, (ctx) => {
      const { col, row } = context;
      drawRadioButton(
        ctx,
        getPaddedRect(
          context.getRect(),
          padding,
          undefined /* font */,
          this,
          context
        ),
        col,
        row,
        check,
        this,
        {
          animElapsedTime,
          checkColor,
          uncheckBorderColor,
          checkBorderColor,
          uncheckBgColor,
          checkBgColor,
          textAlign,
          textBaseline,
        },
        { offset, padding: { left: CHECKBOX_OFFSET - TEXT_OFFSET } }
      );
    });
  }
  button(
    caption: string,
    context: CellContext,
    {
      bgColor = this.theme.button.bgColor,
      padding,
      offset = TEXT_OFFSET,
      color = this.theme.button.color,
      textAlign = "center",
      textBaseline = "middle",
      shadow,
      font,
      textOverflow = "clip",
      icons,
    }: Parameters<GridCanvasHelperAPI["button"]>[2] = {}
  ): void {
    const rect = context.getRect();

    this.drawWithClip(context, (ctx) => {
      font = getFont(font, context.col, context.row, this._grid, ctx);
      const { col, row } = context;
      const { left, top, width, height } = getPaddedRect(
        rect,
        padding || rect.height / 8,
        font,
        this,
        context
      );

      bgColor = getStyleProperty(
        bgColor,
        context.col,
        context.row,
        this._grid,
        ctx
      );

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
