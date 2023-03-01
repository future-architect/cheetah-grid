import type { MultilineTextHeaderStyleOption } from "../../ts-types";
import { StdMultilineTextBaseStyle } from "./StdMultilineTextBaseStyle";

let defaultStyle: MultilineTextHeaderStyle;
export class MultilineTextHeaderStyle extends StdMultilineTextBaseStyle {
  static get DEFAULT(): MultilineTextHeaderStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new MultilineTextHeaderStyle());
  }
  constructor(style: MultilineTextHeaderStyleOption = {}) {
    super(style);
  }
  clone(): MultilineTextHeaderStyle {
    return new MultilineTextHeaderStyle(this);
  }
}
