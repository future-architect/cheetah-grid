import type { columns, TYPES } from "cheetah-grid";
import {
  StandardProps,
  WithTextEditProps,
  parseEditorEditable,
  processBaseHeaderProps,
  WithFieldProps,
  ProcessedBaseHeaderProps,
  WithMessageProps,
} from "./columnProps";

export type ColumnProps<T> = {
  style?: TYPES.StyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithTextEditProps<T>;

export function Column<T>(props: ColumnProps<T>) {
  return <div></div>;
}

export function processColumnProps<T>(props: ColumnProps<T>): {
  style?: TYPES.StdTextBaseStyleOption;
  action: columns.action.BaseAction<T> | undefined;
  icon?: TYPES.ColumnIconOption<T> | TYPES.ColumnIconOption<T>[];
} & WithFieldProps<T> &
  WithMessageProps<T> &
  ProcessedBaseHeaderProps<T> {
  const { field, style, message, icon } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    style,
    message,
    icon,
    action: parseEditorEditable(props),
  };
}
