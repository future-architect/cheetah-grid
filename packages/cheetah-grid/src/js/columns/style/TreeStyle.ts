import type {
  ColorDef,
  TreeBranchIconStyle,
  TreeLineStyle,
  TreeStyleOption,
} from "../../ts-types";
import { Style } from "./Style";

let defaultStyle: TreeStyle;
export class TreeStyle extends Style {
  private _lineStyle?: TreeLineStyle;
  private _lineColor?: ColorDef;
  private _lineWidth?: number;
  private _branchIcon?: TreeBranchIconStyle;
  private _openedBranchIcon?: TreeBranchIconStyle;
  static get DEFAULT(): TreeStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new TreeStyle());
  }
  constructor(style: TreeStyleOption = {}) {
    super(style);
    this._lineStyle = style.lineStyle;
    this._lineColor = style.lineColor;
    this._lineWidth = style.lineWidth;
    this._branchIcon = style.branchIcon;
    this._openedBranchIcon = style.openedBranchIcon;
  }
  clone(): TreeStyle {
    return new TreeStyle(this);
  }
  get lineStyle(): TreeLineStyle | undefined {
    return this._lineStyle;
  }
  set lineStyle(lineStyle: TreeLineStyle | undefined) {
    this._lineStyle = lineStyle;
    this.doChangeStyle();
  }
  get lineColor(): ColorDef | undefined {
    return this._lineColor;
  }
  set lineColor(lineColor: ColorDef | undefined) {
    this._lineColor = lineColor;
    this.doChangeStyle();
  }
  get lineWidth(): number | undefined {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number | undefined) {
    this._lineWidth = lineWidth;
    this.doChangeStyle();
  }
  get branchIcon(): TreeBranchIconStyle | undefined {
    return this._branchIcon;
  }
  set branchIcon(branchIcon: TreeBranchIconStyle | undefined) {
    this._branchIcon = branchIcon;
    this.doChangeStyle();
  }
  get openedBranchIcon(): TreeBranchIconStyle | undefined {
    return this._openedBranchIcon;
  }
  set openedBranchIcon(openedBranchIcon: TreeBranchIconStyle | undefined) {
    this._openedBranchIcon = openedBranchIcon;
    this.doChangeStyle();
  }
}
