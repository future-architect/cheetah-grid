import * as cheetahGrid from "cheetah-grid";
import { NumberStyleOption } from "cheetah-grid/columns/style";

import {
  StandardProps,
  WithFieldProps,
  WithTextEditProps,
  parseEditorEditable,
  processBaseHeaderProps,
} from "./columnProps";

export type NumberColumnProps<T> = {
  style?: NumberStyleOption;
  format?: Intl.NumberFormat;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithTextEditProps<T>;

export function NumberColumn<T>(props: NumberColumnProps<T>) {
  return <div></div>;
}

export function processNumberColumnProps<T>(props: NumberColumnProps<T>) {
  const { field, style, format, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    style,
    message,
    columnType: new cheetahGrid.columns.type.NumberColumn<T>({
      format,
    }),
    action: parseEditorEditable(props),
  };
}
