import {
  CellAddress,
  EditorOption,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI
} from "../../ts-types";
import { isDisabledRecord, isReadOnlyRecord } from "./action-utils";
import { EVENT_TYPE } from "../../core/EVENT_TYPE";
import { Editor } from "./Editor";
import { event } from "../../internal/utils";
const KEY_ENTER = 13;
const KEY_F2 = 113;

export abstract class BaseInputEditor<T> extends Editor<T> {
  constructor(option: EditorOption = {}) {
    super(option);
  }
  abstract clone(): BaseInputEditor<T>;
  abstract onInputCellInternal(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    inputValue: string
  ): void;
  abstract onOpenCellInternal(grid: ListGridAPI<T>, cell: CellAddress): void;
  abstract onChangeSelectCellInternal(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    selected: boolean
  ): void;
  abstract onSetInputAttrsInternal(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    input: HTMLInputElement
  ): void;
  abstract onGridScrollInternal(grid: ListGridAPI<T>): void;
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
      this.onOpenCellInternal(grid, cell);
    };

    const input = (cell: CellAddress, value: string): void => {
      if (
        isReadOnlyRecord(this.readOnly, grid, cell.row) ||
        isDisabledRecord(this.disabled, grid, cell.row)
      ) {
        return;
      }
      this.onInputCellInternal(grid, cell, value);
    };

    function isTarget(col: number, row: number): boolean {
      return grid.getLayoutCellId(col, row) === cellId;
    }
    return [
      grid.listen(EVENT_TYPE.INPUT_CELL, e => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        input(
          {
            col: e.col,
            row: e.row
          },
          e.value
        );
      }),
      grid.listen(EVENT_TYPE.PASTE_CELL, e => {
        if (e.multi) {
          // ignore multi cell values
          return;
        }
        if (!isTarget(e.col, e.row)) {
          return;
        }
        event.cancel(e.event);
        input(
          {
            col: e.col,
            row: e.row
          },
          e.normalizeValue
        );
      }),
      grid.listen(EVENT_TYPE.DBLCLICK_CELL, cell => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        open({
          col: cell.col,
          row: cell.row
        });
      }),
      grid.listen(EVENT_TYPE.DBLTAP_CELL, e => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        open({
          col: e.col,
          row: e.row
        });

        event.cancel(e.event);
      }),
      grid.listen(EVENT_TYPE.KEYDOWN, (keyCode, _e) => {
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
      grid.listen(EVENT_TYPE.SELECTED_CELL, e => {
        this.onChangeSelectCellInternal(
          grid,
          { col: e.col, row: e.row },
          e.selected
        );
      }),
      grid.listen(EVENT_TYPE.SCROLL, () => {
        this.onGridScrollInternal(grid);
      }),
      grid.listen(EVENT_TYPE.EDITABLEINPUT_CELL, cell => {
        if (!isTarget(cell.col, cell.row)) {
          return false;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, cell.row) ||
          isDisabledRecord(this.disabled, grid, cell.row)
        ) {
          return false;
        }
        return true;
      }),
      grid.listen(EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL, cell => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, cell.row) ||
          isDisabledRecord(this.disabled, grid, cell.row)
        ) {
          return;
        }
        this.onSetInputAttrsInternal(
          grid,
          {
            col: cell.col,
            row: cell.row
          },
          cell.input
        );
      })
    ];
  }
}
