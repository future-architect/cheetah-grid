import * as icons from "../../internal/icons";
import type {
  CellContext,
  ColumnIconOption,
  GridCanvasHelperAPI,
  IconColumnOption,
  ListGridAPI,
} from "../../ts-types";
import { Column } from "./Column";
import type { DrawCellInfo } from "../../ts-types-internal";
import { IconStyle } from "../style/IconStyle";

function repeatArray(
  val: ColumnIconOption<unknown>,
  count: number
): ColumnIconOption<unknown>[] {
  if (count === Infinity) {
    count = 0;
  }
  const a = [];
  for (let i = 0; i < count; i++) {
    a.push(val);
  }
  return a;
}

export class IconColumn<T> extends Column<T> {
  private _tagName: string;
  private _className?: string;
  private _content?: string;
  private _name?: string;
  private _iconWidth?: number;
  constructor(option: IconColumnOption = {}) {
    super(option);
    this._tagName = option.tagName || "i";
    this._className = option.className;
    this._content = option.content;
    this._name = option.name;
    this._iconWidth = option.iconWidth;
  }
  get StyleClass(): typeof IconStyle {
    return IconStyle;
  }
  clone(): IconColumn<T> {
    return new IconColumn(this);
  }
  get tagName(): string {
    return this._tagName;
  }
  get className(): string | undefined {
    return this._className;
  }
  get content(): string | undefined {
    return this._content;
  }
  get name(): string | undefined {
    return this._name;
  }
  get iconWidth(): number | undefined {
    return this._iconWidth;
  }
  drawInternal(
    value: unknown,
    context: CellContext,
    style: IconStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void {
    const num = Number(value);
    if (!isNaN(num)) {
      const icon: IconColumnOption & { width?: number } = {};
      icons.iconPropKeys.forEach((k) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (icon as any)[k] = (style as any)[k];
      });
      icon.className = this._className;
      icon.tagName = this._tagName;
      if (this._content) {
        icon.content = this._content;
      }
      icon.name = this._name;
      if (this._iconWidth) {
        icon.width = this._iconWidth;
      }

      info.getIcon = (): ColumnIconOption<unknown>[] =>
        repeatArray(icon as ColumnIconOption<unknown>, num);
    } else {
      info.getIcon = (): null => null;
    }
    super.drawInternal("", context, style, helper, grid, info);
  }
}
