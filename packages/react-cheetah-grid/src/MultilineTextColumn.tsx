import { MultilineTextStyleOption } from "cheetah-grid/ts-types/column/style";

import {
  parseOnClick,
  processBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithOnClick,
} from "./columnProps";

export type MultilineTextColumnProps<T> = {
  style?: MultilineTextStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function MultilineTextColumn<T>(props: MultilineTextColumnProps<T>) {
  return <div></div>;
}

export function processMultilineTextColumnProps<T>(
  props: MultilineTextColumnProps<T>
) {
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
