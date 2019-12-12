import {
  BaseActionOption,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI
} from "../../ts-types";

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
    _cellId: LayoutObjectId
  ): EventListenerId[] {
    return [];
  }
  onChangeDisabledInternal(): void {
    // abstruct
  }
}
