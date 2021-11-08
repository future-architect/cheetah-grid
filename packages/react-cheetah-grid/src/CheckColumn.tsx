import { CheckStyleOption } from "cheetah-grid/ts-types/column/style";

import {
  StandardProps,
  WithFieldProps,
  WithWidgetEditableProps,
  parseWidgetEditable,
  processBaseHeaderProps,
} from "./columnProps";

export type CheckColumnProps<T> = {
  style?: CheckStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithWidgetEditableProps<T>;

export function CheckColumn<T>(props: CheckColumnProps<T>) {
  return <div></div>;
}

export function processCheckColumnProps<T>(props: CheckColumnProps<T>) {
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
