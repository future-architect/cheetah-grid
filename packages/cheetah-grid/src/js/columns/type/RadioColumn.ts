import type { CellContext, GridCanvasHelperAPI } from "../../ts-types";
import type { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { BaseColumn } from "./BaseColumn";
import { RadioStyle } from "../style/RadioStyle";
import { getRadioColumnStateId } from "../../internal/symbolManager";
import { toBoolean } from "../utils";

const RADIO_COLUMN_STATE_ID = getRadioColumnStateId();

export class RadioColumn<T> extends BaseColumn<T> {
  get StyleClass(): typeof RadioStyle {
    return RadioStyle;
  }
  clone(): RadioColumn<T> {
    return new RadioColumn(this);
  }
  convertInternal(value: unknown): boolean {
    return toBoolean(value);
  }
  drawInternal(
    value: boolean,
    context: CellContext,
    style: RadioStyle,
    helper: GridCanvasHelperAPI,
    grid: GridInternal<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      padding,
      checkColor,
      uncheckBorderColor,
      checkBorderColor,
      uncheckBgColor,
      checkBgColor,
      bgColor,
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

    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    const cellKey = `${range.start.col}:${range.start.row}`;
    const elapsed = grid[RADIO_COLUMN_STATE_ID]?.elapsed[cellKey];

    const opt: Parameters<GridCanvasHelperAPI["radioButton"]>[2] = {
      textAlign,
      textBaseline,
      checkColor,
      uncheckBorderColor,
      checkBorderColor,
      uncheckBgColor,
      checkBgColor,
      padding,
    };
    if (elapsed != null) {
      opt.animElapsedTime = elapsed;
    }
    helper.radioButton(value, context, opt);
  }
}
