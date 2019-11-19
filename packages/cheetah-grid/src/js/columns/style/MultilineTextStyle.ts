import { LineClamp, MultilineTextStyleOption } from "../../ts-types";
import { Style } from "./Style";

function adj(style: MultilineTextStyleOption): MultilineTextStyleOption {
  const { textBaseline = "top" } = style;
  style.textBaseline = textBaseline;
  return style;
}
let defaultStyle: MultilineTextStyle;
export class MultilineTextStyle extends Style {
  private _lineHeight: string | number;
  private _autoWrapText: boolean;
  private _lineClamp?: LineClamp;
  static get DEFAULT(): MultilineTextStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new MultilineTextStyle());
  }
  constructor(style: MultilineTextStyleOption = {}) {
    super(adj(style));
    this._lineHeight = style.lineHeight || "1em";
    this._autoWrapText = style.autoWrapText || false;
    this._lineClamp = style.lineClamp;
  }
  clone(): MultilineTextStyle {
    return new MultilineTextStyle(this);
  }
  get lineHeight(): string | number {
    return this._lineHeight;
  }
  set lineHeight(lineHeight) {
    this._lineHeight = lineHeight;
    this.doChangeStyle();
  }
  get lineClamp(): LineClamp | undefined {
    return this._lineClamp;
  }
  set lineClamp(lineClamp) {
    this._lineClamp = lineClamp;
    this.doChangeStyle();
  }
  get autoWrapText(): boolean {
    return this._autoWrapText;
  }
  set autoWrapText(autoWrapText) {
    this._autoWrapText = autoWrapText;
    this.doChangeStyle();
  }
}
