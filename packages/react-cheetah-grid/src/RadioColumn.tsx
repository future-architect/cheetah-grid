import * as cheetahGrid from "cheetah-grid";

import {
  parseWidgetEditable,
  processBaseHeaderProps,
  StandardProps,
  WithFieldProps,
  WithWidgetEditableProps,
} from "./columnProps";

export type RadioColumnProps<T> = {
  style?: cheetahGrid.TYPES.RadioStyleOption;
} & StandardProps<T> &
  WithFieldProps<T> &
  WithWidgetEditableProps<T>;

export function RadioColumn<T>(props: RadioColumnProps<T>) {
  return <div></div>;
}

export function processRadioColumnProps<T>(props: RadioColumnProps<T>) {
  const { field, message } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    action: parseWidgetEditable<T>("radio", props),
    columnType: new cheetahGrid.columns.type.RadioColumn<T>(),
    field,
    message,
  };
}
