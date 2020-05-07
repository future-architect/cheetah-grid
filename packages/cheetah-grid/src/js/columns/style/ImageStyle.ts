import type { ImageStyleOption } from "../../ts-types";
import { StdBaseStyle } from "./StdBaseStyle";
let defaultStyle: ImageStyle;
function adj(style: ImageStyleOption): ImageStyleOption {
  const { textAlign = "center" } = style;
  style.textAlign = textAlign;
  return style;
}
export class ImageStyle extends StdBaseStyle {
  private _imageSizing?: "keep-aspect-ratio";
  private _margin: number;
  static get DEFAULT(): ImageStyle {
    return defaultStyle ? defaultStyle : (defaultStyle = new ImageStyle());
  }
  constructor(style: ImageStyleOption = {}) {
    super(adj(style));
    this._imageSizing = style.imageSizing;
    this._margin = style.margin || 4;
  }
  get imageSizing(): "keep-aspect-ratio" | undefined {
    return this._imageSizing;
  }
  set imageSizing(imageSizing) {
    this._imageSizing = imageSizing;
    this.doChangeStyle();
  }
  get margin(): number {
    return this._margin;
  }
  set margin(margin) {
    this._margin = margin;
    this.doChangeStyle();
  }
  clone(): ImageStyle {
    return new ImageStyle(this);
  }
}
