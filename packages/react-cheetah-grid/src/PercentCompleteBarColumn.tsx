import * as cheetahGrid from "cheetah-grid";
import { PercentCompleteBarStyleOption } from "cheetah-grid/ts-types/column/style";

import {
  parseOnClick,
  processBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithOnClick,
} from "./columnProps";

export type PercentCompleteBarColumnProps<T> = {
  style?: PercentCompleteBarStyleOption;
  formatter?: (v: string) => string;
  min?: number;
  max?: number;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function PercentCompleteBarColumn<T>(
  props: PercentCompleteBarColumnProps<T>
) {
  return <div></div>;
}

export function processPercentCompleteBarColumnProps<T>(
  props: PercentCompleteBarColumnProps<T>
) {
  const { field, style, message, formatter, min, max } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    style,
    message,
    columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn<T>({
      formatter,
      min,
      max,
    }),
    action: parseOnClick(props),
  };
}
