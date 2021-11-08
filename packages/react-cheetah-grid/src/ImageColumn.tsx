import { ImageStyleOption } from "cheetah-grid/ts-types/column/style";

import {
  StandardProps,
  WithFieldProps,
  WithOnClick,
  parseOnClick,
  processBaseHeaderProps,
} from "./columnProps";

export type ImageColumnProps<T> = {
  style?: ImageStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithOnClick<T>;

export function ImageColumn<T>(props: ImageColumnProps<T>) {
  return <div></div>;
}

export function processImageColumnProps<T>(props: ImageColumnProps<T>) {
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
