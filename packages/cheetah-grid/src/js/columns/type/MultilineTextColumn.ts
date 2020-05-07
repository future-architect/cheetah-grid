import * as utils from "./columnUtils";
import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
} from "../../ts-types";
import { BaseColumn } from "./BaseColumn";
import type { DrawCellInfo } from "../../ts-types-internal";
import { MultilineTextStyle } from "../style/MultilineTextStyle";

export class MultilineTextColumn<T> extends BaseColumn<T, string> {
  constructor(option = {}) {
    super(option);
  }
  get StyleClass(): typeof MultilineTextStyle {
    return MultilineTextStyle;
  }
  clone(): MultilineTextColumn<T> {
    return new MultilineTextColumn(this);
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: MultilineTextStyle,
    helper: GridCanvasHelperAPI,
    _grid: ListGridAPI<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      color,
      font,
      bgColor,
      padding,
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
        padding,
        lineHeight,
        autoWrapText,
        lineClamp,
        textOverflow,
        icons,
      });
    });
  }
}
