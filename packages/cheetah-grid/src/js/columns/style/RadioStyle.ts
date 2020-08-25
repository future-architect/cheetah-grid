import type { ColorDef, RadioStyleOption } from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";
import { defaults } from "../../internal/utils";

let defaultStyle: RadioStyle;
export class RadioStyle extends StdBaseStyle {
  private _checkColor?: ColorDef;
  private _uncheckBorderColor?: ColorDef;
  private _checkBorderColor?: ColorDef;
  private _uncheckBgColor?: ColorDef;
  private _checkBgColor?: ColorDef;
  static get DEFAULT(): RadioStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new RadioStyle());
  }
  constructor(style: RadioStyleOption = {}) {
    super(defaults(style, { textAlign: "center" }));
    const {
      checkColor,
      uncheckBorderColor,
      checkBorderColor,
      uncheckBgColor,
      checkBgColor,
    } = style;
    this._checkColor = checkColor;
    this._uncheckBorderColor = uncheckBorderColor;
    this._checkBorderColor = checkBorderColor;
    this._uncheckBgColor = uncheckBgColor;
    this._checkBgColor = checkBgColor;
  }
  get checkColor(): ColorDef | undefined {
    return this._checkColor;
  }
  set checkColor(checkColor: ColorDef | undefined) {
    this._checkColor = checkColor;
    this.doChangeStyle();
  }
  get uncheckBorderColor(): ColorDef | undefined {
    return this._uncheckBorderColor;
  }
  set uncheckBorderColor(uncheckBorderColor: ColorDef | undefined) {
    this._uncheckBorderColor = uncheckBorderColor;
    this.doChangeStyle();
  }
  get checkBorderColor(): ColorDef | undefined {
    return this._checkBorderColor;
  }
  set checkBorderColor(checkBorderColor: ColorDef | undefined) {
    this._checkBorderColor = checkBorderColor;
    this.doChangeStyle();
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
  clone(): RadioStyle {
    return new RadioStyle(this);
  }
}
