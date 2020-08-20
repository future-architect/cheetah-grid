import type { BaseStyleOption, ColorDef, ColumnStyle } from "../../ts-types";
import { EventTarget } from "../../core/EventTarget";

const STYLE_EVENT_TYPE = {
  CHANGE_STYLE: "change_style" as const,
};

let defaultStyle: BaseStyle;
export class BaseStyle extends EventTarget implements ColumnStyle {
  private _bgColor?: ColorDef;
  static get EVENT_TYPE(): { CHANGE_STYLE: "change_style" } {
    return STYLE_EVENT_TYPE;
  }
  static get DEFAULT(): BaseStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new BaseStyle());
  }
  constructor({ bgColor }: BaseStyleOption = {}) {
    super();
    this._bgColor = bgColor;
  }
  get bgColor(): ColorDef | undefined {
    return this._bgColor;
  }
  set bgColor(bgColor: ColorDef | undefined) {
    this._bgColor = bgColor;
    this.doChangeStyle();
  }
  doChangeStyle(): void {
    this.fireListeners(STYLE_EVENT_TYPE.CHANGE_STYLE);
  }
  clone(): BaseStyle {
    return new BaseStyle(this);
  }
}
