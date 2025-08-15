import type {
  CellContext,
  DrawCellInfo,
  GridCanvasHelperAPI,
  IndicatorObject,
  ListGridAPI,
} from "../../ts-types";

export const enum DrawIndicatorKind {
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
}
export type DrawIndicator = (
  context: CellContext,
  style: IndicatorObject,
  kind: DrawIndicatorKind,
  helper: GridCanvasHelperAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ListGridAPI<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: DrawCellInfo<any>
) => void;
