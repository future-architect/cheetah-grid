import type {
  BaseActionOption,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
} from "../../ts-types";

export class BaseAction<T> {
  protected _disabled: boolean;
  constructor(option: BaseActionOption = {}) {
    this._disabled = !!option.disabled || false;
  }
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.onChangeDisabledInternal();
  }
  clone(): BaseAction<T> {
    return new BaseAction(this);
  }
  bindGridEvent(
    _grid: ListGridAPI<T>,
    _cellId: LayoutObjectId
  ): EventListenerId[] {
    return [];
  }
  onChangeDisabledInternal(): void {
    // impl
  }
}
