import {
  BaseStyleOption,
  CheckHeaderStyleOption,
  HeaderStyleOption,
  SortHeaderStyleOption
} from "../ts-types";
import { BaseStyle } from "./style/BaseStyle";
import { CheckHeaderStyle } from "./style/CheckHeaderStyle";
import { SortHeaderStyle } from "./style/SortHeaderStyle";
import { Style } from "./style/Style";

export {
  BaseStyle,
  Style,
  SortHeaderStyle,
  CheckHeaderStyle,
  // types
  BaseStyleOption,
  CheckHeaderStyleOption,
  SortHeaderStyleOption
};

export function of(
  headerStyle: HeaderStyleOption | null | undefined,
  StyleClass: typeof BaseStyle
): BaseStyle {
  if (headerStyle) {
    if (headerStyle instanceof Style) {
      return headerStyle;
    } else if (typeof headerStyle === "function") {
      return of(headerStyle(), StyleClass);
    }
    return new StyleClass(headerStyle);
  } else {
    return StyleClass.DEFAULT;
  }
}
