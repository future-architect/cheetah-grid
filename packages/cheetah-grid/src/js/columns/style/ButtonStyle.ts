import type { ButtonStyleOption, ColorDef } from "../../ts-types";
import { Style } from "./Style";

function adj(style: ButtonStyleOption): ButtonStyleOption {
  const { textAlign = "center" } = style;
  style.textAlign = textAlign;
  return style;
}
let defaultStyle: ButtonStyle;
export class ButtonStyle extends Style {
  private _buttonBgColor?: ColorDef;
  static get DEFAULT(): ButtonStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new ButtonStyle());
  }
  constructor(style: ButtonStyleOption = {}) {
    super(adj(style));
    const { buttonBgColor } = style;
    this._buttonBgColor = buttonBgColor;
  }
  get buttonBgColor(): ColorDef | undefined {
    return this._buttonBgColor;
  }
  set buttonBgColor(buttonBgColor) {
    this._buttonBgColor = buttonBgColor;
    this.doChangeStyle();
  }
  clone(): ButtonStyle {
    return new ButtonStyle(this);
  }
}
