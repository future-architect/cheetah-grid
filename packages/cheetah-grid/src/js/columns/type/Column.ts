import * as utils from "./columnUtils";
import type {
  CellContext,
  DrawCellInfo,
  GridCanvasHelperAPI,
  ListGridAPI,
} from "../../ts-types";
import { BaseColumn } from "./BaseColumn";
import { Style } from "../style/Style";

export class Column<T> extends BaseColumn<T> {
  get StyleClass(): typeof Style {
    return Style;
  }
  clone(): Column<T> {
    return new Column(this);
  }
  drawInternal(
    value: unknown,
    context: CellContext,
    style: Style,
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
      textOverflow,
      visibility,
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }
    if (visibility === "hidden") {
      return;
    }
    const textValue = value != null ? String(value) : "";
    helper.testFontLoad(font, textValue, context);
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      helper.text(textValue, context, {
        textAlign,
        textBaseline,
        color,
        font,
        padding,
        textOverflow,
        icons,
      });
    });
  }
}
