import type {
  CellAddress,
  EventListenerId,
  LayoutObjectId,
} from "../../ts-types";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import { cellEquals, event, isPromise, obj } from "../../internal/utils";
import {
  isDisabledRecord,
  isReadOnlyRecord,
  toggleValue,
} from "./action-utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";
import { Editor } from "./Editor";
import type { GridInternal } from "../../ts-types-internal";
import type { RangePasteContext } from "./BaseAction";
import { animate } from "../../internal/animate";
import { getCheckColumnStateId } from "../../internal/symbolManager";

const CHECK_COLUMN_STATE_ID = getCheckColumnStateId();

export class CheckEditor<T> extends Editor<T> {
  clone(): CheckEditor<T> {
    return new CheckEditor(this);
  }
  bindGridEvent(
    grid: GridInternal<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    let _state = grid[CHECK_COLUMN_STATE_ID];
    if (!_state) {
      _state = { block: {}, elapsed: {} };
      obj.setReadonly(grid, CHECK_COLUMN_STATE_ID, _state);
    }
    const state = _state;

    const action = (cell: CellAddress): void => {
      const range = grid.getCellRange(cell.col, cell.row);
      const cellKey = `${range.start.col}:${range.start.row}`;

      if (
        isReadOnlyRecord(this.readOnly, grid, cell.row) ||
        isDisabledRecord(this.disabled, grid, cell.row) ||
        state.block[cellKey]
      ) {
        return;
      }
      const ret = grid.doChangeValue(cell.col, cell.row, toggleValue);
      if (ret) {
        const onChange = (): void => {
          // checkbox animation
          animate(200, (point) => {
            if (point === 1) {
              delete state.elapsed[cellKey];
            } else {
              state.elapsed[cellKey] = point;
            }
            grid.invalidateCellRange(range);
          });
        };
        if (isPromise(ret)) {
          state.block[cellKey] = true;
          ret.then(() => {
            delete state.block[cellKey];
            onChange();
          });
        } else {
          onChange();
        }
      }
    };

    function isTarget(col: number, row: number): boolean {
      return grid.getLayoutCellId(col, row) === cellId;
    }
    return [
      ...bindCellClickAction(grid, cellId, {
        action,
        mouseOver: (e) => {
          if (isDisabledRecord(this.disabled, grid, e.row)) {
            return false;
          }
          state.mouseActiveCell = {
            col: e.col,
            row: e.row,
          };
          const range = grid.getCellRange(e.col, e.row);
          grid.invalidateCellRange(range);
          return true;
        },
        mouseOut: (e) => {
          delete state.mouseActiveCell;
          const range = grid.getCellRange(e.col, e.row);
          grid.invalidateCellRange(range);
        },
      }),
      ...bindCellKeyAction(grid, cellId, {
        action: (_e) => {
          const selrange = grid.selection.range;
          const { col } = grid.selection.select;
          for (let { row } = selrange.start; row <= selrange.end.row; row++) {
            if (!isTarget(col, row)) {
              continue;
            }
            action({
              col,
              row,
            });
          }
        },
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
        event.cancel(e.event);

        const pasteValue = e.normalizeValue.trim();
        grid.doGetCellValue(e.col, e.row, (value) => {
          const newValue = toggleValue(value);
          if (`${newValue}`.trim() === pasteValue) {
            action({
              col: e.col,
              row: e.row,
            });
          } else if (isRejectValue(value, pasteValue)) {
            const record = grid.getRowRecord(e.row);
            if (!isPromise(record)) {
              grid.fireListeners("rejected_paste_values", {
                detail: [
                  {
                    col: e.col,
                    row: e.row,
                    record,
                    define: grid.getColumnDefine(e.col, e.row),
                    pasteValue,
                  },
                ],
              });
            }
          }
        });
      }),
    ];
  }
  onPasteCellRangeBox(
    grid: GridInternal<T>,
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
    const pasteValue = value.trim();
    grid.doGetCellValue(cell.col, cell.row, (value) => {
      const newValue = toggleValue(value);
      if (`${newValue}`.trim() === pasteValue) {
        grid.doChangeValue(cell.col, cell.row, toggleValue);
      } else if (isRejectValue(value, pasteValue)) {
        context.reject();
      }
    });
  }
  onDeleteCellRangeBox(): void {
    // noop
  }
}

function isRejectValue(oldValue: string, pasteValue: string) {
  if ((oldValue != null ? `${oldValue}`.trim() : "") === pasteValue) {
    return false;
  }
  const newValue = toggleValue(oldValue);
  return (
    `${newValue}`.trim() !== pasteValue &&
    `${toggleValue(newValue)}`.trim() !== pasteValue
  );
}
