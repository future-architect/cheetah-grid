import type { DrawIndicator } from "./type";
import type { IndicatorStyle } from "../../ts-types";
import { drawTopLeftTriangleIndicator } from "./triangle";

export function getTopLeftIndicatorDraw(
  indicatorStyle: IndicatorStyle
): DrawIndicator | null {
  const { style } = indicatorStyle;
  if (style === "triangle") {
    return drawTopLeftTriangleIndicator;
  }
  return null;
}
