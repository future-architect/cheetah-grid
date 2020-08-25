import type { CheckHeaderStyleOption, ColorDef } from "../../ts-types";
import { Style } from "./Style";
import { defaults } from "../../internal/utils";

let defaultStyle: CheckHeaderStyle;
export class CheckHeaderStyle extends Style {
  private _uncheckBgColor?: ColorDef;
  private _checkBgColor?: ColorDef;
  private _borderColor?: ColorDef;
  static get DEFAULT(): CheckHeaderStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new CheckHeaderStyle());
  }
  constructor(style: CheckHeaderStyleOption = {}) {
    super(defaults(style, { textAlign: "center" }));
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
  clone(): CheckHeaderStyle {
    return new CheckHeaderStyle(this);
  }
}
