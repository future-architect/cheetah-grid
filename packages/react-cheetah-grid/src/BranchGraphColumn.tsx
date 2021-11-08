import * as cheetahGrid from "cheetah-grid";
import { BranchGraphStyleOption } from "cheetah-grid/ts-types/column/style";

import {
  parseOnClick,
  StandardProps,
  WithFieldProps,
  WithOnClick,
} from "./columnProps";

export type BranchGraphColumnProps<T> = {
  start?: "top" | "bottom";
  cache?: boolean;
  style?: BranchGraphStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function BranchGraphColumn<T>(props: BranchGraphColumnProps<T>) {
  return <div></div>;
}

export function processBranchGraphColumnProps<T>(
  props: BranchGraphColumnProps<T>
) {
  const {
    children,
    width,
    minWidth,
    maxWidth,
    field,
    start,
    cache,
    style,
    message,
  } = props;
  return {
    columnType: new cheetahGrid.columns.type.BranchGraphColumn({
      start,
      cache,
    }),
    caption: children ? children : "",
    width,
    minWidth,
    maxWidth,
    field,
    style,
    message,
    action: parseOnClick(props),
  };
}
