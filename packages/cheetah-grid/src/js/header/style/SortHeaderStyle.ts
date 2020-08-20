import type { ColorDef, SortHeaderStyleOption } from "../../ts-types";
import { Style } from "./Style";

let defaultStyle: SortHeaderStyle;
export class SortHeaderStyle extends Style {
  private _sortArrowColor?: ColorDef;
  static get DEFAULT(): SortHeaderStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new SortHeaderStyle());
  }
  constructor(style: SortHeaderStyleOption = {}) {
    super(style);
    this._sortArrowColor = style.sortArrowColor;
  }
  get sortArrowColor(): ColorDef | undefined {
    return this._sortArrowColor;
  }
  set sortArrowColor(sortArrowColor: ColorDef | undefined) {
    this._sortArrowColor = sortArrowColor;
    this.doChangeStyle();
  }
  clone(): SortHeaderStyle {
    return new SortHeaderStyle(this);
  }
}
