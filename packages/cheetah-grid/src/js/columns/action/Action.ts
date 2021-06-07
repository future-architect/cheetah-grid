import type {
  ActionListener,
  ActionOption,
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
} from "../../ts-types";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import { BaseAction } from "./BaseAction";
import type { GridInternal } from "../../ts-types-internal";
import { extend } from "../../internal/utils";
import { isDisabledRecord } from "./action-utils";

export class Action<T> extends BaseAction<T> {
  private _action: ActionListener;
  constructor(option: ActionOption = {}) {
    super(option);
    this._action = option.action || ((): void => {});
  }
  get editable(): boolean {
    return false;
  }
  get action(): ActionListener {
    return this._action;
  }
  set action(action: ActionListener) {
    this._action = action;
  }
  clone(): Action<T> {
    return new Action(this);
  }
  getState(_grid: GridInternal<T>): { mouseActiveCell?: CellAddress } {
    return {};
  }
  bindGridEvent(
    grid: ListGridAPI<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    const state = this.getState(grid);
    const action = (cell: CellAddress): void => {
      if (isDisabledRecord(this.disabled, grid, cell.row)) {
        return;
      }
      const record = grid.getRowRecord(cell.row);
      this._action(record, extend(cell, { grid }));
    };

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
    ];
  }
  onPasteCellRangeBox(): void {
    // noop
  }
  onDeleteCellRangeBox(): void {
    // noop
  }
}
