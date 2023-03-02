import type { DrawIndicator } from "./type";
import type { IndicatorStyle } from "../../ts-types";
import { drawTriangleIndicator } from "./triangle";

export function getDrawIndicator(
  indicatorStyle: IndicatorStyle
): DrawIndicator | null {
  const { style } = indicatorStyle;
  if (style === "triangle") {
    return drawTriangleIndicator;
  }
  return null;
}
