import { NumberStyleOption } from "../../ts-types";
import { Style } from "./Style";

function adj(style: NumberStyleOption): NumberStyleOption {
  const { textAlign = "right" } = style;
  style.textAlign = textAlign;
  return style;
}
let defaultStyle: NumberStyle;
export class NumberStyle extends Style {
  static get DEFAULT(): NumberStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new NumberStyle());
  }
  constructor(style: NumberStyleOption = {}) {
    super(adj(style));
  }
  clone(): NumberStyle {
    return new NumberStyle(this);
  }
}
