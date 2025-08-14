import type { columns, TYPES } from "cheetah-grid";
import {
  ProcessedBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithMessageProps,
  WithWidgetEditableProps,
  parseWidgetEditable,
  processBaseHeaderProps,
} from "./columnProps";

export type CheckColumnProps<T> = {
  style?: TYPES.CheckStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithWidgetEditableProps<T>;

export function CheckColumn<T>(props: CheckColumnProps<T>) {
  return <div></div>;
}

export function processCheckColumnProps<T>(props: CheckColumnProps<T>): {
  columnType: "check";
  style?: TYPES.CheckStyleOption;
  action: columns.action.BaseAction<T> | undefined;
  icon?: TYPES.ColumnIconOption<T> | TYPES.ColumnIconOption<T>[];
} & WithFieldProps<T> &
  WithMessageProps<T> &
  ProcessedBaseHeaderProps<T> {
  const { field, style, icon, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    action: parseWidgetEditable<T>("checkbox", props),
    columnType: "check",
    style,
    icon,
    message,
  };
}
