import type { ColumnMenuItemOptions } from "../define";
import type { ListGridAPI } from "../grid-engine";
import type { MaybePromise } from "../base";

export interface BaseActionOption {
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionListener = (record: any) => void;
export interface ActionOption extends BaseActionOption {
  action?: ActionListener;
}
export interface EditorOption extends BaseActionOption {
  readOnly?: boolean;
}
export type ButtonActionOption = ActionOption;

export interface InlineMenuEditorOption extends EditorOption {
  classList?: string | string[];
  options?: ColumnMenuItemOptions;
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

export type SortOption<T> =
  | boolean
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
