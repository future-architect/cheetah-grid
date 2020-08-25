import type { IconStyleOption } from "../../ts-types";
import { Style } from "./Style";
import { defaults } from "../../internal/utils";

let defaultStyle: IconStyle;
export class IconStyle extends Style {
  static get DEFAULT(): IconStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new IconStyle());
  }
  constructor(style: IconStyleOption = {}) {
    super(defaults(style, { textAlign: "center" }));
  }
  clone(): IconStyle {
    return new IconStyle(this);
  }
}
