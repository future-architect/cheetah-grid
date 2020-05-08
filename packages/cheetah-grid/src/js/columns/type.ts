import type {
  BaseColumnOption,
  BranchGraphColumnOption,
  ButtonColumnOption,
  ColumnTypeOption,
  IconColumnOption,
  MenuColumnOption,
  NumberColumnOption,
  PercentCompleteBarColumnOption,
} from "../ts-types";
import { BaseColumn } from "./type/BaseColumn";
import { BranchGraphColumn } from "./type/BranchGraphColumn";
import { ButtonColumn } from "./type/ButtonColumn";
import { CheckColumn } from "./type/CheckColumn";
import { Column } from "./type/Column";
import { IconColumn } from "./type/IconColumn";
import { ImageColumn } from "./type/ImageColumn";
import { MenuColumn } from "./type/MenuColumn";
import { MultilineTextColumn } from "./type/MultilineTextColumn";
import { NumberColumn } from "./type/NumberColumn";
import { PercentCompleteBarColumn } from "./type/PercentCompleteBarColumn";
import { RadioColumn } from "./type/RadioColumn";

const TYPES = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DEFAULT: new Column<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NUMBER: new NumberColumn<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CHECK: new CheckColumn<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RADIO: new RadioColumn<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BUTTON: new ButtonColumn<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IMAGE: new ImageColumn<any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MULTILINETEXT: new MultilineTextColumn<any>(),
};

/**
 * column types
 * @namespace cheetahGrid.columns.type
 * @memberof cheetahGrid.columns
 */
export {
  Column,
  NumberColumn,
  CheckColumn,
  RadioColumn,
  ButtonColumn,
  ImageColumn,
  PercentCompleteBarColumn,
  IconColumn,
  BranchGraphColumn,
  MenuColumn,
  MultilineTextColumn,
  // types
  BaseColumnOption,
  BranchGraphColumnOption,
  ButtonColumnOption,
  IconColumnOption,
  MenuColumnOption,
  NumberColumnOption,
  PercentCompleteBarColumnOption,
};
export function of<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnType: ColumnTypeOption | BaseColumn<T, any> | null | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): BaseColumn<T, any> {
  if (!columnType) {
    return TYPES.DEFAULT;
  } else if (typeof columnType === "string") {
    const key = columnType.toUpperCase() as keyof typeof TYPES;
    return TYPES[key] || of(null);
  } else {
    return columnType;
  }
}
