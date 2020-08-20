import type { CheckStyleOption, ColorDef } from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";

function adj(style: CheckStyleOption): CheckStyleOption {
  const { textAlign = "center" } = style;
  style.textAlign = textAlign;
  return style;
}
let defaultStyle: CheckStyle;
export class CheckStyle extends StdBaseStyle {
  private _uncheckBgColor?: ColorDef;
  private _checkBgColor?: ColorDef;
  private _borderColor?: ColorDef;
  static get DEFAULT(): CheckStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new CheckStyle());
  }
  constructor(style: CheckStyleOption = {}) {
    super(adj(style));
    const { uncheckBgColor, checkBgColor, borderColor } = style;
    this._uncheckBgColor = uncheckBgColor;
    this._checkBgColor = checkBgColor;
    this._borderColor = borderColor;
  }
  get uncheckBgColor(): ColorDef | undefined {
    return this._uncheckBgColor;
  }
  set uncheckBgColor(uncheckBgColor: ColorDef | undefined) {
    this._uncheckBgColor = uncheckBgColor;
    this.doChangeStyle();
  }
  get checkBgColor(): ColorDef | undefined {
    return this._checkBgColor;
  }
  set checkBgColor(checkBgColor: ColorDef | undefined) {
    this._checkBgColor = checkBgColor;
    this.doChangeStyle();
  }
  get borderColor(): ColorDef | undefined {
    return this._borderColor;
  }
  set borderColor(borderColor: ColorDef | undefined) {
    this._borderColor = borderColor;
    this.doChangeStyle();
  }
  clone(): CheckStyle {
    return new CheckStyle(this);
  }
}
