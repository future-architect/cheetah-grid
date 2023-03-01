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
    value: unknown,
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
      lineHeight,
      autoWrapText,
      lineClamp,
      multiline,
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }
    const textValue = value != null ? String(value) : "";
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      if (multiline) {
        const multilines = textValue
          .replace(/\r?\n/g, "\n")
          .replace(/\r/g, "\n")
          .split("\n");
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
      } else {
        helper.text(textValue, context, {
          textAlign,
          textBaseline,
          color,
          font,
          padding,
          textOverflow,
          icons,
        });
      }
    });
  }
}
