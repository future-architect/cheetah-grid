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
    { drawCellBase }: DrawCellInfo<T>
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

    const state = grid.sortState as SortState;
    let order = undefined;
    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    if (cellInRange(range, state.col, state.row)) {
      ({ order } = state);
    }

    const ctx = context.getContext();
    const arrowSize = getFontSize(ctx, font).width * 1.2;

    helper.text(value, context, {
      textAlign,
      textBaseline,
      color,
      font,
      textOverflow,
      icons: [
        {
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
        },
      ],
    });
  }
}
