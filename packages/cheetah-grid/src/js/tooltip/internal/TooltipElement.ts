import { EventHandler } from "../../internal/EventHandler";
import type { ListGridAPI } from "../../ts-types";
import { createElement } from "../../internal/dom";

const CLASSNAME = "cheetah-grid__tooltip-element";
const CONTENT_CLASSNAME = `${CLASSNAME}__content`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;

function createTooltipDomElement(): HTMLElement {
  require("@/tooltip/internal/TooltipElement.css");
  const rootElement = createElement("div", {
    classList: [CLASSNAME, HIDDEN_CLASSNAME],
  });
  const messageElement = createElement("pre", {
    classList: [CONTENT_CLASSNAME],
  });
  rootElement.appendChild(messageElement);
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

    if (this._attachCell(grid, col, row)) {
      rootElement.classList.add(SHOWN_CLASSNAME);
      rootElement.classList.remove(HIDDEN_CLASSNAME);

      messageElement.textContent = content;
    } else {
      this._detach();
    }
  }
  move(grid: ListGridAPI<T>, col: number, row: number): void {
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
      // rootElement.parentElement.removeChild(rootElement);
      rootElement.classList.remove(SHOWN_CLASSNAME);
      rootElement.classList.add(HIDDEN_CLASSNAME);
    }
  }
  _attachCell(grid: ListGridAPI<T>, col: number, row: number): boolean {
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
        return false; //範囲外
      }
    } else {
      if (top < 0) {
        return false; //範囲外
      }
    }
    if (col >= frozenColCount && frozenColCount > 0) {
      const { rect: frozenRect } = grid.getAttachCellsArea(
        grid.getCellRange(frozenColCount - 1, row)
      );
      if (left < frozenRect.right) {
        return false; //範囲外
      }
    } else {
      if (left < 0) {
        return false; //範囲外
      }
    }
    const { offsetHeight, offsetWidth } = element;
    if (offsetHeight < top) {
      return false; //範囲外
    }
    if (offsetWidth < left) {
      return false; //範囲外
    }

    rootElement.style.top = `${top.toFixed()}px`;
    rootElement.style.left = `${(left + width / 2).toFixed()}px`;
    rootElement.style.minWidth = `${width.toFixed()}px`;
    if (rootElement.parentElement !== element) {
      element.appendChild(rootElement);
    }
    return true;
  }
}
