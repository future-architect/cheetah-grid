import * as cheetahGrid from "cheetah-grid";
import { ButtonStyleOption } from "cheetah-grid/ts-types/column/style";

import { processBaseHeaderProps, StandardProps } from "./columnProps";

export type ButtonColumnProps<T> = {
  buttonCaption?: string;
  buttonBgColor?: string;
  onClick: (row: T) => void;
  disabled?: boolean;
  style?: ButtonStyleOption;
} & StandardProps<T>;

export function ButtonColumn<T>(props: ButtonColumnProps<T>) {
  return <div></div>;
}

export function processButtonColumnProps<T>(props: ButtonColumnProps<T>) {
  const { icon, disabled, onClick, buttonCaption, message, style } = props;
  return {
    ...processBaseHeaderProps<T>(props),
    action: new cheetahGrid.columns.action.ButtonAction<T>({
      disabled,
      action: onClick,
    }),
    columnType: new cheetahGrid.columns.type.ButtonColumn<T>({
      caption: buttonCaption,
    }),
    style,
    icon,
    message,
  };
}
