import * as messageUtils from "./messageUtils";
import {
  CellContext,
  ColumnStyle,
  GridCanvasHelper,
  ListGridAPI,
  MessageObject
} from "../../ts-types";
import { BaseMessage } from "./BaseMessage";
import { DrawCellInfo } from "../../ts-types-internal";
import { MessageElement } from "./internal/MessageElement";
const GREY_L2 = "#e0e0e0";

export class InfoMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): MessageElement {
    return new MessageElement();
  }
  drawCellMessageInternal(
    _message: MessageObject,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelper,
    grid: ListGridAPI<T>,
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
              bgColor: GREY_L2,
              color: bgColor
            },
            helper
          );
        }
      );
    }
  }
}
