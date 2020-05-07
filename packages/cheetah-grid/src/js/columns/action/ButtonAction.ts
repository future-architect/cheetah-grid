import type { ButtonColumnState, GridInternal } from "../../ts-types-internal";
import { Action } from "./Action";
import { getButtonColumnStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";
const BUTTON_COLUMN_STATE_ID = getButtonColumnStateId();
export class ButtonAction<T> extends Action<T> {
  getState(grid: GridInternal<T>): ButtonColumnState {
    let state = grid[BUTTON_COLUMN_STATE_ID];
    if (!state) {
      state = {};
      obj.setReadonly(grid, BUTTON_COLUMN_STATE_ID, state);
    }
    return state;
  }
}
