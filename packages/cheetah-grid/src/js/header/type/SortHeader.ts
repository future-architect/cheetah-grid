import * as utils from "../../columns/type/columnUtils";
import type { CellContext, ListGridAPI, SortState } from "../../ts-types";
import { BaseHeader } from "./BaseHeader";
import type { DrawCellInfo } from "../../ts-types-internal";
import type { GridCanvasHelper } from "../../GridCanvasHelper";
import { SortHeaderStyle } from "../style/SortHeaderStyle";
import { cellInRange } from "../../internal/utils";
import { getFontSize } from "../../internal/canvases";

export class SortHeader<T> extends BaseHeader<T> {
  get StyleClass(): typeof SortHeaderStyle {
    return SortHeaderStyle;
  }
  drawInternal(
    value: unknown,
    context: CellContext,
    style: SortHeaderStyle,
    helper: GridCanvasHelper<T>,
    grid: ListGridAPI<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline = "middle",
      color,
      bgColor,
      font,
      padding,
      textOverflow,
      lineHeight,
      autoWrapText,
      lineClamp,
      sortArrowColor,
      multiline,
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

    const textValue = value != null ? String(value) : "";
    helper.testFontLoad(font, textValue, context);
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      const state = grid.sortState as SortState;
      let order = undefined;
      const { col, row } = context;
      const range = grid.getCellRange(col, row);
      if (cellInRange(range, state.col, state.row)) {
        ({ order } = state);
      }

      const ctx = context.getContext();
      const arrowSize = getFontSize(ctx, font).width * 1.2;

      const trailingIcon = {
        name:
          order != null
            ? order === "asc"
              ? "arrow_downward"
              : "arrow_upward"
            : undefined,
        width: arrowSize,
        color:
          helper.getColor(
            sortArrowColor || helper.theme.header.sortArrowColor,
            col,
            row,
            ctx
          ) || "rgba(0, 0, 0, 0.38)",
      };

      if (multiline) {
        const lines = textValue
          .replace(/\r?\n/g, "\n")
          .replace(/\r/g, "\n")
          .split("\n");
        helper.multilineText(lines, context, {
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
          trailingIcon,
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
          trailingIcon,
        });
      }
    });
  }
}
