import { EventHandler } from "../../internal/EventHandler";
import type { ListGridAPI } from "../../ts-types";
import { createElement } from "../../internal/dom";

const CLASSNAME = "cheetah-grid__tooltip-element";
const CONTENT_CLASSNAME = `${CLASSNAME}__content`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;

const CSS_PROP_NAME_PREFIX = "--cheetah-grid-tooltip-element-";
const CELL_TOP_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-top`;
const CELL_BOTTOM_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-bottom`;
const CELL_LEFT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-left`;
const CELL_RIGHT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}cell-right`;
const ELEMENT_WIDTH_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}width`;
const ELEMENT_HEIGHT_CSS_PROP_NAME = `${CSS_PROP_NAME_PREFIX}height`;

function createTooltipDomElement(): HTMLElement {
  require("@/tooltip/internal/TooltipElement.css");
  const rootElement = createElement("div", {
    classList: [CLASSNAME, HIDDEN_CLASSNAME],
  });
  const messageElement = createElement("pre", {
    classList: [CONTENT_CLASSNAME],
  });
  rootElement.appendChild(messageElement);
  rootElement.popover = "manual";
  return rootElement;
}

export class TooltipElement<T> {
  private _handler: EventHandler;
  private _rootElement: HTMLElement;
  private _messageElement: HTMLElement;
  constructor() {
    this._handler = new EventHandler();
    const rootElement = (this._rootElement = createTooltipDomElement());
    this._messageElement = rootElement.querySelector(
      `.${CONTENT_CLASSNAME}`
    ) as HTMLElement;
  }
  dispose(): void {
    this.detach();

    const rootElement = this._rootElement;
    if (rootElement.parentElement) {
      rootElement.parentElement.removeChild(rootElement);
    }

    this._handler.dispose();
    // @ts-expect-error -- ignore
    delete this._rootElement;
    // @ts-expect-error -- ignore
    delete this._messageElement;
  }
  attach(
    grid: ListGridAPI<T>,
    col: number,
    row: number,
    content: string
  ): void {
    const rootElement = this._rootElement;
    const messageElement = this._messageElement;

    rootElement.classList.remove(SHOWN_CLASSNAME);
    rootElement.classList.add(HIDDEN_CLASSNAME);
    rootElement.hidePopover();

    messageElement.textContent = content;
    if (!this._attachCell(grid, col, row)) {
      this._detach();
    }
  }
  move(grid: ListGridAPI<T>, col: number, row: number): void {
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
      // rootElement.parentElement.removeChild(rootElement);
      rootElement.classList.remove(SHOWN_CLASSNAME);
      rootElement.classList.add(HIDDEN_CLASSNAME);
    }

    rootElement.hidePopover();
  }
  _attachCell(grid: ListGridAPI<T>, col: number, row: number): boolean {
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

    rootElement.showPopover();

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
}
