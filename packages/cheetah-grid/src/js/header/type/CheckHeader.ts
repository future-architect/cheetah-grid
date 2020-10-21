import type {
  CellContext,
  ColorPropertyDefine,
  GridCanvasHelperAPI,
} from "../../ts-types";
import type {
  CheckHeaderState,
  DrawCellInfo,
  GridInternal,
} from "../../ts-types-internal";
import { BaseHeader } from "./BaseHeader";
import { CheckHeaderStyle } from "../style/CheckHeaderStyle";
import { getCheckHeaderStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";

const CHECK_HEADER_STATE_ID = getCheckHeaderStateId();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getState<T>(grid: GridInternal<T>): CheckHeaderState {
  let state = grid[CHECK_HEADER_STATE_ID];
  if (!state) {
    state = { elapsed: {}, block: {} };
    obj.setReadonly(grid, CHECK_HEADER_STATE_ID, state);
  }
  return state;
}
export class CheckHeader<T> extends BaseHeader<T> {
  get StyleClass(): typeof CheckHeaderStyle {
    return CheckHeaderStyle;
  }
  clone(): CheckHeader<T> {
    return new CheckHeader(this);
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: CheckHeaderStyle,
    helper: GridCanvasHelperAPI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      color,
      font,
      textOverflow,
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    const cellKey = `${range.start.col}:${range.start.row}`;
    const {
      elapsed: { [cellKey]: elapsed },
    } = getState(grid);

    const checked = grid.getHeaderValue(range.start.col, range.start.row);

    const opt: {
      animElapsedTime?: number;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      borderColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    } = {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor,
    };
    if (elapsed != null) {
      opt.animElapsedTime = elapsed;
    }
    const inlineCheck = helper.buildCheckBoxInline(!!checked, context, opt);

    helper.text([inlineCheck, value], context, {
      textAlign,
      textBaseline,
      color,
      font,
      textOverflow,
    });
  }
}
