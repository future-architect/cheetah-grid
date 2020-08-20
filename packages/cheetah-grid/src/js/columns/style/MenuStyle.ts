import type { MenuStyleOption } from "../../ts-types";
import { Style } from "./Style";

let defaultStyle: MenuStyle;
export class MenuStyle extends Style {
  private _appearance?: "menulist-button" | "none";
  static get DEFAULT(): MenuStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new MenuStyle());
  }
  constructor(style: MenuStyleOption = {}) {
    super(style);
    const { appearance } = style;
    this._appearance = appearance;
  }
  get appearance(): "menulist-button" | "none" | undefined {
    return this._appearance || "menulist-button";
  }
  set appearance(appearance: "menulist-button" | "none" | undefined) {
    this._appearance = appearance;
    this.doChangeStyle();
  }
  clone(): MenuStyle {
    return new MenuStyle(this);
  }
}
