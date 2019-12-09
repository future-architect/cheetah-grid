import { CellAddress, CellRange, EventListenerId } from "../../ts-types";
import { CheckHeaderState, GridInternal } from "../../ts-types-internal";
import { bindCellClickAction, bindCellKeyAction } from "./actionBind";
import { BaseAction } from "./BaseAction";
import { animate } from "../../internal/animate";
import { getCheckHeaderStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";

const CHECK_HEADER_STATE_ID = getCheckHeaderStateId();
const KEY_ENTER = 13;
const KEY_SPACE = 32;

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
  bindGridEvent(grid: GridInternal<T>, range: CellRange): EventListenerId[] {
    const state = getState(grid);

    const action = ({ col, row }: CellAddress): void => {
      const cellKey = `${col}:${row}`;
      if (this.disabled || state.block[cellKey]) {
        return;
      }
      const checked = grid.getHeaderValue(col, row);
      grid.setHeaderValue(col, row, !checked);

      const onChange = (): void => {
        // checkbox animation
        animate(200, point => {
          if (point === 1) {
            delete state.elapsed[cellKey];
          } else {
            state.elapsed[cellKey] = point;
          }
          grid.invalidateGridRect(
            range.start.col,
            range.start.row,
            range.end.col,
            range.end.row
          );
        });
      };
      onChange();
    };
    return [
      ...bindCellClickAction(grid, range, {
        action,
        mouseOver: e => {
          if (this.disabled) {
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
      ...bindCellKeyAction(grid, range, {
        action,
        acceptKeys: [KEY_ENTER, KEY_SPACE]
      })
    ];
  }
}
