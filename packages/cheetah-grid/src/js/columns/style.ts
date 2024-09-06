import type {
  BaseStyleOption,
  ButtonStyleOption,
  CheckStyleOption,
  ColumnStyleOption,
  IconStyleOption,
  ImageStyleOption,
  MenuStyleOption,
  MultilineTextStyleOption,
  NumberStyleOption,
  PercentCompleteBarStyleOption,
  StyleOption,
  TreeStyleOption,
} from "../ts-types";
import { BaseStyle } from "./style/BaseStyle";
import { ButtonStyle } from "./style/ButtonStyle";
import { CheckStyle } from "./style/CheckStyle";
import { IconStyle } from "./style/IconStyle";
import { ImageStyle } from "./style/ImageStyle";
import { MenuStyle } from "./style/MenuStyle";
import { MultilineTextStyle } from "./style/MultilineTextStyle";
import { NumberStyle } from "./style/NumberStyle";
import { PercentCompleteBarStyle } from "./style/PercentCompleteBarStyle";
import { RadioStyle } from "./style/RadioStyle";
import { Style } from "./style/Style";
import { TreeStyle } from "./style/TreeStyle";

const { EVENT_TYPE } = BaseStyle;
export {
  EVENT_TYPE,
  BaseStyle,
  Style,
  NumberStyle,
  CheckStyle,
  RadioStyle,
  ButtonStyle,
  ImageStyle,
  IconStyle,
  PercentCompleteBarStyle,
  MultilineTextStyle,
  MenuStyle,
  TreeStyle,
};
export type {
  BaseStyleOption,
  ButtonStyleOption,
  CheckStyleOption,
  IconStyleOption,
  ImageStyleOption,
  MenuStyleOption,
  MultilineTextStyleOption,
  NumberStyleOption,
  PercentCompleteBarStyleOption,
  StyleOption,
  TreeStyleOption,
};
export function of(
  columnStyle: ColumnStyleOption | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any,
  StyleClassDef: typeof BaseStyle = Style
): BaseStyle {
  if (columnStyle) {
    if (columnStyle instanceof BaseStyle) {
      return columnStyle;
    } else if (typeof columnStyle === "function") {
      return of(columnStyle(record), record, StyleClassDef);
    } else if (record && (columnStyle as symbol) in record) {
      return of(record[columnStyle as string], record, StyleClassDef);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new StyleClassDef(columnStyle as any);
  } else {
    return StyleClassDef.DEFAULT;
  }
}
