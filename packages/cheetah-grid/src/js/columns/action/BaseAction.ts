import { BaseActionOption, EventListenerId, ListGridAPI } from "../../ts-types";
import { ActionBindUtil } from "./actionBind";

export abstract class BaseAction<T> {
  protected _disabled: boolean;
  constructor(option: BaseActionOption = {}) {
    this._disabled = option.disabled || false;
  }
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = disabled;
    this.onChangeDisabledInternal();
  }
  abstract clone(): BaseAction<T>;
  bindGridEvent(
    _grid: ListGridAPI<T>,
    _col: number,
    _util: ActionBindUtil
  ): EventListenerId[] {
    return [];
  }
  onChangeDisabledInternal(): void {
    // abstruct
  }
}
