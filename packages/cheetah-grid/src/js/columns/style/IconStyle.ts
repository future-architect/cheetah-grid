import { IconStyleOption } from "../../ts-types";
import { Style } from "./Style";

function adj(style: IconStyleOption): IconStyleOption {
  const { textAlign = "center" } = style;
  style.textAlign = textAlign;
  return style;
}
let defaultStyle: IconStyle;
export class IconStyle extends Style {
  static get DEFAULT(): IconStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new IconStyle());
  }
  constructor(style: IconStyleOption = {}) {
    super(adj(style));
  }
  clone(): IconStyle {
    return new IconStyle(this);
  }
}
