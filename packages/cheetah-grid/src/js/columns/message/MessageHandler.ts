import type {
  MessageHandler as Base,
  DrawCellInfo,
} from "../../ts-types-internal";
import type {
  CellContext,
  ColumnStyle,
  GridCanvasHelperAPI,
  ListGridAPI,
  Message,
  MessageObject,
} from "../../ts-types";
import type { BaseMessage } from "./BaseMessage";
import { ErrorMessage } from "./ErrorMessage";
import { InfoMessage } from "./InfoMessage";
import { LG_EVENT_TYPE } from "../../list-grid/LG_EVENT_TYPE";
import { WarningMessage } from "./WarningMessage";
import { isPromise } from "../../internal/utils";

const EMPTY_MESSAGE: MessageObject = {
  type: "error",
  message: null,
};

const MESSAGE_INSTANCE_FACTORY = {
  error<T>(grid: ListGridAPI<T>): BaseMessage<T> {
    return new ErrorMessage(grid);
  },
  info<T>(grid: ListGridAPI<T>): BaseMessage<T> {
    return new InfoMessage(grid);
  },
  warning<T>(grid: ListGridAPI<T>): BaseMessage<T> {
    return new WarningMessage(grid);
  },
};

function normalizeMessage(message: Message): MessageObject {
  if (!message || isPromise(message)) {
    return EMPTY_MESSAGE;
  }
  if (typeof message === "string") {
    return {
      type: "error",
      message,
      original: message,
    };
  }
  const type = message.type || "error";
  if (type && type in MESSAGE_INSTANCE_FACTORY) {
    return {
      type: type.toLowerCase() as MessageObject["type"],
      message: message.message,
      original: message,
    };
  }
  return {
    type: "error",
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    message: `${message}`,
    original: message,
  };
}
export function hasMessage(message: Message): boolean {
  return !!normalizeMessage(message).message;
}
export class MessageHandler<T> implements Base<T> {
  private _grid: ListGridAPI<T>;
  private _messageInstances: {
    [k in MessageObject["type"]]?: BaseMessage<T>;
  };
  private _attachInfo: {
    col: number;
    row: number;
    instance: BaseMessage<T>;
  } | null = null;
  constructor(
    grid: ListGridAPI<T>,
    getMessage: (col: number, row: number) => Message
  ) {
    this._grid = grid;
    this._messageInstances = {};
    this._bindGridEvent(grid, getMessage);
  }
  dispose(): void {
    const messageInstances = this._messageInstances;
    for (const k in messageInstances) {
      messageInstances[k as MessageObject["type"]]?.dispose();
    }
    // @ts-expect-error -- ignore
    delete this._messageInstances;
    // @ts-expect-error -- ignore
    delete this._attachInfo;
  }
  drawCellMessage(
    message: Message,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void {
    if (!hasMessage(message)) {
      return;
    }
    const instance = this._getMessageInstanceOfMessage(message);
    instance.drawCellMessage(
      normalizeMessage(message),
      context,
      style,
      helper,
      grid,
      info
    );
  }
  _attach(col: number, row: number, message: Message): void {
    const info = this._attachInfo;
    const instance = this._getMessageInstanceOfMessage(message);
    if (info && info.instance !== instance) {
      info.instance.detachMessageElement();
    }
    instance.attachMessageElement(col, row, normalizeMessage(message));
    this._attachInfo = { col, row, instance };
  }
  _move(col: number, row: number): void {
    const info = this._attachInfo;
    if (!info || info.col !== col || info.row !== row) {
      return;
    }
    const { instance } = info;
    instance.moveMessageElement(col, row);
  }
  _detach(): void {
    const info = this._attachInfo;
    if (!info) {
      return;
    }
    const { instance } = info;
    instance.detachMessageElement();
    this._attachInfo = null;
  }
  _bindGridEvent(
    grid: ListGridAPI<T>,
    getMessage: (col: number, row: number) => Message
  ): void {
    const onSelectMessage = (sel: { col: number; row: number }): void => {
      const setMessageData = (msg: Message) => {
        if (!hasMessage(msg)) {
          this._detach();
        } else {
          this._attach(sel.col, sel.row, msg);
        }
      };

      const message = getMessage(sel.col, sel.row);
      if (isPromise(message)) {
        this._detach();
        message.then((msg) => {
          const newSel = grid.selection.select;
          if (newSel.col !== sel.col || newSel.row !== sel.row) {
            return;
          }
          setMessageData(msg);
        });
        return;
      }
      setMessageData(message);
    };
    grid.listen(LG_EVENT_TYPE.SELECTED_CELL, (e) => {
      if (!e.selected) {
        return;
      }
      if (e.before.col === e.col && e.before.row === e.row) {
        return;
      }
      onSelectMessage(e);
    });
    grid.listen(LG_EVENT_TYPE.SCROLL, () => {
      const sel = grid.selection.select;
      this._move(sel.col, sel.row);
    });
    grid.listen(LG_EVENT_TYPE.CHANGED_VALUE, (e) => {
      if (!grid.hasFocusGrid()) {
        return;
      }
      const sel = grid.selection.select;
      if (sel.col !== e.col || sel.row !== e.row) {
        return;
      }
      onSelectMessage(e);
    });
    grid.listen(LG_EVENT_TYPE.FOCUS_GRID, (_e) => {
      const sel = grid.selection.select;
      onSelectMessage(sel);
    });
    grid.listen(LG_EVENT_TYPE.BLUR_GRID, (_e) => {
      this._detach();
    });
  }
  _getMessageInstanceOfMessage(message: Message): BaseMessage<T> {
    const messageInstances = this._messageInstances;
    const { type } = normalizeMessage(message);
    return (
      messageInstances[type] ||
      (messageInstances[type] = MESSAGE_INSTANCE_FACTORY[type](this._grid))
    );
  }
}
