import type {
  ColumnMenuItemOption,
  ListGridAPI,
  RectProps,
} from "../../../ts-types";
import {
  appendHtml,
  createElement,
  disableFocus,
  empty,
  findNextSiblingFocusable,
  findPrevSiblingFocusable,
  isFocusable,
} from "../../../internal/dom";
import { EventHandler } from "../../../internal/EventHandler";
import type { Rect } from "../../../internal/Rect";
import { event } from "../../../internal/utils";

const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESC = 27;

const CLASSNAME = "cheetah-grid__inline-menu";
const ITEM_CLASSNAME = `${CLASSNAME}__menu-item`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;
const EMPTY_ITEM_CLASSNAME = `${ITEM_CLASSNAME}--empty`;

function findItemParents(target: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = target;
  while (el && !el.classList.contains(ITEM_CLASSNAME)) {
    el = el.parentElement;
    if (!el || el.classList.contains(CLASSNAME)) {
      return null;
    }
  }
  return el;
}

function createMenuElement(): HTMLUListElement {
  require("@/columns/action/internal/InlineMenuElement.css");
  return createElement("ul", { classList: CLASSNAME });
}
function attachElement(
  element: HTMLElement,
  rect: RectProps,
  menu: HTMLUListElement
): void {
  menu.style.top = `${rect.top.toFixed()}px`;
  menu.style.left = `${rect.left.toFixed()}px`;
  menu.style.width = `${rect.width.toFixed()}px`;
  menu.style.lineHeight = `${rect.height.toFixed()}px`;
  element.appendChild(menu);
}

function optionToLi(
  { classList, label, value, html }: ColumnMenuItemOption,
  index: number
): HTMLLIElement {
  const item = createElement("li", { classList: ITEM_CLASSNAME });
  item.tabIndex = 0;
  item.dataset.valueindex = `${index}`;
  if (classList) {
    item.classList.add(...(Array.isArray(classList) ? classList : [classList]));
  }

  if (label) {
    const span = createElement("span", { text: label });
    item.appendChild(span);
  } else if (html) {
    appendHtml(item, html);
  }

  if (value === "" || value == null) {
    item.classList.add(EMPTY_ITEM_CLASSNAME);
  }

  return item;
}

function openMenu<T>(
  grid: ListGridAPI<T>,
  editor: EditorProps<T>,
  col: number,
  row: number,
  value: string,
  options: ColumnMenuItemOption[],
  menu: HTMLUListElement
): void {
  const { classList } = editor;
  menu.classList.remove(SHOWN_CLASSNAME);
  menu.classList.add(HIDDEN_CLASSNAME);
  empty(menu);
  menu.style.font = grid.font || "16px sans-serif";
  let emptyItemEl: null | HTMLElement = null;
  let valueItemEl: null | HTMLElement = null;

  options.forEach((option, i) => {
    const item = optionToLi(option, i);
    menu.appendChild(item);
    if (option.value === value) {
      valueItemEl = item;
      item.dataset.select = "select";
    }
    if (item.classList.contains(EMPTY_ITEM_CLASSNAME)) {
      emptyItemEl = item;
    }
  });
  const focusEl =
    valueItemEl || emptyItemEl || (menu.children[0] as HTMLElement);
  if (classList) {
    menu.classList.add(...classList);
  }
  const children = Array.prototype.slice.call(menu.children, 0);
  const focusIndex = children.indexOf(focusEl);
  const { element, rect } = grid.getAttachCellsArea(
    grid.getCellRange(col, row)
  );

  // Cover the right line
  rect.width++;

  // append for calculation
  attachElement(element, rect, menu);

  // Make the selection item at the middle
  let offset = 0;
  let allHeight = 0;
  for (let i = 0; i < children.length; i++) {
    const { offsetHeight } = children[i];
    if (i < focusIndex) {
      offset += offsetHeight;
    }
    allHeight += offsetHeight;
  }
  (rect as Rect).offsetTop(-offset);
  menu.style.transformOrigin = `center ${
    offset + Math.ceil(children[focusIndex].offsetHeight / 2)
  }px 0px`;
  attachElement(element, rect, menu);

  // Control not to overflow the screen range
  const menuClientRect = menu.getBoundingClientRect();
  const scaleDiff = (allHeight - menuClientRect.height) / 2;
  const orgMenuTop = menuClientRect.top - scaleDiff;
  let menuTop = orgMenuTop;
  const menuBottom = menuTop + allHeight;
  const winBottom = window.innerHeight;
  const winMargin = 20;
  if (menuBottom > winBottom - winMargin) {
    const diff = menuBottom - winBottom + winMargin;
    menuTop -= diff;
  }
  if (menuTop < 0 /*winTop*/ + winMargin) {
    menuTop = winMargin;
  }
  if (menuTop !== orgMenuTop) {
    (rect as Rect).offsetTop(-(orgMenuTop - menuTop));
    // re update
    attachElement(element, rect, menu);
  }

  if (focusEl) {
    focusEl.focus();
  }
  menu.classList.remove(HIDDEN_CLASSNAME);
  menu.classList.add(SHOWN_CLASSNAME);
}

function closeMenu<T>(
  _grid: ListGridAPI<T>,
  _col: number,
  _row: number,
  menu: HTMLUListElement
): void {
  menu.classList.remove(SHOWN_CLASSNAME);
  menu.classList.add(HIDDEN_CLASSNAME);
  disableFocus(menu);
}

