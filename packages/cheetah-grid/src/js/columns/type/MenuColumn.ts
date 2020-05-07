import * as utils from "./columnUtils";
import type {
  CellContext,
  ColumnMenuItemOptions,
  GridCanvasHelperAPI,
  ListGridAPI,
  MenuColumnOption,
  SimpleColumnMenuItemOption,
} from "../../ts-types";
import { BaseColumn } from "./BaseColumn";
import type { DrawCellInfo } from "../../ts-types-internal";
import { MenuStyle } from "../style/MenuStyle";
import { isDef } from "../../internal/utils";
import { normalize } from "../../internal/menu-items";

export class MenuColumn<T> extends BaseColumn<T, unknown> {
  private _options: SimpleColumnMenuItemOption[];
  constructor(option: MenuColumnOption = {}) {
    super(option);
    this._options = normalize(option.options);
  }
  get StyleClass(): typeof MenuStyle {
    return MenuStyle;
  }
  clone(): MenuColumn<T> {
    return new MenuColumn(this);
  }
  get options(): SimpleColumnMenuItemOption[] {
    return this._options;
  }
  withOptions(options: ColumnMenuItemOptions): MenuColumn<T> {
    const c = this.clone();
    c._options = normalize(options);
    return c;
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: MenuStyle,
    helper: GridCanvasHelperAPI,
    _grid: ListGridAPI<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      font,
      bgColor,
      padding,
      textOverflow,
      appearance,
    } = style;
    let { color } = style;
    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }
    const text = this._convertInternal(value);
    helper.testFontLoad(font, text, context);
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      const basePadding = helper.toBoxPixelArray(padding || 0, context, font);
      const textPadding = basePadding.slice(0);
      textPadding[1] += 26; // icon padding
      const iconPadding = basePadding.slice(0);
      iconPadding[1] += 8;
      if (!isDef(color) && (!isDef(value) || value === "")) {
        color = "rgba(0, 0, 0, .38)";
      }
      helper.text(text, context, {
        textAlign,
        textBaseline,
        color,
        font,
        padding: textPadding,
        textOverflow,
        icons,
      });

      if (appearance === "menulist-button") {
        // draw dropdown arrow icon
        helper.text("", context, {
          textAlign: "right",
          textBaseline,
          color,
          font,
          icons: [
            {
              path: "M0 2 5 7 10 2z",
              width: 10,
              color: "rgba(0, 0, 0, .54)",
            },
          ],
          padding: iconPadding,
        });
      } else if (appearance !== "none") {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.warn(`unsupported appearance:${appearance}`);
      }
    });
  }
  convertInternal(value: unknown): unknown {
    return value;
  }
  _convertInternal(value: unknown): string {
    const options = this._options;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.value === value) {
        value = option.label;
        break;
      }
    }
    return super.convertInternal(value) as string;
  }
  getCopyCellValue(value: unknown): string {
    return this._convertInternal(value);
  }
}
