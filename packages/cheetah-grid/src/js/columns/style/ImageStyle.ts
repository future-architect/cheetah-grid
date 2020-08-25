import type { ImageStyleOption } from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";
import { defaults } from "../../internal/utils";
let defaultStyle: ImageStyle;
export class ImageStyle extends StdBaseStyle {
  private _imageSizing?: "keep-aspect-ratio";
  private _margin: number;
  static get DEFAULT(): ImageStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new ImageStyle());
  }
  constructor(style: ImageStyleOption = {}) {
    super(defaults(style, { textAlign: "center" }));
    this._imageSizing = style.imageSizing;
    this._margin = style.margin || 4;
  }
  get imageSizing(): "keep-aspect-ratio" | undefined {
    return this._imageSizing;
  }
  set imageSizing(imageSizing: "keep-aspect-ratio" | undefined) {
    this._imageSizing = imageSizing;
    this.doChangeStyle();
  }
  get margin(): number {
    return this._margin;
  }
  set margin(margin: number) {
    this._margin = margin;
    this.doChangeStyle();
  }
  clone(): ImageStyle {
    return new ImageStyle(this);
  }
}
