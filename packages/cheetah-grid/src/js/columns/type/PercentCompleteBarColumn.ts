import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
  PercentCompleteBarColumnOption,
} from "../../ts-types";
import { getOrApply, str } from "../../internal/utils";
import { Column } from "./Column";
import type { DrawCellInfo } from "../../ts-types-internal";
import { PercentCompleteBarStyle } from "../style/PercentCompleteBarStyle";

const MARGIN = 2;

export class PercentCompleteBarColumn<T> extends Column<T> {
  private _min: number;
  private _max: number;
  private _formatter: (value: unknown) => unknown;
  constructor(option: PercentCompleteBarColumnOption = {}) {
    super(option);
    this._min = option.min || 0;
    this._max = option.max || this._min + 100;
    this._formatter = option.formatter || ((v: unknown): unknown => v);
  }
  get StyleClass(): typeof PercentCompleteBarStyle {
    return PercentCompleteBarStyle;
  }
  clone(): PercentCompleteBarColumn<T> {
    return new PercentCompleteBarColumn(this);
  }
  get min(): number {
    return this.min;
  }
  get max(): number {
    return this.max;
  }
  get formatter(): (value: unknown) => unknown {
    return this.formatter;
  }
  drawInternal(
    value: unknown,
    context: CellContext,
    style: PercentCompleteBarStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void {
    super.drawInternal(
      this._formatter(value),
      context,
      style,
      helper,
      grid,
      info
    );
    const { barColor, barBgColor, barHeight, visibility } = style;
    if (visibility === "hidden") {
      return;
    }

    let textValue = value != null ? String(value) : "";
    if (str.endsWith(textValue, "%")) {
      textValue = textValue.slice(0, -1);
    }
    const num = Number(textValue);
    if (isNaN(num)) {
      return;
    }
    const rate =
      num < this._min
        ? 0
        : num > this._max
        ? 1
        : (num - this._min) / (this._max - this._min);

    helper.drawWithClip(context, (ctx) => {
      const rect = context.getRect();

      const barMaxWidth = rect.width - MARGIN * 2 - 1; /*罫線*/
      const barTop = rect.bottom - MARGIN - barHeight - 1; /*罫線*/
      const barLeft = rect.left + MARGIN;
      ctx.fillStyle = getOrApply(barBgColor, rate * 100) || "#f0f3f5";
      ctx.beginPath();
      ctx.rect(barLeft, barTop, barMaxWidth, barHeight);
      ctx.fill();

      const barSize = Math.min(barMaxWidth * rate, barMaxWidth);
      ctx.fillStyle = getOrApply(barColor, rate * 100) || "#20a8d8";
      ctx.beginPath();
      ctx.rect(barLeft, barTop, barSize, barHeight);
      ctx.fill();
    });
  }
}
