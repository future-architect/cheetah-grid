import { CellAddress, CellRange, FieldDef } from "./grid";
import { AnyFunction } from "./base";

export type KeyboardEventListener = (e: KeyboardEvent) => void;
export type AnyListener = AnyFunction;
export type EventListenerId = number;

export type BeforeSelectedCellEvent = CellAddress & {
  selected: false;
  after: CellAddress;
};
export type AfterSelectedCellEvent = CellAddress & {
  selected: true;
  before: CellAddress;
};
export type SelectedCellEvent =
  | BeforeSelectedCellEvent
  | AfterSelectedCellEvent;

export type MouseCellEvent = CellAddress & {
  event: MouseEvent;
};

export type TouchCellEvent = CellAddress & {
  event: TouchEvent;
};

export type PasteCellEvent = CellAddress & {
  value: string;
  normalizeValue: string;
  multi: boolean;
  event: ClipboardEvent;
};

export type InputCellEvent = CellAddress & {
  value: string;
};

export type ScrollEvent = {
  event: Event;
};

export type ModifyStatusEditableinputCellEvent = CellAddress & {
  input: HTMLInputElement;
};

export interface DrawGridEventHandlersEventMap {
  selected_cell: [SelectedCellEvent, boolean];
  click_cell: [MouseCellEvent];
  dblclick_cell: [MouseCellEvent];
  mouseenter_cell: [CellAddress];
  mouseleave_cell: [CellAddress];
  mouseover_cell: [CellAddress];
  mouseout_cell: [CellAddress];
  mousemove_cell: [MouseCellEvent];
  mousedown_cell: [MouseCellEvent];
  mouseup_cell: [MouseCellEvent];
  dbltap_cell: [TouchCellEvent];
  keydown: [number, KeyboardEvent];
  paste_cell: [PasteCellEvent];
  input_cell: [InputCellEvent];
  scroll: [ScrollEvent];
  editableinput_cell: [CellAddress];
  modify_status_editableinput_cell: [ModifyStatusEditableinputCellEvent];
  focus_grid: [FocusEvent];
  blur_grid: [FocusEvent];
  resize_column: [{ col: number }];
  copydata: [CellRange];
}
export interface DrawGridEventHandlersReturnMap {
  selected_cell: void;
  click_cell: void;
  dblclick_cell: void;
  mouseenter_cell: void;
  mouseleave_cell: void;
  mouseover_cell: void;
  mouseout_cell: void;
  mousemove_cell: void;
  mousedown_cell: boolean;
  mouseup_cell: void;
  dbltap_cell: void;
  keydown: void;
  paste_cell: void;
  input_cell: void;
  scroll: void;
  editableinput_cell: boolean | void;
  modify_status_editableinput_cell: void;
  focus_grid: void;
  blur_grid: void;
  resize_column: void;
  copydata: string;
}

export type ChangedValueCellEvent<T> = CellAddress & {
  record: T;
  field: FieldDef<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValue: any;
};
export type ChangedHeaderValueCellEvent = CellAddress & {
  field: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValue: any;
};
export interface ListGridEventHandlersEventMap<T>
  extends DrawGridEventHandlersEventMap {
  changed_value: [ChangedValueCellEvent<T>];
  changed_header_value: [ChangedHeaderValueCellEvent];
}
export interface ListGridEventHandlersReturnMap
  extends DrawGridEventHandlersReturnMap {
  changed_value: void;
  changed_header_value: void;
}