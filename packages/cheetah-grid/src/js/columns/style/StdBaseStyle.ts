import { BaseStyle } from "./BaseStyle";
import { StdBaseStyleOption } from "../../ts-types";

let defaultStyle: StdBaseStyle;
export class StdBaseStyle extends BaseStyle {
  private _textAlign: CanvasTextAlign;
  private _textBaseline: CanvasTextBaseline;
  static get DEFAULT(): StdBaseStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new StdBaseStyle());
  }
  constructor(style: StdBaseStyleOption = {}) {
    super(style);
    this._textAlign = style.textAlign || "left";
    this._textBaseline = style.textBaseline || "middle";
  }
  get textAlign(): CanvasTextAlign {
    return this._textAlign;
  }
  set textAlign(textAlign) {
    this._textAlign = textAlign;
    this.doChangeStyle();
  }
  get textBaseline(): CanvasTextBaseline {
    return this._textBaseline;
  }
  set textBaseline(textBaseline) {
    this._textBaseline = textBaseline;
    this.doChangeStyle();
  }
  clone(): StdBaseStyle {
    return new StdBaseStyle(this);
  }
}
