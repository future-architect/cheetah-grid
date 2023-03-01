import type {
  CellContext,
  GridCanvasHelperAPI,
  IndicatorStyle,
  ListGridAPI,
} from "../../ts-types";
import type { DrawCellInfo } from "../../ts-types-internal";

export type DrawIndicator = (
  context: CellContext,
  style: IndicatorStyle,
  helper: GridCanvasHelperAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ListGridAPI<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: DrawCellInfo<any>
) => void;
