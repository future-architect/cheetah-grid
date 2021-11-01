import { StyleOption } from "cheetah-grid/ts-types/column/style";

import {
  StandardProps,
  WithTextEditProps,
  parseEditorEditable,
  processBaseHeaderProps,
  WithFieldProps,
} from "./columnProps";

export type ColumnProps<T> = {
  style?: StyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithTextEditProps<T>;

export function Column<T>(props: ColumnProps<T>) {
  return <div></div>;
}

export function processColumnProps<T>(props: ColumnProps<T>) {
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
