import * as messageUtils from "./messageUtils";
import type {
  CellContext,
  ColumnStyle,
  GridCanvasHelperAPI,
  ListGridAPI,
  MessageObject,
} from "../../ts-types";
import { BaseMessage } from "./BaseMessage";
import type { DrawCellInfo } from "../../ts-types-internal";
import { ErrorMessageElement } from "./internal/ErrorMessageElement";
import { cellInRange } from "../../internal/utils";

const RED_A100 = "#ff8a80";

export class ErrorMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): ErrorMessageElement {
    return new ErrorMessageElement();
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
        (ctx: CanvasRenderingContext2D): void => {
          messageUtils.drawExclamationMarkBox(
            context,
            {
              bgColor:
                helper.getColor(
                  helper.theme.messages.errorBgColor,
                  context.col,
                  context.row,
                  ctx
                ) || RED_A100,
              color: bgColor,
            },
            helper
          );
        }
      );
    }
  }
}
