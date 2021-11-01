import * as cheetahGrid from "cheetah-grid";
import { BaseAction } from "cheetah-grid/columns/action/BaseAction";
import { MenuStyleOption } from "cheetah-grid/columns/style";

import {
  StandardProps,
  WithFieldProps,
  WithWidgetEditableProps,
  isOnClick,
  parseOnClick,
  isWidgetEditableProps,
  processBaseHeaderProps,
} from "./columnProps";

export type MenuColumnProps<T> = {
  style?: MenuStyleOption;
  options: { label: string; value: any }[]; // todo: value type
  menuOptions?: { label: string; value: any }[]; // todo: value type
} & StandardProps<T> &
  WithFieldProps<T> &
  WithWidgetEditableProps<T>;

export function MenuColumn<T>(props: MenuColumnProps<T>) {
  return <div></div>;
}

export function processMenuColumnProps<T>(props: MenuColumnProps<T>) {
  const { field, options, menuOptions, style, message } = props;

  let action: BaseAction<T> | undefined;
  if (isOnClick(props)) {
    action = parseOnClick<T>(props);
  } else if (isWidgetEditableProps(props)) {
    const { disabled, editable } = props;
    action = new cheetahGrid.columns.action.InlineMenuEditor<T>({
      options: menuOptions ? menuOptions : options,
      disabled: Boolean(disabled),
      readOnly: !Boolean(editable),
    });
  }
  return {
    ...processBaseHeaderProps<T>(props),
    action,
    columnType: new cheetahGrid.columns.type.MenuColumn({
      options,
    }),
    style,
    message,
    field,
  };
}
