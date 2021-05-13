import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
} from "../../ts-types";
import { BaseHeader } from "./BaseHeader";
import type { DrawCellInfo } from "../../ts-types-internal";
import { Style } from "../style/Style";

export class Header<T> extends BaseHeader<T> {
  get StyleClass(): typeof Style {
    return Style;
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: Style,
    helper: GridCanvasHelperAPI,
    _grid: ListGridAPI<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    const { textAlign, textBaseline, color, font, bgColor, textOverflow } =
      style;

    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

    helper.text(value, context, {
      textAlign,
      textBaseline,
      color,
      font,
      textOverflow,
    });
  }
}
