import type { CellContext, GridCanvasHelperAPI } from "../../ts-types";
import type { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { BaseColumn } from "./BaseColumn";
import { CheckStyle } from "../style/CheckStyle";
import { getCheckColumnStateId } from "../../internal/symbolManager";
import { toBoolean } from "../utils";

const CHECK_COLUMN_STATE_ID = getCheckColumnStateId();

export class CheckColumn<T> extends BaseColumn<T, boolean> {
  get StyleClass(): typeof CheckStyle {
    return CheckStyle;
  }
  clone(): CheckColumn<T> {
    return new CheckColumn(this);
  }
  convertInternal(value: unknown): boolean {
    return toBoolean(value);
  }
  drawInternal(
    value: boolean,
    context: CellContext,
    style: CheckStyle,
    helper: GridCanvasHelperAPI,
    grid: GridInternal<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor,
      bgColor,
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    const cellKey = `${range.start.col}:${range.start.row}`;
    const elapsed = grid[CHECK_COLUMN_STATE_ID]?.elapsed[cellKey];

    const opt: Parameters<GridCanvasHelperAPI["checkbox"]>[2] = {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor,
    };
    if (elapsed != null) {
      opt.animElapsedTime = elapsed;
    }
    helper.checkbox(value, context, opt);
  }
}
