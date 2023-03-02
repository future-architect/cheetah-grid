import type { DrawIndicator } from "./type";
import type { IndicatorObject } from "../../ts-types";
import { drawTriangleIndicator } from "./triangle";

export function getDrawIndicator(
  indicatorStyle: IndicatorObject
): DrawIndicator | null {
  const { style } = indicatorStyle;
  if (style === "triangle") {
    return drawTriangleIndicator;
  }
  return null;
}
