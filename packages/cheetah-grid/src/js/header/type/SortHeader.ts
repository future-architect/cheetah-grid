import * as inlineUtils from "../../element/inlines";
import * as utils from "../../columns/type/columnUtils";
import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
  SortState,
} from "../../ts-types";
import { BaseHeader } from "./BaseHeader";
import type { DrawCellInfo } from "../../ts-types-internal";
import { SortHeaderStyle } from "../style/SortHeaderStyle";
import { cellInRange } from "../../internal/utils";
import { getFontSize } from "../../internal/canvases";

export class SortHeader<T> extends BaseHeader<T> {
  get StyleClass(): typeof SortHeaderStyle {
    return SortHeaderStyle;
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: SortHeaderStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline = "middle",
      color,
      bgColor,
      font,
      textOverflow,
      sortArrowColor,
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

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

      const textInline = inlineUtils.buildInlines(null, value);
      const inlineIcon = inlineUtils.iconOf({
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
      });

      const inlines = textInline.concat([inlineIcon]);
      const inlinesWidth = helper.measureText(inlines, context, {
        font,
        icons,
      });
      const rect = context.getRect();
      if (inlinesWidth <= rect.width - 4 /* system padding */) {
        helper.text(inlines, context, {
          textAlign,
          textBaseline,
          color,
          font,
          textOverflow,
          icons,
        });
      } else {
        // !! Draw the icon first to leave the result of `setCellOverflowText`.
        helper.text([inlineIcon], context, {
          textAlign: "right",
          textBaseline,
          color,
          font,
        });
        helper.text(textInline, context, {
          padding: [0, arrowSize, 0, 0],
          textAlign,
          textBaseline,
          color,
          font,
          textOverflow,
          icons,
        });
      }
    });
  }
}
