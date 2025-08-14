import type { ListGridAPI, MessageObject } from "../../../ts-types";
import { EventHandler } from "../../../internal/EventHandler";
import { createElement } from "../../../internal/dom";
import "./MessageElement.css";

const CLASSNAME = "cheetah-grid__message-element";
const MESSAGE_CLASSNAME = `${CLASSNAME}__message`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;

const CSS_PROP_NAME_PREFIX = "--cheetah-grid-message-element-";
const CELL_TOP_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-top`;
const CELL_BOTTOM_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-bottom`;
const CELL_LEFT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-left`;
const CELL_RIGHT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-right`;
const ELEMENT_WIDTH_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}width`;
const ELEMENT_HEIGHT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}height`;

const LEFT_DIFF_CSS_PROP_NAME = "--cheetah-grid-message-element-left-diff";

function createMessageDomElement(): HTMLElement {
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
    rootElement.popover = "manual";
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
    rootElement.hidePopover();

    messageElement.textContent = message.message;
    if (this._attachCell(grid, col, row)) {
      this._adjustStyle(grid, col, row);
    } else {
      this._detach();
    }
  }
  move<T>(grid: ListGridAPI<T>, col: number, row: number): void {
    if (!this._attachCell(grid, col, row)) {
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
    rootElement.hidePopover();
  }
  _attachCell<T>(grid: ListGridAPI<T>, col: number, row: number): boolean {
    const rootElement = this._rootElement;
    const { element, rect } = grid.getAttachCellsArea(
      grid.getCellRange(col, row)
    );

    const { frozenRowCount, frozenColCount } = grid;
    if (row >= frozenRowCount && frozenRowCount > 0) {
      const { rect: frozenRect } = grid.getAttachCellsArea(
        grid.getCellRange(col, frozenRowCount - 1)
      );
      if (rect.bottom < frozenRect.bottom) {
        return false; // Outside the rectangle.
      }
    } else {
      if (rect.bottom < 0) {
        return false; // Outside the rectangle.
      }
    }
    if (col >= frozenColCount && frozenColCount > 0) {
      const { rect: frozenRect } = grid.getAttachCellsArea(
        grid.getCellRange(frozenColCount - 1, row)
      );
      if (rect.left < frozenRect.right) {
        return false; // Outside the rectangle.
      }
    } else {
      if (rect.left < 0) {
        return false; // Outside the rectangle.
      }
    }
    const {
      height: offsetHeight,
      width: offsetWidth,
      left: elementLeft,
      top: elementTop,
    } = element.getBoundingClientRect();
    if (offsetHeight < rect.bottom) {
      return false; // Outside the rectangle.
    }
    if (offsetWidth < rect.left) {
      return false; // Outside the rectangle.
    }

    rootElement.style.setProperty(
      CELL_TOP_CSS_PROP_NAME,
      `${(elementTop + rect.top).toFixed()}px`
    );
    rootElement.style.setProperty(
      CELL_BOTTOM_CSS_PROP_NAME,
      `${(elementTop + rect.bottom).toFixed()}px`
    );
    rootElement.style.setProperty(
      CELL_LEFT_CSS_PROP_NAME,
      `${(elementLeft + rect.left).toFixed()}px`
    );
    rootElement.style.setProperty(
      CELL_RIGHT_CSS_PROP_NAME,
      `${(elementLeft + rect.right).toFixed()}px`
    );

    if (rootElement.parentElement !== element) {
      element.appendChild(rootElement);
    }

    const rootElementRect = rootElement.getBoundingClientRect();
    rootElement.style.setProperty(
      ELEMENT_WIDTH_CSS_PROP_NAME,
      `${rootElementRect.width.toFixed()}px`
    );
    rootElement.style.setProperty(
      ELEMENT_HEIGHT_CSS_PROP_NAME,
      `${rootElementRect.height.toFixed()}px`
    );

    rootElement.classList.add(SHOWN_CLASSNAME);
    rootElement.classList.remove(HIDDEN_CLASSNAME);

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
