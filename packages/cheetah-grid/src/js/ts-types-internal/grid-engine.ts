import type { CellAddress, FieldDef } from "../ts-types/grid";
import type { ListGridAPI } from "../ts-types/grid-engine";
import type {
  BRANCH_GRAPH_COLUMN_STATE_ID,
  BUTTON_COLUMN_STATE_ID,
  CHECK_COLUMN_STATE_ID,
  CHECK_HEADER_STATE_ID,
  COLUMN_FADEIN_STATE_ID,
  INLINE_INPUT_EDITOR_STATE_ID,
  INLINE_MENU_EDITOR_STATE_ID,
  RADIO_COLUMN_STATE_ID,
  SMALL_DIALOG_INPUT_EDITOR_STATE_ID,
  TREE_COLUMN_STATE_ID,
} from "../internal/symbolManager";

export type ColumnFadeinState = {
  activeFadeins?: ((point: number) => void)[];
  cells: {
    [key: string]: {
      opacity: number;
    };
  };
};

export type ButtonColumnState = {
  mouseActiveCell?: CellAddress;
};
export type CheckColumnState = {
  elapsed: {
    [key: string]: number;
  };
  block: {
    [key: string]: boolean;
  };
  mouseActiveCell?: CellAddress;
};
export type RadioColumnState = {
  elapsed: {
    [key: string]: number;
  };
  block: {
    [key: string]: boolean;
  };
  mouseActiveCell?: CellAddress;
};

interface BranchLine {
  readonly fromIndex?: number;
  toIndex?: number;
  readonly colorIndex: number;
  readonly point?: BranchPoint;
}
interface BranchPoint {
  readonly index: number;
  readonly commit: boolean;
  lines: BranchLine[];
  readonly tag?: string;
}
export type BranchGraphColumnState<T> = Map<
  FieldDef<T>,
  { timeline: BranchPoint[][]; branches: string[] }
>;

export type InputEditorState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element?: any;
};

export type CheckHeaderState = {
  elapsed: {
    [key: string]: number;
  };
  block: {
    [key: string]: boolean;
  };
  mouseActiveCell?: CellAddress;
};

export const enum TreeLineKind {
  none,
  // │
  vertical,
  // └
  last,
  // ┌
  start,
  // ├
  verticalBranch,
  // ─
  horizontal,
  // ┬
  horizontalBranch,
  // half ─
  lone,
}
export type TreeColumnState<T> = {
  drawnIcons?: unknown;
  cache?: Map<FieldDef<T>, unknown>;
};

export interface GridInternal<T> extends ListGridAPI<T> {
  [COLUMN_FADEIN_STATE_ID]?: ColumnFadeinState;
  [BUTTON_COLUMN_STATE_ID]?: ButtonColumnState;
  [CHECK_COLUMN_STATE_ID]?: CheckColumnState;
  [RADIO_COLUMN_STATE_ID]?: RadioColumnState;
  [BRANCH_GRAPH_COLUMN_STATE_ID]?: BranchGraphColumnState<T>;
  [TREE_COLUMN_STATE_ID]?: TreeColumnState<T>;
  [INLINE_MENU_EDITOR_STATE_ID]?: InputEditorState;
  [INLINE_INPUT_EDITOR_STATE_ID]?: InputEditorState;
  [SMALL_DIALOG_INPUT_EDITOR_STATE_ID]?: InputEditorState;
  [CHECK_HEADER_STATE_ID]?: CheckHeaderState;
}
