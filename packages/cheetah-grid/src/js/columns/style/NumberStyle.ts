import type { NumberStyleOption } from "../../ts-types";
import { Style } from "./Style";
import { defaults } from "../../internal/utils";

let defaultStyle: NumberStyle;
export class NumberStyle extends Style {
  static get DEFAULT(): NumberStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new NumberStyle());
  }
  constructor(style: NumberStyleOption = {}) {
    super(defaults(style, { textAlign: "right" }));
  }
  clone(): NumberStyle {
    return new NumberStyle(this);
  }
}
