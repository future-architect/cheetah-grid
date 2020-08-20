import type {
  CellContext,
  ColumnStyle,
  GridCanvasHelperAPI,
  ListGridAPI,
  MessageObject,
} from "../../ts-types";
import type { DrawCellInfo } from "../../ts-types-internal";
import type { MessageElement } from "./internal/MessageElement";

export abstract class BaseMessage<T> {
  private _grid: ListGridAPI<T>;
  private _messageElement: MessageElement | null = null;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
  }
  dispose(): void {
    this.detachMessageElement();
    if (this._messageElement) {
      this._messageElement.dispose();
    }
    this._messageElement = null;
  }
  _getMessageElement(): MessageElement {
    return (
      this._messageElement ||
      (this._messageElement = this.createMessageElementInternal())
    );
  }
  abstract createMessageElementInternal(): MessageElement;
  abstract drawCellMessageInternal(
    message: MessageObject,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
  attachMessageElement(col: number, row: number, message: MessageObject): void {
    const messageElement = this._getMessageElement();
    messageElement.attach(this._grid, col, row, message);
  }
  moveMessageElement(col: number, row: number): void {
    const messageElement = this._getMessageElement();
    messageElement.move(this._grid, col, row);
  }
  detachMessageElement(): void {
    const messageElement = this._getMessageElement();
    messageElement._detach();
  }
  drawCellMessage(
    message: MessageObject,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void {
    this.drawCellMessageInternal(message, context, style, helper, grid, info);
  }
}
