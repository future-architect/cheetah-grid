import * as messageUtils from "./messageUtils";
import {
  CellContext,
  ColumnStyle,
  GridCanvasHelper,
  MessageObject
} from "../../ts-types";
import { BaseMessage } from "./BaseMessage";
import { DrawCellInfo } from "../../ts-types-internal";
import { ErrorMessageElement } from "./internal/ErrorMessageElement";
import { ListGrid } from "../../main";

const RED_A100 = "#ff8a80";

export class ErrorMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): ErrorMessageElement {
    return new ErrorMessageElement();
  }
  drawCellMessageInternal(
    _message: MessageObject,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelper,
    grid: ListGrid<T>,
    _info: DrawCellInfo<T>
  ): void {
    const { bgColor } = style;
    const { selected } = context.getSelectState();

    if (!selected || !grid.hasFocusGrid()) {
      helper.drawBorderWithClip(
        context,
        (_ctx: CanvasRenderingContext2D): void => {
          messageUtils.drawExclamationMarkBox(
            context,
            {
              bgColor: RED_A100,
              color: bgColor
            },
            helper
          );
        }
      );
    }
  }
}
