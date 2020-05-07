import type {
  CellAddress,
  EventListenerId,
  LayoutObjectId,
} from "../../ts-types";
import type { CheckHeaderState, GridInternal } from "../../ts-types-internal";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import { BaseAction } from "./BaseAction";
import { animate } from "../../internal/animate";
import { getCheckHeaderStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";

const CHECK_HEADER_STATE_ID = getCheckHeaderStateId();

function getState<T>(grid: GridInternal<T>): CheckHeaderState {
  let state = grid[CHECK_HEADER_STATE_ID];
  if (!state) {
    state = { elapsed: {}, block: {} };
    obj.setReadonly(grid, CHECK_HEADER_STATE_ID, state);
  }
  return state;
}

export class CheckHeaderAction<T> extends BaseAction<T> {
  clone(): CheckHeaderAction<T> {
    return new CheckHeaderAction(this);
  }
  bindGridEvent(
    grid: GridInternal<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    const state = getState(grid);

    const action = ({ col, row }: CellAddress): void => {
      const range = grid.getCellRange(col, row);
      const cellKey = `${range.start.col}:${range.start.row}`;
      if (this.disabled || state.block[cellKey]) {
        return;
      }
      const checked = grid.getHeaderValue(range.start.col, range.start.row);
      grid.setHeaderValue(range.start.col, range.start.row, !checked);

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
      onChange();
    };
    return [
      ...bindCellClickAction(grid, cellId, {
        action,
        mouseOver: (e) => {
          if (this.disabled) {
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
}
