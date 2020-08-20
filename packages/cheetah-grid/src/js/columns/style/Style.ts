import type { ColorDef, StyleOption, TextOverflow } from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";
let defaultStyle: Style;
export class Style extends StdBaseStyle {
  private _color?: ColorDef;
  private _font?: string;
  private _padding: number | string | (number | string)[] | undefined;
  private _textOverflow: TextOverflow;
  static get DEFAULT(): Style {
    return defaultStyle ? defaultStyle : (defaultStyle = new Style());
  }
  constructor(style: StyleOption = {}) {
    super(style);
    this._color = style.color;
    this._font = style.font;
    this._padding = style.padding;
    this._textOverflow = style.textOverflow || "clip";
  }
  get color(): ColorDef | undefined {
    return this._color;
  }
  set color(color: ColorDef | undefined) {
    this._color = color;
    this.doChangeStyle();
  }
  get font(): string | undefined {
    return this._font;
  }
  set font(font: string | undefined) {
    this._font = font;
    this.doChangeStyle();
  }
  get padding(): number | string | (number | string)[] | undefined {
    return this._padding;
  }
  set padding(padding: number | string | (number | string)[] | undefined) {
    this._padding = padding;
    this.doChangeStyle();
  }
  get textOverflow(): TextOverflow {
    return this._textOverflow;
  }
  set textOverflow(textOverflow: TextOverflow) {
    this._textOverflow = textOverflow;
    this.doChangeStyle();
  }
  clone(): Style {
    return new Style(this);
  }
}
