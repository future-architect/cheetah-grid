import type {
  CellAddress,
  ColumnMenuItemOption,
  ColumnTypeAPI,
  EventListenerId,
  InlineMenuEditorOption,
  LayoutObjectId,
  ListGridAPI,
  SimpleColumnMenuItemOption,
} from "../../ts-types";
import type { GridInternal, InputEditorState } from "../../ts-types-internal";
import {
  array,
  cellEquals,
  event,
  isPromise,
  obj,
  then,
} from "../../internal/utils";
import { isDisabledRecord, isReadOnlyRecord } from "./action-utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";
import { Editor } from "./Editor";
import { InlineMenuElement } from "./internal/InlineMenuElement";
import { MenuColumn } from "../type";
import type { RangePasteContext } from "./BaseAction";
import { getInlineMenuEditorStateId } from "../../internal/symbolManager";
import { normalizeToFn } from "../../internal/menu-items";
const _ = getInlineMenuEditorStateId();

function getState<T>(grid: GridInternal<T>): InputEditorState {
  let state = grid[_];
  if (!state) {
    state = {};
    obj.setReadonly(grid, _, state);
  }
  return state;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalElement: InlineMenuElement<any> | null = null;
let bindGridCount = 0;
function attachMenu<T>(
  grid: ListGridAPI<T>,
  cell: CellAddress,
  editor: InlineMenuEditor<T>,
  value: string,
  record: T | undefined
): void {
  const state = getState(grid);
  if (!globalElement) {
    globalElement = new InlineMenuElement();
  }
  if (!state.element) {
    state.element = globalElement;
    bindGridCount++;
    grid.addDisposable({
      dispose() {
        bindGridCount--;
        if (!bindGridCount) {
          globalElement?.dispose();
          globalElement = null;
          state.element = null;
        }
      },
    });
  }

  globalElement.attach(grid, editor, cell.col, cell.row, value, record);
}
function detachMenu(gridFocus?: boolean): void {
  if (globalElement) {
    globalElement.detach(gridFocus);
  }
}

const KEY_ENTER = 13;
const KEY_F2 = 113;

export class InlineMenuEditor<T> extends Editor<T> {
  private _classList?: string | string[];
  private _options: (record: T | undefined) => ColumnMenuItemOption[];
  constructor(option: InlineMenuEditorOption<T> = {}) {
    super(option);
    this._classList = option.classList;
    this._options = normalizeToFn(option.options);
  }
  dispose(): void {
    // noop
  }
  get classList(): string[] | undefined {
    if (!this._classList) {
      return undefined;
    }
    return Array.isArray(this._classList) ? this._classList : [this._classList];
  }
  set classList(classList: string[] | undefined) {
    this._classList = classList;
  }
  get options(): (record: T | undefined) => ColumnMenuItemOption[] {
    return this._options;
  }
  set options(options: (record: T | undefined) => ColumnMenuItemOption[]) {
    this._options = normalizeToFn(options);
  }
  clone(): InlineMenuEditor<T> {
    return new InlineMenuEditor(this);
  }
  onChangeDisabledInternal(): void {
    // cancel input
    detachMenu(true);
  }
  onChangeReadOnlyInternal(): void {
    // cancel input
    detachMenu(true);
  }
  bindGridEvent(
    grid: GridInternal<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    const open = (cell: CellAddress): boolean => {
      if (
        isReadOnlyRecord(this.readOnly, grid, cell.row) ||
        isDisabledRecord(this.disabled, grid, cell.row)
      ) {
        return false;
      }
      grid.doGetCellValue(cell.col, cell.row, (value) => {
        const record = grid.getRowRecord(cell.row);
        if (isPromise(record)) {
          return;
        }
        attachMenu(grid, cell, this, value, record);
      });
      return true;
    };

    function isTarget(col: number, row: number): boolean {
      return grid.getLayoutCellId(col, row) === cellId;
    }
    return [
      grid.listen(DG_EVENT_TYPE.CLICK_CELL, (cell) => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        open({
          col: cell.col,
          row: cell.row,
        });
      }),
      grid.listen(DG_EVENT_TYPE.KEYDOWN, (e) => {
        if (e.keyCode !== KEY_F2 && e.keyCode !== KEY_ENTER) {
          return;
        }
        const sel = grid.selection.select;
        if (!isTarget(sel.col, sel.row)) {
          return;
        }

        if (
          open({
            col: sel.col,
            row: sel.row,
          })
        ) {
          e.stopCellMoving();
        }
      }),
      grid.listen(DG_EVENT_TYPE.SELECTED_CELL, (_e) => {
        detachMenu();
      }),
      grid.listen(DG_EVENT_TYPE.SCROLL, () => {
        detachMenu(true);
      }),

      // mouse move
      grid.listen(DG_EVENT_TYPE.MOUSEOVER_CELL, (e) => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, e.row) ||
          isDisabledRecord(this.disabled, grid, e.row)
        ) {
          return;
        }
        grid.getElement().style.cursor = "pointer";
      }),
      grid.listen(DG_EVENT_TYPE.MOUSEMOVE_CELL, (e) => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, e.row) ||
          isDisabledRecord(this.disabled, grid, e.row)
        ) {
          return;
        }
        if (!grid.getElement().style.cursor) {
          grid.getElement().style.cursor = "pointer";
        }
      }),
      grid.listen(DG_EVENT_TYPE.MOUSEOUT_CELL, (e) => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        grid.getElement().style.cursor = "";
      }),

      // paste value
      grid.listen(DG_EVENT_TYPE.PASTE_CELL, (e) => {
        if (e.multi) {
          // ignore multi cell values
          return;
        }
        const selectionRange = grid.selection.range;
        if (!cellEquals(selectionRange.start, selectionRange.end)) {
          // ignore multi paste values
          return;
        }
        if (!isTarget(e.col, e.row)) {
          return;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, e.row) ||
          isDisabledRecord(this.disabled, grid, e.row)
        ) {
          return;
        }
        const record = grid.getRowRecord(e.row);
        if (isPromise(record)) {
          return;
        }
        const pasteOpt = this._pasteDataToOptionValue(
          e.normalizeValue,
          grid,
          e,
          record
        );
        if (pasteOpt) {
          event.cancel(e.event);
          then(
            grid.doChangeValue(e.col, e.row, () => pasteOpt.value),
            () => {
              const range = grid.getCellRange(e.col, e.row);
              grid.invalidateCellRange(range);
            }
          );
        } else {
          grid.fireListeners("rejected_paste_values", {
            detail: [
              {
                col: e.col,
                row: e.row,
                record,
                define: grid.getColumnDefine(e.col, e.row),
                pasteValue: e.normalizeValue,
              },
            ],
          });
        }
      }),
    ];
  }
  onPasteCellRangeBox(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    value: string,
    context: RangePasteContext
  ): void {
    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row)
    ) {
      return;
    }
    const record = grid.getRowRecord(cell.row);
    if (isPromise(record)) {
      return;
    }
    const pasteOpt = this._pasteDataToOptionValue(value, grid, cell, record);
    if (pasteOpt) {
      grid.doChangeValue(cell.col, cell.row, () => pasteOpt.value);
    } else {
      // unknown
      context.reject();
    }
  }
  onDeleteCellRangeBox(grid: ListGridAPI<T>, cell: CellAddress): void {
    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row)
    ) {
      return;
    }
    const record = grid.getRowRecord(cell.row);
    if (isPromise(record)) {
      return;
    }
    const pasteOpt = this._pasteDataToOptionValue("", grid, cell, record);
    if (pasteOpt) {
      grid.doChangeValue(cell.col, cell.row, () => pasteOpt.value);
    }
  }
  private _pasteDataToOptionValue(
    value: string,
    grid: ListGridAPI<T>,
    cell: CellAddress,
    record: T | undefined
  ): SimpleColumnMenuItemOption | undefined {
    const options = this._options(record);
    const pasteOpt = _textToOptionValue(value, options);
    if (pasteOpt) {
      return pasteOpt;
    }
    const columnType = grid.getColumnType(cell.col, cell.row);
    if (hasOptions(columnType)) {
      // Find with caption.
      const pasteValue = normalizePasteValueStr(value);
      const captionOpt = array.find(
        columnType.options,
        (opt) => normalizePasteValueStr(opt.label) === pasteValue
      );
      if (captionOpt) {
        return _textToOptionValue(captionOpt.value, options);
      }
    }
    return undefined;
  }
}
function _textToOptionValue(
  value: string,
  options: SimpleColumnMenuItemOption[]
): SimpleColumnMenuItemOption | undefined {
  const pasteValue = normalizePasteValueStr(value);
  const pasteOpt = array.find(
    options,
    (opt) => normalizePasteValueStr(opt.value) === pasteValue
  );
  if (pasteOpt) {
    return pasteOpt;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePasteValueStr(value: any): string {
  if (value == null) {
    return "";
  }
  return `${value}`.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasOptions(columnType: ColumnTypeAPI): columnType is MenuColumn<any> {
  if (columnType instanceof MenuColumn) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (Array.isArray((columnType as any).options)) {
    return true;
  }

  return false;
}
