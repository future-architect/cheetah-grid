import type {
  AbstractActionOption,
  ActionAreaPredicate,
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

export abstract class AbstractAction<T> extends BaseAction<T> {
  private _action: ActionListener;
  constructor(option: AbstractActionOption = {}) {
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
  abstract get area(): ActionAreaPredicate | undefined;
  abstract set area(_area: ActionAreaPredicate | undefined);
  abstract clone(): AbstractAction<T>;
  abstract getState(_grid: GridInternal<T>): { mouseActiveCell?: CellAddress };
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
        area: (e) => {
          if (!this.area) {
            return true;
          }

          const { event } = e;
          const clientX = event.clientX || event.pageX + window.scrollX;
          const clientY = event.clientY || event.pageY + window.scrollY;
          const canvasRect = grid.canvas.getBoundingClientRect();
          const xInCanvas = clientX - canvasRect.left;
          const yInCanvas = clientY - canvasRect.top;

          const rect = grid.getCellRect(e.col, e.row);
          return this.area({
            col: e.col,
            row: e.row,
            grid,
            pointInCell: {
              x: xInCanvas - rect.left + grid.scrollLeft,
              y: yInCanvas - rect.top + grid.scrollTop,
            },
            pointInDrawingCanvas: {
              x: xInCanvas,
              y: yInCanvas,
            },
          });
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

export class Action<T> extends AbstractAction<T> {
  private _area?: ActionAreaPredicate;
  constructor(option: ActionOption = {}) {
    super(option);
    this._area = option.area;
  }
  get area(): ActionAreaPredicate | undefined {
    return this._area;
  }
  set area(area: ActionAreaPredicate | undefined) {
    this._area = area;
  }
  clone(): Action<T> {
    return new Action(this);
  }
  getState(_grid: GridInternal<T>): { mouseActiveCell?: CellAddress } {
    return {};
  }
}
