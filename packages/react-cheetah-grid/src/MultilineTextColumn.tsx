import type { columns, TYPES } from "cheetah-grid";
import {
  parseOnClick,
  processBaseHeaderProps,
  ProcessedBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithMessageProps,
  WithOnClick,
} from "./columnProps";

export type MultilineTextColumnProps<T> = {
  style?: TYPES.MultilineTextStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function MultilineTextColumn<T>(props: MultilineTextColumnProps<T>) {
  return <div></div>;
}

export function processMultilineTextColumnProps<T>(
  props: MultilineTextColumnProps<T>
): {
  columnType: "multilinetext";
  style?: TYPES.MultilineTextStyleOption;
  action: columns.action.BaseAction<T> | undefined;
} & WithFieldProps<T> &
  WithMessageProps<T> &
  ProcessedBaseHeaderProps<T> {
  const { field, style, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    columnType: "multilinetext",
    field,
    style,
    message,
    action: parseOnClick(props),
  };
}
