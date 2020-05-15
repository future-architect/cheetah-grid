import type {
  CellAddress,
  EditorOption,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
} from "../../ts-types";
import { cellEquals, event } from "../../internal/utils";
import { isDisabledRecord, isReadOnlyRecord } from "./action-utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";
import { Editor } from "./Editor";
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
    const open = (cell: CellAddress): boolean => {
      if (
        isReadOnlyRecord(this.readOnly, grid, cell.row) ||
        isDisabledRecord(this.disabled, grid, cell.row)
      ) {
        return false;
      }
      this.onOpenCellInternal(grid, cell);
      return true;
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
      grid.listen(DG_EVENT_TYPE.INPUT_CELL, (e) => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        input(
          {
            col: e.col,
            row: e.row,
          },
          e.value
        );
      }),
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
        event.cancel(e.event);
        input(
          {
            col: e.col,
            row: e.row,
          },
          e.normalizeValue
        );
      }),
      grid.listen(DG_EVENT_TYPE.DBLCLICK_CELL, (cell) => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        open({
          col: cell.col,
          row: cell.row,
        });
      }),
      grid.listen(DG_EVENT_TYPE.DBLTAP_CELL, (e) => {
        if (!isTarget(e.col, e.row)) {
          return;
        }
        open({
          col: e.col,
          row: e.row,
        });

        event.cancel(e.event);
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
      grid.listen(DG_EVENT_TYPE.SELECTED_CELL, (e) => {
        this.onChangeSelectCellInternal(
          grid,
          { col: e.col, row: e.row },
          e.selected
        );
      }),
      grid.listen(DG_EVENT_TYPE.SCROLL, () => {
        this.onGridScrollInternal(grid);
      }),
      grid.listen(DG_EVENT_TYPE.EDITABLEINPUT_CELL, (cell) => {
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
      grid.listen(DG_EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL, (cell) => {
        if (!isTarget(cell.col, cell.row)) {
          return;
        }
        if (
          isReadOnlyRecord(this.readOnly, grid, cell.row) ||
          isDisabledRecord(this.disabled, grid, cell.row)
        ) {
          return;
        }
        const range = grid.getCellRange(cell.col, cell.row);
        if (
          range.start.col !== range.end.col ||
          range.start.row !== range.end.row
        ) {
          const { input } = cell;
          const baseRect = grid.getCellRect(cell.col, cell.row);
          const rangeRect = grid.getCellRangeRect(range);
          input.style.top = `${(
            parseFloat(input.style.top) +
            (rangeRect.top - baseRect.top)
          ).toFixed()}px`;
          input.style.left = `${(
            parseFloat(input.style.left) +
            (rangeRect.left - baseRect.left)
          ).toFixed()}px`;
          input.style.width = `${rangeRect.width.toFixed()}px`;
          input.style.height = `${rangeRect.height.toFixed()}px`;
        }
        this.onSetInputAttrsInternal(
          grid,
          {
            col: cell.col,
            row: cell.row,
          },
          cell.input
        );
      }),
    ];
  }
  onPasteCellRangeBox(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    value: string
  ): void {
    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row)
    ) {
      return;
    }
    grid.doChangeValue(cell.col, cell.row, () => value);
  }
  onDeleteCellRangeBox(grid: ListGridAPI<T>, cell: CellAddress): void {
    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row)
    ) {
      return;
    }
    grid.doChangeValue(cell.col, cell.row, () => "");
  }
}
