import type { CellContext, GridCanvasHelperAPI } from "../../ts-types";
import type { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { BaseHeader } from "./BaseHeader";
import { MultilineTextHeaderStyle } from "../style/MultilineTextHeaderStyle";

export class MultilineTextHeader<T> extends BaseHeader<T> {
  get StyleClass(): typeof MultilineTextHeaderStyle {
    return MultilineTextHeaderStyle;
  }
  clone(): MultilineTextHeader<T> {
    return new MultilineTextHeader(this);
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: MultilineTextHeaderStyle,
    helper: GridCanvasHelperAPI,
    _grid: GridInternal<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      color,
      font,
      bgColor,
      lineHeight,
      autoWrapText,
      lineClamp,
      textOverflow,
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }
    const multilines = value
      .replace(/\r?\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
    helper.testFontLoad(font, value, context);
    helper.multilineText(multilines, context, {
      textAlign,
      textBaseline,
      color,
      font,
      lineHeight,
      autoWrapText,
      lineClamp,
      textOverflow,
    });
  }
}
