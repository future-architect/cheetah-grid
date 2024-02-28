import type { ListGridAPI, MessageObject } from "../../../ts-types";
import { EventHandler } from "../../../internal/EventHandler";
import { createElement } from "../../../internal/dom";

const CLASSNAME = "cheetah-grid__message-element";
const MESSAGE_CLASSNAME = `${CLASSNAME}__message`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;
const LEFT_DIFF_CSS_PROP_NAME = "--cheetah-grid-message-element-left-diff";

function createMessageDomElement(): HTMLElement {
  require("@/columns/message/internal/MessageElement.css");
  const rootElement = createElement("div", {
    classList: [CLASSNAME, HIDDEN_CLASSNAME],
  });
  const messageElement = createElement("span", {
    classList: [MESSAGE_CLASSNAME],
  });
  rootElement.appendChild(messageElement);
  return rootElement;
}

export class MessageElement {
  private _handler: EventHandler;
  protected _rootElement: HTMLElement;
  protected _messageElement: HTMLElement;
  constructor() {
    this._handler = new EventHandler();
    const rootElement = (this._rootElement = createMessageDomElement());
    this._messageElement = rootElement.querySelector(
      `.${MESSAGE_CLASSNAME}`
    ) as HTMLElement;
  }
  dispose(): void {
    this.detach();
    this._handler.dispose();
    // @ts-expect-error -- ignore
    delete this._rootElement;
    // @ts-expect-error -- ignore
    delete this._messageElement;
  }
  attach<T>(
    grid: ListGridAPI<T>,
    col: number,
    row: number,
    message: MessageObject
  ): void {
    const rootElement = this._rootElement;
    const messageElement = this._messageElement;

    rootElement.classList.remove(SHOWN_CLASSNAME);
    rootElement.classList.add(HIDDEN_CLASSNAME);

    if (this._attachCell(grid, col, row)) {
      rootElement.classList.add(SHOWN_CLASSNAME);
      rootElement.classList.remove(HIDDEN_CLASSNAME);

      messageElement.textContent = message.message;

      this._adjustStyle(grid, col, row);
    } else {
      this._detach();
    }
  }
  move<T>(grid: ListGridAPI<T>, col: number, row: number): void {
    const rootElement = this._rootElement;
    if (this._attachCell(grid, col, row)) {
      rootElement.classList.add(SHOWN_CLASSNAME);
      rootElement.classList.remove(HIDDEN_CLASSNAME);
    } else {
      this._detach();
    }
  }
  detach(): void {
    this._detach();
  }
  _detach(): void {
    const rootElement = this._rootElement;
    if (rootElement.parentElement) {
      rootElement.parentElement.removeChild(rootElement);
      rootElement.classList.remove(SHOWN_CLASSNAME);
      rootElement.classList.add(HIDDEN_CLASSNAME);
    }
  }
  _attachCell<T>(grid: ListGridAPI<T>, col: number, row: number): boolean {
    const rootElement = this._rootElement;
    const { element, rect } = grid.getAttachCellsArea(
      grid.getCellRange(col, row)
    );

    const { bottom: top, left, width } = rect;
    const { frozenRowCount, frozenColCount } = grid;
    if (row >= frozenRowCount && frozenRowCount > 0) {
      const { rect: frozenRect } = grid.getAttachCellsArea(
        grid.getCellRange(col, frozenRowCount - 1)
      );
      if (top < frozenRect.bottom) {
        return false; // Outside the rectangle.
      }
    } else {
      if (top < 0) {
        return false; // Outside the rectangle.
      }
    }
    if (col >= frozenColCount && frozenColCount > 0) {
      const { rect: frozenRect } = grid.getAttachCellsArea(
        grid.getCellRange(frozenColCount - 1, row)
      );
      if (left < frozenRect.right) {
        return false; // Outside the rectangle.
      }
    } else {
      if (left < 0) {
        return false; // Outside the rectangle.
      }
    }
    const { offsetHeight, offsetWidth } = element;
    if (offsetHeight < top) {
      return false; // Outside the rectangle.
    }
    if (offsetWidth < left) {
      return false; // Outside the rectangle.
    }

    rootElement.style.top = `${top.toFixed()}px`;
    rootElement.style.left = `${left.toFixed()}px`;
    rootElement.style.width = `${width.toFixed()}px`;
    if (rootElement.parentElement !== element) {
      element.appendChild(rootElement);
    }
    return true;
  }
  /**
   * If the message is placed outside the Grid, adjust its position.
   */
  _adjustStyle<T>(grid: ListGridAPI<T>, col: number, row: number): void {
    const rootElement = this._rootElement;
    const element = grid.getElement();

    const messageRect = rootElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    let messageLeft = messageRect.left;
    if (elementRect.right < messageRect.right) {
      const overflow = messageRect.right - elementRect.right;
      messageLeft -= overflow;
    }
    if (messageLeft < elementRect.left) {
      messageLeft = elementRect.left;
    }

    if (messageLeft !== messageRect.left) {
      const diff = messageRect.left - messageLeft;
      const { rect } = grid.getAttachCellsArea(grid.getCellRange(col, row));
      rootElement.style.left = `${(rect.left - diff).toFixed()}px`;

      const diffCss = `${diff.toFixed()}px`;
      rootElement.style.setProperty(LEFT_DIFF_CSS_PROP_NAME, diffCss);
    } else {
      rootElement.style.removeProperty(LEFT_DIFF_CSS_PROP_NAME);
    }
  }
}
