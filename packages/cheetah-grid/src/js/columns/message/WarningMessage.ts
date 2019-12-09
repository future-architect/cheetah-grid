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
import { WarningMessageElement } from "./internal/WarningMessageElement";

const DEEP_ORANGE_A100 = "#ff9e80";

export class WarningMessage<T> extends BaseMessage<T> {
  createMessageElementInternal(): WarningMessageElement {
    return new WarningMessageElement();
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
