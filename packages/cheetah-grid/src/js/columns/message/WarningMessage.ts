import * as messageUtils from "./messageUtils";
import {
  CellContext,
  ColumnStyle,
  GridCanvasHelperAPI,
  ListGridAPI,
  MessageObject
} from "../../ts-types";
import { BaseMessage } from "./BaseMessage";
import { DrawCellInfo } from "../../ts-types-internal";
import { WarningMessageElement } from "./internal/WarningMessageElement";
import { cellInRange } from "../../internal/utils";

const DEEP_ORANGE_A100 = "#ff9e80";

export class WarningMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): WarningMessageElement {
    return new WarningMessageElement();
  }
  drawCellMessageInternal(
    _message: MessageObject,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    _info: DrawCellInfo<T>
  ): void {
    const { bgColor } = style;
    const { select } = context.getSelection();
    if (
      !cellInRange(
        grid.getCellRange(context.col, context.row),
        select.col,
        select.row
      ) ||
      !grid.hasFocusGrid()
    ) {
      helper.drawBorderWithClip(
        context,
        (_ctx: CanvasRenderingContext2D): void => {
          messageUtils.drawExclamationMarkBox(
            context,
            {
              bgColor: DEEP_ORANGE_A100,
              color: bgColor
            },
            helper
          );
        }
      );
    }
  }
}
