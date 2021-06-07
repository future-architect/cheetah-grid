import type {
  ActionListener,
  CellAddress,
  EventListenerId,
  GetRadioEditorGroup,
  LayoutObjectId,
  RadioEditorOption,
} from "../../ts-types";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import {
  cellEquals,
  event,
  extend,
  isPromise,
  obj,
  then,
} from "../../internal/utils";
import {
  isDisabledRecord,
  isReadOnlyRecord,
  toggleValue,
} from "./action-utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";
import { Editor } from "./Editor";
import type { GridInternal } from "../../ts-types-internal";
import { animate } from "../../internal/animate";
import { getRadioColumnStateId } from "../../internal/symbolManager";
import { toBoolean } from "../utils";

const RADIO_COLUMN_STATE_ID = getRadioColumnStateId();

export class RadioEditor<T> extends Editor<T> {
  protected _group: GetRadioEditorGroup<T> | undefined;
  private _checkAction: ActionListener | undefined;
  constructor(option: RadioEditorOption<T> = {}) {
    super(option);
    this._group = option.group;
    this._checkAction = option.checkAction;
  }
  clone(): RadioEditor<T> {
    return new RadioEditor(this);
  }
  /** @deprecated Use checkAction instead. */
  get group(): GetRadioEditorGroup<T> | undefined {
    return this._group;
  }
  /** @deprecated Use checkAction instead. */
  set group(group: GetRadioEditorGroup<T> | undefined) {
    this._group = group;
  }
  get checkAction(): ActionListener | undefined {
    return this._checkAction;
  }
  set checkAction(checkAction: ActionListener | undefined) {
    this._checkAction = checkAction;
  }
  bindGridEvent(
    grid: GridInternal<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    let _state = grid[RADIO_COLUMN_STATE_ID];
    if (!_state) {
      _state = { block: {}, elapsed: {} };
      obj.setReadonly(grid, RADIO_COLUMN_STATE_ID, _state);
    }
    const state = _state;

    const action = (cell: CellAddress): void => {
      this._action(grid, cell);
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
        action,
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

        const pasteValue = e.normalizeValue.trim();
        if (!toBoolean(pasteValue)) {
          return;
        }
        event.cancel(e.event);

        action({
          col: e.col,
          row: e.row,
        });
      }),
    ];
  }
  onPasteCellRangeBox(
    grid: GridInternal<T>,
    cell: CellAddress,
    value: string
  ): void {
    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row)
    ) {
      return;
    }
    const pasteValue = value.trim();
    if (!toBoolean(pasteValue)) {
      return;
    }
    this._action(grid, {
      col: cell.col,
      row: cell.row,
    });
  }
  onDeleteCellRangeBox(): void {
    // noop
  }
  private _action(grid: GridInternal<T>, cell: CellAddress): void {
    const state = grid[RADIO_COLUMN_STATE_ID]!;
    const range = grid.getCellRange(cell.col, cell.row);
    const cellKey = `${range.start.col}:${range.start.row}`;

    if (
      isReadOnlyRecord(this.readOnly, grid, cell.row) ||
      isDisabledRecord(this.disabled, grid, cell.row) ||
      state.block[cellKey]
    ) {
      return;
    }

    grid.doGetCellValue(cell.col, cell.row, (value) => {
      if (toBoolean(value)) {
        return;
      }
      if (this._checkAction) {
        // User behavior
        const record = grid.getRowRecord(cell.row);
        this._checkAction(record, extend(cell, { grid }));
        return;
      }
      if (this._group) {
        // Backward compatibility
        const state = grid[RADIO_COLUMN_STATE_ID]!;

        const targets = this._group({ grid, col: cell.col, row: cell.row });
        targets.forEach(({ col, row }) => {
          const range = grid.getCellRange(col, row);
          const cellKey = `${range.start.col}:${range.start.row}`;

          if (
            isReadOnlyRecord(this.readOnly, grid, cell.row) ||
            isDisabledRecord(this.disabled, grid, cell.row) ||
            state.block[cellKey]
          ) {
            return;
          }

          actionCell(grid, col, row, col === cell.col && row === cell.row);
        });
        return;
      }

      // default behavior
      const field = grid.getField(cell.col, cell.row)!;
      const recordStartRow = grid.getRecordStartRowByRecordIndex(
        grid.getRecordIndexByRow(cell.row)
      );

      /** Original DataSource */
      const { dataSource } = grid.dataSource;

      const girdRecords = getAllRecordsFromGrid(grid);

      for (let index = 0; index < dataSource.length; index++) {
        const record = dataSource.get(index);
        const showData = girdRecords.find((d) => d.record === record);
        if (showData) {
          actionCell(
            grid,
            cell.col,
            showData.row,
            showData.row === recordStartRow
          );
        } else {
          // Hidden record
          then(dataSource.getField(index, field), (value) => {
            if (!toBoolean(value)) {
              return;
            }
            dataSource.setField(index, field, toggleValue(value));
          });
        }
      }
    });
  }
}

function getAllRecordsFromGrid<T>(grid: GridInternal<T>) {
  const result = [];
  const { rowCount, recordRowCount } = grid;
  for (
    let targetRow = grid.frozenRowCount;
    targetRow < rowCount;
    targetRow += recordRowCount
  ) {
    const record = grid.getRowRecord(targetRow);
    result.push({ row: targetRow, record });
  }
  return result;
}

function actionCell<T>(
  grid: GridInternal<T>,
  col: number,
  row: number,
  flag: boolean
): void {
  grid.doGetCellValue(col, row, (value) => {
    if (toBoolean(value) === flag) {
      return;
    }

    const state = grid[RADIO_COLUMN_STATE_ID]!;
    const range = grid.getCellRange(col, row);
    const cellKey = `${range.start.col}:${range.start.row}`;
    const ret = grid.doChangeValue(col, row, toggleValue);
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
  });
}
