import type {
  ColorDef,
  HeaderStdStyleOption,
  TextOverflow,
} from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";
let defaultStyle: Style;
export class Style extends StdBaseStyle {
  private _color?: ColorDef;
  private _font?: string;
  private _textOverflow: TextOverflow;
  static get DEFAULT(): Style {
    return defaultStyle ? defaultStyle : (defaultStyle = new Style());
  }
  constructor(style: HeaderStdStyleOption = {}) {
    super(style);
    this._color = style.color;
    this._font = style.font;
    this._textOverflow = style.textOverflow || "ellipsis";
  }
  get color(): ColorDef | undefined {
    return this._color;
  }
  set color(color) {
    this._color = color;
    this.doChangeStyle();
  }
  get font(): string | undefined {
    return this._font;
  }
  set font(font) {
    this._font = font;
    this.doChangeStyle();
  }
  get textOverflow(): TextOverflow {
    return this._textOverflow;
  }
  set textOverflow(textOverflow) {
    this._textOverflow = textOverflow;
    this.doChangeStyle();
  }
  clone(): Style {
    return new Style(this);
  }
}
