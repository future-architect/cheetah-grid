import {
  ActionListener,
  ActionOption,
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI
} from "../../ts-types";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import { BaseAction } from "./BaseAction";
import { GridInternal } from "../../ts-types-internal";
import { isDisabledRecord } from "./action-utils";

export class Action<T> extends BaseAction<T> {
  private _action: ActionListener;
  constructor(option: ActionOption = {}) {
    super(option);
    this._action = option.action || ((): void => {});
  }
  get action(): ActionListener {
    return this._action;
  }
  set action(action) {
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
      this._action(record);
    };

    return [
      ...bindCellClickAction(grid, cellId, {
        action,
        mouseOver: e => {
          if (isDisabledRecord(this.disabled, grid, e.row)) {
            return false;
          }
          state.mouseActiveCell = {
            col: e.col,
            row: e.row
          };
          grid.invalidateCell(e.col, e.row);
          return true;
        },
        mouseOut: e => {
          delete state.mouseActiveCell;
          grid.invalidateCell(e.col, e.row);
        }
      }),
      ...bindCellKeyAction(grid, cellId, {
        action
      })
    ];
  }
}
