import {
  CellAddress,
  ColumnMenuItemOption,
  EventListenerId,
  InlineMenuEditorOption,
  LayoutObjectId,
  ListGridAPI
} from "../../ts-types";
import { GridInternal, InputEditorState } from "../../ts-types-internal";
import { array, event, obj, then } from "../../internal/utils";
import { isDisabledRecord, isReadOnlyRecord } from "./action-utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";
import { Editor } from "./Editor";
import { InlineMenuElement } from "./internal/InlineMenuElement";
import { getInlineMenuEditorStateId } from "../../internal/symbolManager";
import { normalize } from "../../internal/menu-items";
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
  value: string
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
      }
    });
  }

  globalElement.attach(grid, editor, cell.col, cell.row, value);
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
  private _options: ColumnMenuItemOption[];
  constructor(option: InlineMenuEditorOption = {}) {
    super(option);
    this._classList = option.classList;
    this._options = normalize(option.options);
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
  set classList(classList) {
    this._classList = classList;
  }
  get options(): ColumnMenuItemOption[] {
    return this._options;
  }
  set options(options) {
    this._options = normalize(options);
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
    grid: ListGridAPI<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    const open = (cell: CellAddress): void => {
      if (
        isReadOnlyRecord(this.readOnly, grid, cell.row) ||
        isDisabledRecord(this.disabled, grid, cell.row)
      ) {
        return;
      }
      grid.doGetCellValue(cell.col, cell.row, value => {
        attachMenu(grid, cell, this, value);
      });
    };

    function isTarget(col: number, row: number): boolean {
      return grid.getLayoutCellId(col, row) === cellId;
    }
    return [
      grid.listen(DG_EVENT_TYPE.CLICK_CELL, cell => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        open({
          col: cell.col,
          row: cell.row
        });
      }),
      grid.listen(DG_EVENT_TYPE.KEYDOWN, (keyCode, _e) => {
        if (keyCode !== KEY_F2 && keyCode !== KEY_ENTER) {
          return;
        }
        const sel = grid.selection.select;
        if (!isTarget(sel.col, sel.row)) {
          return;
        }
        open({
          col: sel.col,
          row: sel.row
        });
      }),
      grid.listen(DG_EVENT_TYPE.SELECTED_CELL, _e => {
        detachMenu();
      }),
      grid.listen(DG_EVENT_TYPE.SCROLL, () => {
        detachMenu(true);
      }),

      // mouse move
      grid.listen(DG_EVENT_TYPE.MOUSEOVER_CELL, e => {
        if (
          isReadOnlyRecord(this.readOnly, grid, e.row) ||
          isDisabledRecord(this.disabled, grid, e.row)
        ) {
          return;
        }
        if (!isTarget(e.col, e.row)) {
          return;
        }
        grid.getElement().style.cursor = "pointer";
      }),
      grid.listen(DG_EVENT_TYPE.MOUSEMOVE_CELL, e => {
        if (
          isReadOnlyRecord(this.readOnly, grid, e.row) ||
          isDisabledRecord(this.disabled, grid, e.row)
        ) {
          return;
        }
        if (!isTarget(e.col, e.row)) {
          return;
        }
        if (!grid.getElement().style.cursor) {
          grid.getElement().style.cursor = "pointer";
        }
      }),
      grid.listen(DG_EVENT_TYPE.MOUSEOUT_CELL, e => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        grid.getElement().style.cursor = "";
      }),

      // paste value
      grid.listen(DG_EVENT_TYPE.PASTE_CELL, e => {
        if (e.multi) {
          // ignore multi cell values
          return;
        }
        if (!isTarget(e.col, e.row)) {
          return;
        }
        const pasteValue = e.normalizeValue.trim();
        const pasteOpt = array.find(
          this._options,
          opt => `${opt.value}`.trim() === pasteValue
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
        }
      })
    ];
  }
}
