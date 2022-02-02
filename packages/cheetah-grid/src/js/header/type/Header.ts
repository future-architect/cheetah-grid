import * as utils from "../../columns/type/columnUtils";
import type { CellContext, ListGridAPI } from "../../ts-types";
import { BaseHeader } from "./BaseHeader";
import type { DrawCellInfo } from "../../ts-types-internal";
import type { GridCanvasHelper } from "../../GridCanvasHelper";
import { Style } from "../style/Style";

export class Header<T> extends BaseHeader<T> {
  get StyleClass(): typeof Style {
    return Style;
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: Style,
    helper: GridCanvasHelper<T>,
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
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      helper.text(value, context, {
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
