import * as cheetahGrid from "cheetah-grid";

import {
  parseOnClick,
  processBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithOnClick,
} from "./columnProps";

export type PercentCompleteBarColumnProps<T> = {
  style?: cheetahGrid.TYPES.PercentCompleteBarStyleOption;
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
      formatter: formatter as (value: unknown) => unknown,
      min,
      max,
    }),
    action: parseOnClick(props),
  };
}
