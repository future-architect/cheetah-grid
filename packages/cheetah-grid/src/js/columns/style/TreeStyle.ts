import type {
  ColorDef,
  TreeBranchIconStyle,
  TreeBranchIconStyleColumnIcon,
  TreeLineStyle,
  TreeStyleOption,
} from "../../ts-types";
import { Style } from "./Style";

let defaultStyle: TreeStyle;
export class TreeStyle extends Style {
  private _lineStyle?: TreeLineStyle;
  private _lineColor?: ColorDef;
  private _lineWidth?: number;
  private _treeIcon?: TreeBranchIconStyle | TreeBranchIconStyleColumnIcon;
  static get DEFAULT(): TreeStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new TreeStyle());
  }
  constructor(style: TreeStyleOption = {}) {
    super(style);
    this._lineStyle = style.lineStyle;
    this._lineColor = style.lineColor;
    this._lineWidth = style.lineWidth;
    this._treeIcon = style.treeIcon;
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
  get treeIcon():
    | TreeBranchIconStyle
    | TreeBranchIconStyleColumnIcon
    | undefined {
    return this._treeIcon;
  }
  set treeIcon(
    treeIcon: TreeBranchIconStyle | TreeBranchIconStyleColumnIcon | undefined
  ) {
    this._treeIcon = treeIcon;
    this.doChangeStyle();
  }
}
