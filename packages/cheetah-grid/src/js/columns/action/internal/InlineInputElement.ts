import { EventHandler } from "../../../internal/EventHandler";
import type { ListGridAPI } from "../../../ts-types";
import { createElement } from "../../../internal/dom";
import { event } from "../../../internal/utils";
import { setInputValue } from "./input-value-handler";
const KEY_TAB = 9;
const KEY_ENTER = 13;

const CLASSNAME = "cheetah-grid__inline-input";

function createInputElement(): HTMLInputElement {
  require("@/columns/action/internal/InlineInputElement.css");
  return createElement("input", { classList: CLASSNAME });
}

type EditorProps = { type?: string; classList?: string[] };

type ActiveData<T> = {
  grid: ListGridAPI<T>;
  col: number;
  row: number;
  editor: EditorProps;
};

function setInputAttrs<T>(
  editor: EditorProps,
  _grid: ListGridAPI<T>,
  input: HTMLInputElement
): void {
  const { classList, type } = editor;
  if (classList) {
    input.classList.add(...classList);
  }
  input.type = type || "";
}

export class InlineInputElement<T> {
  private _handler: EventHandler;
  private _input: HTMLInputElement;
  private _beforePropEditor?: EditorProps | null;
  private _activeData?: ActiveData<T> | null;
  private _attaching?: boolean;
  static setInputAttrs<T>(
    editor: { type?: string; classList?: string[] },
    grid: ListGridAPI<T>,
    input: HTMLInputElement
  ): void {
    setInputAttrs(editor, grid, input);
  }
  constructor() {
    this._handler = new EventHandler();
    this._input = createInputElement();
    this._bindInputEvents();
  }
  dispose(): void {
    const input = this._input;
    this.detach();
    this._handler.dispose();
    // @ts-expect-error -- ignore
    delete this._input;
    this._beforePropEditor = null;
    input.parentElement?.removeChild(input);
  }
  attach(
    grid: ListGridAPI<T>,
    editor: EditorProps,
    col: number,
    row: number,
    value: string
  ): void {
    const input = this._input;
    const handler = this._handler;

    if (this._beforePropEditor) {
      const { classList } = this._beforePropEditor;
      if (classList) {
        input.classList.remove(...classList);
      }
    }

    input.style.font = grid.font || "16px sans-serif";

    const { element, rect } = grid.getAttachCellsArea(
      grid.getCellRange(col, row)
    );
    input.style.top = `${rect.top.toFixed()}px`;
    input.style.left = `${rect.left.toFixed()}px`;
    input.style.width = `${rect.width.toFixed()}px`;
    input.style.height = `${rect.height.toFixed()}px`;
    element.appendChild(input);

    setInputAttrs(editor, grid, input);

    setInputValue(input, value);

    this._activeData = { grid, col, row, editor };
    this._beforePropEditor = editor;

    const focus = (): void => {
      input.focus();

      const end = input.value.length;
      try {
        if (typeof input.selectionStart !== "undefined") {
          input.selectionStart = end;
          input.selectionEnd = end;
          return;
        }
      } catch (e) {
        //ignore
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((document as any).selection) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const range = (input as any).createTextRange();
        range.collapse();
        range.moveEnd("character", end);
        range.moveStart("character", end);
        range.select();
      }
    };
    handler.tryWithOffEvents(input, "blur", () => {
      focus();
    });

    this._attaching = true;
    setTimeout(() => {
      delete this._attaching;
    });
  }
  detach(gridFocus?: boolean): void {
    if (this._isActive()) {
      const { grid, col, row } = this._activeData!;
      const input = this._input;
      this._handler.tryWithOffEvents(input, "blur", () => {
        input.parentElement?.removeChild(input);
      });
      const range = grid.getCellRange(col, row);
      grid.invalidateCellRange(range);
      if (gridFocus) {
        grid.focus();
      }
    }
    this._activeData = null;
  }
  doChangeValue(): void {
    if (!this._isActive()) {
      return;
    }
    const input = this._input;
    const { value } = input;
    const { grid, col, row } = this._activeData!;
    grid.doChangeValue(col, row, () => value);
  }
  _isActive(): boolean {
    const input = this._input;
    if (!input || !input.parentElement) {
      return false;
    }
    if (!this._activeData) {
      return false;
    }
    return true;
  }
  _bindInputEvents(): void {
    const handler = this._handler;
    const input = this._input;
    const stopPropagationOnly = (e: Event): void => e.stopPropagation(); // gridにイベントが伝播しないように
    handler.on(input, "click", stopPropagationOnly);
    handler.on(input, "mousedown", stopPropagationOnly);
    handler.on(input, "touchstart", stopPropagationOnly);
    handler.on(input, "dblclick", stopPropagationOnly);

    handler.on(input, "compositionstart", (_e) => {
      input.classList.add("composition");
    });
    handler.on(input, "compositionend", (_e) => {
      input.classList.remove("composition");
    });
    handler.on(input, "keydown", (e) => {
      if (input.classList.contains("composition")) {
        return;
      }
      const keyCode = event.getKeyCode(e);
      if (keyCode === KEY_ENTER) {
        this._onKeydownEnter(e);
      } else if (keyCode === KEY_TAB) {
        this._onKeydownTab(e);
      }
    });
    handler.on(input, "blur", (_e) => {
      this.doChangeValue();
      this.detach();
    });
  }
  _onKeydownEnter(e: KeyboardEvent): void {
    if (!this._isActive() || this._attaching) {
      return;
    }

    const { grid } = this._activeData!;

    this.doChangeValue();
    this.detach(true);
    event.cancel(e);

    if (grid.keyboardOptions?.moveCellOnEnter) {
      grid.onKeyDownMove(e);
    }
  }
  _onKeydownTab(e: KeyboardEvent): void {
    if (!this._isActive()) {
      return;
    }
    const { grid } = this._activeData!;
    if (!grid.keyboardOptions?.moveCellOnTab) {
      return;
    }
    this.doChangeValue();
    this.detach(true);
    grid.onKeyDownMove(e);
  }
}
