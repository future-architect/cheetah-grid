import { CellContext, GridCanvasHelper } from "../../ts-types";
import { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { BaseColumn } from "./BaseColumn";
import { CheckStyle } from "../style/CheckStyle";
import { getCheckColumnStateId } from "../../internal/symbolManager";
import { isDef } from "../../internal/utils";

const CHECK_COLUMN_STATE_ID = getCheckColumnStateId();

function toBoolean(val: unknown): boolean {
  if (typeof val === "string") {
    if (val === "false") {
      return false;
    } else if (val === "off") {
      return false;
    } else if (val.match(/^0+$/)) {
      return false;
    }
  }
  return Boolean(val);
}

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
    helper: GridCanvasHelper,
    grid: GridInternal<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor,
      bgColor
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor
      });
    }

    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    const cellKey = `${range.start.col}:${range.start.row}`;
    const elapsed = grid[CHECK_COLUMN_STATE_ID]?.elapsed[cellKey];

    const opt: Parameters<GridCanvasHelper["checkbox"]>[2] = {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor
    };
    if (isDef(elapsed)) {
      opt.animElapsedTime = elapsed;
    }
    helper.checkbox(value, context, opt);
  }
}