type EditorProps<T> = {
  classList?: string[];
  options: (record: T | undefined) => ColumnMenuItemOption[];
};
type ActiveData<T> = {
  grid: ListGridAPI<T>;
  col: number;
  row: number;
  editor: EditorProps<T>;
  options: ColumnMenuItemOption[];
};

export class InlineMenuElement<T> {
  private _handler: EventHandler;
  private _menu: HTMLUListElement;
  private _beforePropEditor?: EditorProps<T> | null;
  private _activeData?: ActiveData<T> | null;
  constructor() {
    this._handler = new EventHandler();
    this._menu = createMenuElement();
    this._bindMenuEvents();
  }
  dispose(): void {
    const menu = this._menu;
    this.detach();
    this._handler.dispose();
    // @ts-expect-error -- ignore
    delete this._menu;
    this._beforePropEditor = null;
    menu.parentElement?.removeChild(menu);
  }
  attach(
    grid: ListGridAPI<T>,
    editor: EditorProps<T>,
    col: number,
    row: number,
    value: string,
    record: T | undefined
  ): void {
    const menu = this._menu;

    if (this._beforePropEditor) {
      const { classList } = this._beforePropEditor;
      if (classList) {
        menu.classList.remove(...classList);
      }
    }

    const options = editor.options(record);

    openMenu(grid, editor, col, row, value, options, menu);
    this._activeData = { grid, col, row, editor, options };
    this._beforePropEditor = editor;
  }
  detach(gridFocus?: boolean): void {
    if (this._isActive()) {
      const { grid, col, row } = this._activeData!;
      const menu = this._menu;
      closeMenu(grid, col, row, menu);

      const range = grid.getCellRange(col, row);
      grid.invalidateCellRange(range);
      if (gridFocus) {
        grid.focus();
      }
    }
    this._activeData = null;
  }
  _doChangeValue(valueindex: number | string): void {
    if (!this._isActive()) {
      return;
    }
    const { grid, col, row, options } = this._activeData!;
    const option = options[Number(valueindex)];
    if (option) {
      const { value } = option;
      grid.doChangeValue(col, row, () => value);
    }
  }
  _isActive(): boolean {
    const menu = this._menu;
    if (!menu || !menu.parentElement) {
      return false;
    }
    if (!this._activeData) {
      return false;
    }
    return true;
  }
  _bindMenuEvents(): void {
    const handler = this._handler;
    const menu = this._menu;

    const stopPropagationOnly = (e: Event): void => e.stopPropagation(); // gridにイベントが伝播しないように

    handler.on(menu, "mousedown", stopPropagationOnly);
    handler.on(menu, "touchstart", stopPropagationOnly);
    handler.on(menu, "dblclick", stopPropagationOnly);

    handler.on(menu, "click", (e) => {
      e.stopPropagation();
      const item = findItemParents(e.target as HTMLElement);
      if (!item) {
        return;
      }
      const { valueindex } = item.dataset;
      this._doChangeValue(valueindex || "");
      this.detach(true);
    });
    handler.on(menu, "keydown", (e) => {
      const item = findItemParents(e.target as HTMLElement);
      if (!item) {
        return;
      }
      const keyCode = event.getKeyCode(e);
      if (keyCode === KEY_ENTER) {
        this._onKeydownEnter(menu, item, e);
      } else if (keyCode === KEY_ESC) {
        this.detach(true);
        event.cancel(e);
      } else if (keyCode === KEY_UP) {
        const n = findPrevSiblingFocusable(item);
        if (n) {
          n.focus();
          event.cancel(e);
        }
      } else if (keyCode === KEY_DOWN) {
        const n = findNextSiblingFocusable(item);
        if (n) {
          n.focus();
          event.cancel(e);
        }
      } else if (keyCode === KEY_TAB) {
        this._onKeydownTab(menu, item, e);
      }
    });
  }
  _onKeydownEnter(
    _menu: HTMLUListElement,
    item: HTMLElement,
    e: KeyboardEvent
  ): void {
    const grid = this._isActive() ? this._activeData!.grid : null;
    const { valueindex } = item.dataset;
    this._doChangeValue(valueindex || "");
    this.detach(true);
    event.cancel(e);

    if (grid) {
      if (grid.keyboardOptions?.moveCellOnEnter) {
        grid.onKeyDownMove(e);
      }
    }
  }
  _onKeydownTab(
    menu: HTMLUListElement,
    item: HTMLElement,
    e: KeyboardEvent
  ): void {
    if (this._isActive()) {
      const { grid } = this._activeData!;
      if (grid.keyboardOptions?.moveCellOnTab) {
        const { valueindex } = item.dataset;
        this._doChangeValue(valueindex || "");
        this.detach(true);
        grid.onKeyDownMove(e);
        return;
      }
    }

    if (!e.shiftKey) {
      if (!findNextSiblingFocusable(item)) {
        let n: HTMLElement | null = menu.querySelector(
          `.${ITEM_CLASSNAME}`
        ) as HTMLElement;
        if (!isFocusable(n)) {
          n = findNextSiblingFocusable(n);
        }
        if (n) {
          n.focus();
          event.cancel(e);
        }
      }
    } else {
      if (!findPrevSiblingFocusable(item)) {
        const items = menu.querySelectorAll(`.${ITEM_CLASSNAME}`);
        let n: HTMLElement | null = items[items.length - 1] as HTMLElement;
        if (!isFocusable(n)) {
          n = findPrevSiblingFocusable(n);
        }
        if (n) {
          n.focus();
          event.cancel(e);
        }
      }
    }
  }
}
