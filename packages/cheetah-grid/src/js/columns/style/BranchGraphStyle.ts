import type { BranchGraphStyleOption, ColorDef } from "../../ts-types";
import { BaseStyle } from "./BaseStyle";
let defaultStyle: BranchGraphStyle;

const DEFAULT_BRANCH_COLORS = (_name: string, index: number): string => {
  switch (index % 3) {
    case 0:
      return "#979797";
    case 1:
      return "#008fb5";
    case 2:
      return "#f1c109";
    default:
  }
  return "#979797";
};
export class BranchGraphStyle extends BaseStyle {
  private _branchColors: ColorDef | ((name: string, index: number) => ColorDef);
  private _margin: number;
  private _circleSize: number;
  private _branchLineWidth: number;
  private _mergeStyle: "straight" | "bezier";
  static get DEFAULT(): BranchGraphStyle {
    return defaultStyle
      ? defaultStyle
      : (defaultStyle = new BranchGraphStyle());
  }
  constructor(style: BranchGraphStyleOption = {}) {
    super(style);
    this._branchColors = style.branchColors || DEFAULT_BRANCH_COLORS;
    this._margin = style.margin || 4;
    this._circleSize = style.circleSize || 16;
    this._branchLineWidth = style.branchLineWidth || 4;
    this._mergeStyle = style.mergeStyle === "straight" ? "straight" : "bezier";
  }
  get branchColors(): ColorDef | ((name: string, index: number) => ColorDef) {
    return this._branchColors;
  }
  set branchColors(
    branchColors: ColorDef | ((name: string, index: number) => ColorDef)
  ) {
    this._branchColors = branchColors;
    this.doChangeStyle();
  }
  get margin(): number {
    return this._margin;
  }
  set margin(margin: number) {
    this._margin = margin;
    this.doChangeStyle();
  }
  get circleSize(): number {
    return this._circleSize;
  }
  set circleSize(circleSize: number) {
    this._circleSize = circleSize;
    this.doChangeStyle();
  }
  get branchLineWidth(): number {
    return this._branchLineWidth;
  }
  set branchLineWidth(branchLineWidth: number) {
    this._branchLineWidth = branchLineWidth;
    this.doChangeStyle();
  }
  get mergeStyle(): "straight" | "bezier" {
    return this._mergeStyle;
  }
  set mergeStyle(mergeStyle: "straight" | "bezier") {
    this._mergeStyle = mergeStyle;
    this.doChangeStyle();
  }
  clone(): BranchGraphStyle {
    return new BranchGraphStyle(this);
  }
}
