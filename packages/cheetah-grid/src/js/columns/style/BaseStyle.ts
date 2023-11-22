import type {
  BaseStyleOption,
  ColorDef,
  ColumnStyle,
  IndicatorDefine,
  IndicatorObject,
  Visibility,
} from "../../ts-types";
import { EventTarget } from "../../core/EventTarget";

const STYLE_EVENT_TYPE = {
  CHANGE_STYLE: "change_style" as const,
};

let defaultStyle: BaseStyle;
export class BaseStyle extends EventTarget implements ColumnStyle {
  private _bgColor?: ColorDef;
  private _visibility?: Visibility;
  private _indicatorTopLeft?: IndicatorObject;
  private _indicatorTopRight?: IndicatorObject;
  private _indicatorBottomRight?: IndicatorObject;
  private _indicatorBottomLeft?: IndicatorObject;
  static get EVENT_TYPE(): { CHANGE_STYLE: "change_style" } {
    return STYLE_EVENT_TYPE;
  }
  static get DEFAULT(): BaseStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new BaseStyle());
  }
  constructor({
    bgColor,
    visibility,
    indicatorTopLeft,
    indicatorTopRight,
    indicatorBottomRight,
    indicatorBottomLeft,
  }: BaseStyleOption = {}) {
    super();
    this._bgColor = bgColor;
    this._visibility = normalizeVisibility(visibility, undefined);
    this._indicatorTopLeft = normalizeIndicator(indicatorTopLeft);
    this._indicatorTopRight = normalizeIndicator(indicatorTopRight);
    this._indicatorBottomRight = normalizeIndicator(indicatorBottomRight);
    this._indicatorBottomLeft = normalizeIndicator(indicatorBottomLeft);
  }
  get bgColor(): ColorDef | undefined {
    return this._bgColor;
  }
  set bgColor(bgColor: ColorDef | undefined) {
    this._bgColor = bgColor;
    this.doChangeStyle();
  }
  get visibility(): Visibility | undefined {
    return this._visibility;
  }
  set visibility(visibility: Visibility | undefined) {
    const normalized = normalizeVisibility(visibility, this._visibility);
    if (this._visibility === normalized) {
      return;
    }
    this._visibility = normalized;
    this.doChangeStyle();
  }
  get indicatorTopLeft(): IndicatorObject | undefined {
    return this._indicatorTopLeft;
  }
  set indicatorTopLeft(indicatorTopLeft: IndicatorObject | undefined) {
    this._indicatorTopLeft = normalizeIndicator(indicatorTopLeft);
    this.doChangeStyle();
  }
  get indicatorTopRight(): IndicatorObject | undefined {
    return this._indicatorTopRight;
  }
  set indicatorTopRight(indicatorTopRight: IndicatorObject | undefined) {
    this._indicatorTopRight = normalizeIndicator(indicatorTopRight);
    this.doChangeStyle();
  }
  get indicatorBottomRight(): IndicatorObject | undefined {
    return this._indicatorBottomRight;
  }
  set indicatorBottomRight(indicatorBottomRight: IndicatorObject | undefined) {
    this._indicatorBottomRight = normalizeIndicator(indicatorBottomRight);
    this.doChangeStyle();
  }
  get indicatorBottomLeft(): IndicatorObject | undefined {
    return this._indicatorBottomLeft;
  }
  set indicatorBottomLeft(indicatorBottomLeft: IndicatorObject | undefined) {
    this._indicatorBottomLeft = normalizeIndicator(indicatorBottomLeft);
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
  indicator: IndicatorDefine | undefined
): IndicatorObject | undefined {
  if (typeof indicator === "string") {
    return { style: indicator };
  }
  return indicator;
}
function normalizeVisibility(
  visibility: Visibility | undefined,
  defaultValue: Visibility | undefined
): Visibility | undefined {
  if (visibility && visibility !== "visible" && visibility !== "hidden") {
    return defaultValue;
  }
  return visibility;
}
