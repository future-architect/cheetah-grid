import type {
  CellAddress,
  EventListenerId,
  GetRadioEditorGroup,
  LayoutObjectId,
  RadioEditorOption,
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
import { animate } from "../../internal/animate";
import { getRadioColumnStateId } from "../../internal/symbolManager";
import { toBoolean } from "../utils";

const RADIO_COLUMN_STATE_ID = getRadioColumnStateId();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultGroupResolver: GetRadioEditorGroup<any> = ({ grid, col, row }) => {
  const cellId = grid.getLayoutCellId(col, row);
  const recordStartRow = grid.getRecordStartRowByRecordIndex(
    grid.getRecordIndexByRow(row)
  );
  const offsetRow = row - recordStartRow;

  const result = [];
  const { rowCount, recordRowCount } = grid;
  for (
    let targetRow = grid.frozenRowCount + offsetRow;
    targetRow < rowCount;
    targetRow += recordRowCount
  ) {
    if (grid.getLayoutCellId(col, targetRow) === cellId) {
      result.push({ col, row: targetRow });
    }
  }
  return result;
};

export class RadioEditor<T> extends Editor<T> {
  protected _group: GetRadioEditorGroup<T>;
  constructor(option: RadioEditorOption<T> = {}) {
    super(option);
    this._group = option.group || defaultGroupResolver;
  }
  clone(): RadioEditor<T> {
    return new RadioEditor(this);
  }
  get group(): GetRadioEditorGroup<T> {
    return this._group;
  }
  set group(group: GetRadioEditorGroup<T>) {
    this._group = group;
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
    });
  }
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
