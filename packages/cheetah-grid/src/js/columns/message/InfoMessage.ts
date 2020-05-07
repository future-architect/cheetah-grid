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
import { MessageElement } from "./internal/MessageElement";
import { cellInRange } from "../../internal/utils";
const GREY_L2 = "#e0e0e0";

export class InfoMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): MessageElement {
    return new MessageElement();
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
              bgColor: GREY_L2,
              color: bgColor,
            },
            helper
          );
        }
      );
    }
  }
}
