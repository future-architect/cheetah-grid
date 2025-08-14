import * as cheetahGrid from "cheetah-grid";

import {
  StandardProps,
  WithFieldProps,
  WithTextEditProps,
  parseEditorEditable,
  processBaseHeaderProps,
} from "./columnProps";

export type IconColumnProps<T> = {
  style?: cheetahGrid.TYPES.IconStyleOption;
  className?: string;
  content: string;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithTextEditProps<T>;

export function IconColumn<T>(props: IconColumnProps<T>) {
  return <div></div>;
}

export function processIconColumnProps<T>(props: IconColumnProps<T>) {
  const { field, style, className, content, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    field,
    style,
    message,
    columnType: new cheetahGrid.columns.type.IconColumn<T>({
      className,
      content,
    }),
    action: parseEditorEditable(props),
  };
}
