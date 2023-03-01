import type {
  LineClamp,
  StdMultilineTextBaseStyleOption,
} from "../../ts-types";
import { StdTextBaseStyle } from "./StdTextBaseStyle";

let defaultStyle: StdMultilineTextBaseStyle;
export class StdMultilineTextBaseStyle extends StdTextBaseStyle {
  private _lineHeight: string | number;
  private _autoWrapText: boolean;
  private _lineClamp?: LineClamp;
  static get DEFAULT(): StdMultilineTextBaseStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new StdMultilineTextBaseStyle());
  }
  constructor(style: StdMultilineTextBaseStyleOption = {}) {
    super(style);
    this._lineHeight = style.lineHeight || "1em";
    this._autoWrapText = style.autoWrapText || false;
    this._lineClamp = style.lineClamp;
  }
  clone(): StdMultilineTextBaseStyle {
    return new StdMultilineTextBaseStyle(this);
  }
  get lineHeight(): string | number {
    return this._lineHeight;
  }
  set lineHeight(lineHeight: string | number) {
    this._lineHeight = lineHeight;
    this.doChangeStyle();
  }
  get lineClamp(): LineClamp | undefined {
    return this._lineClamp;
  }
  set lineClamp(lineClamp: LineClamp | undefined) {
    this._lineClamp = lineClamp;
    this.doChangeStyle();
  }
  get autoWrapText(): boolean {
    return this._autoWrapText;
  }
  set autoWrapText(autoWrapText: boolean) {
    this._autoWrapText = autoWrapText;
    this.doChangeStyle();
  }
}
