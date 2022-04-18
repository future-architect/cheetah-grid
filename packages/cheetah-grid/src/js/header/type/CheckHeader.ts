import * as inlineUtils from "../../element/inlines";
import * as utils from "../../columns/type/columnUtils";
import type { CellContext, ColorPropertyDefine } from "../../ts-types";
import type {
  CheckHeaderState,
  DrawCellInfo,
  GridInternal,
} from "../../ts-types-internal";
import { BaseHeader } from "./BaseHeader";
import { CheckHeaderStyle } from "../style/CheckHeaderStyle";
import type { GridCanvasHelper } from "../../GridCanvasHelper";
import type { Inline } from "../../element/Inline";
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
    value: unknown,
    context: CellContext,
    style: CheckHeaderStyle,
    helper: GridCanvasHelper<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grid: GridInternal<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      borderColor,
      checkBgColor,
      uncheckBgColor,
      bgColor,
      padding,
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

    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      let contents: Inline[] = [inlineCheck];
      contents = contents.concat(
        inlineUtils.buildInlines(icons, value != null ? String(value) : "")
      );
      helper.text(contents, context, {
        textAlign,
        textBaseline,
        color,
        font,
        padding,
        textOverflow,
      });
    });
  }
}
