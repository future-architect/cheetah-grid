import type { ColorDef, SortHeaderStyleOption } from "../../ts-types";
import { StdMultilineTextBaseStyle } from "./StdMultilineTextBaseStyle";

let defaultStyle: SortHeaderStyle;
export class SortHeaderStyle extends StdMultilineTextBaseStyle {
  private _sortArrowColor?: ColorDef;
  private _multiline?: boolean;
  static get DEFAULT(): SortHeaderStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new SortHeaderStyle());
  }
  constructor(style: SortHeaderStyleOption = {}) {
    super(style);
    this._sortArrowColor = style.sortArrowColor;
    this._multiline = style.multiline;
  }
  get sortArrowColor(): ColorDef | undefined {
    return this._sortArrowColor;
  }
  set sortArrowColor(sortArrowColor: ColorDef | undefined) {
    this._sortArrowColor = sortArrowColor;
    this.doChangeStyle();
  }
  get multiline(): boolean {
    return !!this._multiline;
  }
  set multiline(multiline: boolean) {
    this._multiline = multiline;
    this.doChangeStyle();
  }
  clone(): SortHeaderStyle {
    return new SortHeaderStyle(this);
  }
}
