import type { ColorDef, PercentCompleteBarStyleOption } from "../../ts-types";
import { Style } from "./Style";
let defaultStyle: PercentCompleteBarStyle;
const DEFAULT_BAR_COLOR = (num: number): string => {
  if (num > 80) {
    return "#20a8d8";
  }
  if (num > 50) {
    return "#4dbd74";
  }
  if (num > 20) {
    return "#ffc107";
  }
  return "#f86c6b";
};
export class PercentCompleteBarStyle extends Style {
  private _barColor: ColorDef | ((num: number) => ColorDef);
  private _barBgColor: ColorDef;
  private _barHeight: number;
  static get DEFAULT(): PercentCompleteBarStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new PercentCompleteBarStyle());
  }
  constructor(style: PercentCompleteBarStyleOption = {}) {
    super(style);
    this._barColor = style.barColor || DEFAULT_BAR_COLOR;
    this._barBgColor = style.barBgColor || "#f0f3f5";
    this._barHeight = style.barHeight || 3;
  }
  get barColor(): ColorDef | ((num: number) => ColorDef) {
    return this._barColor;
  }
  set barColor(barColor: ColorDef | ((num: number) => ColorDef)) {
    this._barColor = barColor;
    this.doChangeStyle();
  }
  get barBgColor(): ColorDef {
    return this._barBgColor;
  }
  set barBgColor(barBgColor: ColorDef) {
    this._barBgColor = barBgColor;
    this.doChangeStyle();
  }
  get barHeight(): number {
    return this._barHeight;
  }
  set barHeight(barHeight: number) {
    this._barHeight = barHeight;
    this.doChangeStyle();
  }
  clone(): PercentCompleteBarStyle {
    return new PercentCompleteBarStyle(this);
  }
}
