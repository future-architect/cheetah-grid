import * as utils from "../../columns/type/columnUtils";
import type { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { BaseHeader } from "./BaseHeader";
import type { CellContext } from "../../ts-types";
import type { GridCanvasHelper } from "../../GridCanvasHelper";
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
    helper: GridCanvasHelper<T>,
    _grid: GridInternal<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
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
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      helper.multilineText(multilines, context, {
        textAlign,
        textBaseline,
        color,
        font,
        lineHeight,
        autoWrapText,
        lineClamp,
        textOverflow,
        icons,
      });
    });
  }
}
