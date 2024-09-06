import type { ActionAreaPredicate, ButtonActionOption } from "../../ts-types";
import type { ButtonColumnState, GridInternal } from "../../ts-types-internal";
import { AbstractAction } from "./Action";
import { getButtonColumnStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";

const BUTTON_COLUMN_STATE_ID = getButtonColumnStateId();
export class ButtonAction<T> extends AbstractAction<T> {
  constructor(option: ButtonActionOption = {}) {
    super(option);
  }
  get area(): ActionAreaPredicate | undefined {
    return undefined;
  }
  set area(_area: ActionAreaPredicate | undefined) {
    // noop
  }
  clone(): ButtonAction<T> {
    return new ButtonAction(this);
  }
  getState(grid: GridInternal<T>): ButtonColumnState {
    let state = grid[BUTTON_COLUMN_STATE_ID];
    if (!state) {
      state = {};
      obj.setReadonly(grid, BUTTON_COLUMN_STATE_ID, state);
    }
    return state;
  }
}
