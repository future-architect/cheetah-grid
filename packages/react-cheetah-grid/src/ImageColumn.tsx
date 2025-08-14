import type { columns, TYPES } from "cheetah-grid";
import {
  ProcessedBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithMessageProps,
  WithOnClick,
  parseOnClick,
  processBaseHeaderProps,
} from "./columnProps";

export type ImageColumnProps<T> = {
  style?: TYPES.ImageStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function ImageColumn<T>(props: ImageColumnProps<T>) {
  return <div></div>;
}

export function processImageColumnProps<T>(props: ImageColumnProps<T>): {
  columnType: "image";
  style?: TYPES.ImageStyleOption;
  action: columns.action.BaseAction<T> | undefined;
} & WithFieldProps<T> &
  WithMessageProps<T> &
  ProcessedBaseHeaderProps<T> {
  const { field, style, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    style,
    message,
    columnType: "image",
    action: parseOnClick(props),
  };
}
