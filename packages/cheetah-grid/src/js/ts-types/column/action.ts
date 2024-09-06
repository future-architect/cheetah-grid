import type { CellAddress } from "../grid";
import type { ColumnMenuItemOptions } from "../define";
import type { ListGridAPI } from "../grid-engine";
import type { MaybePromise } from "../base";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordBoolean<T = any> = boolean | ((record: T) => boolean);

export interface BaseActionOption {
  disabled?: RecordBoolean;
}

export type ActionListener = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any,
  meta: CellAddress & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grid: ListGridAPI<any>;
  }
) => void;
export type ActionAreaPredicate = (
  meta: CellAddress & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grid: ListGridAPI<any>;
    /** The mouse position relative to the cell position. */
    pointInCell: { x: number; y: number };
    /** The mouse position relative to the drawing canvas. */
    pointInDrawingCanvas: { x: number; y: number };
  }
) => boolean;
export interface AbstractActionOption extends BaseActionOption {
  action?: ActionListener;
}
export interface ActionOption extends AbstractActionOption {
  action?: ActionListener;
  /** A function that checks whether the area can be operated with mouse actions. */
  area?: ActionAreaPredicate;
}
export interface EditorOption extends BaseActionOption {
  readOnly?: RecordBoolean;
}
export interface ButtonActionOption extends AbstractActionOption {
  action?: ActionListener;
}

export interface InlineMenuEditorOption<T> extends EditorOption {
  classList?: string | string[];
  options?:
    | ColumnMenuItemOptions
    | ((record: T | undefined) => ColumnMenuItemOptions);
}

export interface InlineInputEditorOption extends EditorOption {
  classList?: string | string[];
  type?: string;
}

type GetValueResult<T, R> = (
  value: string,
  info: { grid: ListGridAPI<T>; col: number; row: number }
) => R;
export interface SmallDialogInputEditorOption<T> extends EditorOption {
  classList?: string | string[];
  type?: string;
  helperText?: string | GetValueResult<T, string>;
  inputValidator?: GetValueResult<T, MaybePromise<string>>;
  validator?: GetValueResult<T, MaybePromise<string>>;
}

export type GetRadioEditorGroup<T> = (target: {
  grid: ListGridAPI<T>;
  col: number;
  row: number;
}) => CellAddress[];

export interface RadioEditorOption<T> extends EditorOption {
  /** @deprecated Use checkAction instead. */
  group?: GetRadioEditorGroup<T>;
  checkAction?: ActionListener;
}

export type SortOption<T> =
  | boolean
  | (string & keyof T)
  | ((arg: {
      order: "asc" | "desc";
      col: number;
      row: number;
      grid: ListGridAPI<T>;
    }) => void);

export interface SortHeaderActionOption<T> extends BaseActionOption {
  sort?: SortOption<T>;
}

export type ColumnActionOption = "CHECK" | "check" | "INPUT" | "input";
export type HeaderActionOption = "CHECK" | "check" | "SORT" | "sort";
