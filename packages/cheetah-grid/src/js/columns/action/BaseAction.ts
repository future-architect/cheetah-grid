import type {
  BaseActionOption,
  CellAddress,
  ColumnActionAPI,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
  RecordBoolean,
} from "../../ts-types";

export type RangePasteContext = {
  reject(): void;
};

export abstract class BaseAction<T> implements ColumnActionAPI {
  protected _disabled: RecordBoolean;
  constructor(option: BaseActionOption = {}) {
    this._disabled = option.disabled || false;
  }
  abstract get editable(): boolean;
  get disabled(): RecordBoolean {
    return this._disabled;
  }
  set disabled(disabled: RecordBoolean) {
    this._disabled = disabled;
    this.onChangeDisabledInternal();
  }
  abstract clone(): BaseAction<T>;
  abstract bindGridEvent(
    grid: ListGridAPI<T>,
    cellId: LayoutObjectId
  ): EventListenerId[];
  protected onChangeDisabledInternal(): void {
    // abstract
  }
  abstract onPasteCellRangeBox(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    value: string,
    context: RangePasteContext
  ): void;
  abstract onDeleteCellRangeBox(grid: ListGridAPI<T>, cell: CellAddress): void;
}
