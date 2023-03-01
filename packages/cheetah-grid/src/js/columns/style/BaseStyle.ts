import type {
  BaseStyleOption,
  ColorDef,
  ColumnStyle,
  IndicatorStyle,
} from "../../ts-types";
import { EventTarget } from "../../core/EventTarget";

const STYLE_EVENT_TYPE = {
  CHANGE_STYLE: "change_style" as const,
};

let defaultStyle: BaseStyle;
export class BaseStyle extends EventTarget implements ColumnStyle {
  private _bgColor?: ColorDef;
  private _indicatorTopLeft?: IndicatorStyle;
  static get EVENT_TYPE(): { CHANGE_STYLE: "change_style" } {
    return STYLE_EVENT_TYPE;
  }
  static get DEFAULT(): BaseStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new BaseStyle());
  }
  constructor({ bgColor, indicatorTopLeft }: BaseStyleOption = {}) {
    super();
    this._bgColor = bgColor;
    this._indicatorTopLeft = normalizeIndicator(indicatorTopLeft);
  }
  get bgColor(): ColorDef | undefined {
    return this._bgColor;
  }
  set bgColor(bgColor: ColorDef | undefined) {
    this._bgColor = bgColor;
    this.doChangeStyle();
  }
  get indicatorTopLeft(): IndicatorStyle | undefined {
    return this._indicatorTopLeft;
  }
  set indicatorTopLeft(indicatorTopLeft: IndicatorStyle | undefined) {
    this._indicatorTopLeft = indicatorTopLeft;
    this.doChangeStyle();
  }
  doChangeStyle(): void {
    this.fireListeners(STYLE_EVENT_TYPE.CHANGE_STYLE);
  }
  clone(): BaseStyle {
    return new BaseStyle(this);
  }
}
function normalizeIndicator(
  indicator: "triangle" | "none" | IndicatorStyle | undefined
): IndicatorStyle | undefined {
  if (typeof indicator === "string") {
    return { style: indicator };
  }
  return indicator;
}
