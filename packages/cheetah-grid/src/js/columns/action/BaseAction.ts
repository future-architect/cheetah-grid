import type {
  BaseActionOption,
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
} from "../../ts-types";

export abstract class BaseAction<T> {
  protected _disabled: boolean;
  constructor(option: BaseActionOption = {}) {
    this._disabled = option.disabled || false;
  }
  abstract get editable(): boolean;
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = disabled;
    this.onChangeDisabledInternal();
  }
  abstract clone(): BaseAction<T>;
  abstract bindGridEvent(
    grid: ListGridAPI<T>,
    cellId: LayoutObjectId
  ): EventListenerId[];
  protected onChangeDisabledInternal(): void {
    // abstruct
  }
  abstract onPasteCellRangeBox(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    value: string
  ): void;
  abstract onDeleteCellRangeBox(grid: ListGridAPI<T>, cell: CellAddress): void;
}
