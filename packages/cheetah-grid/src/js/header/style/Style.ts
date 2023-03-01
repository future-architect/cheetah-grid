import type { HeaderStdStyleOption } from "../../ts-types";
import { StdMultilineTextBaseStyle } from "./StdMultilineTextBaseStyle";
let defaultStyle: Style;
export class Style extends StdMultilineTextBaseStyle {
  private _multiline?: boolean;
  static get DEFAULT(): Style {
    return defaultStyle ? defaultStyle : (defaultStyle = new Style());
  }
  constructor(style: HeaderStdStyleOption = {}) {
    super(style);
    this._multiline = style.multiline;
  }
  get multiline(): boolean {
    return !!this._multiline;
  }
  set multiline(multiline: boolean) {
    this._multiline = multiline;
    this.doChangeStyle();
  }
  clone(): Style {
    return new Style(this);
  }
}
