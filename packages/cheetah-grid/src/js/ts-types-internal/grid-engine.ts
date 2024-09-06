import type { CellAddress, FieldDef } from "../ts-types/grid";
import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
} from "../ts-types/grid-engine";
import type { ColorPropertyDefine, ColumnIconOption } from "../ts-types/define";
import type {
  ColumnStyle,
  ColumnStyleOption,
  HeaderStyleOption,
} from "../ts-types/column";
import type { Message } from "../ts-types/data";

export interface MessageHandler<T> {
  drawCellMessage(
    message: Message,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
}

export interface DrawCellInfo<T> {
  getRecord(): unknown;
  getIcon(): ColumnIconOption<never> | ColumnIconOption<never>[] | null;
  getMessage(): Message;
  messageHandler: MessageHandler<T>;
  style: ColumnStyleOption | HeaderStyleOption | null | undefined;
  drawCellBase(arg?: { bgColor?: ColorPropertyDefine }): void;
  drawCellBg(arg?: { bgColor?: ColorPropertyDefine }): void;
  drawCellBorder(): void;
}

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
  "$$$$col.fadein_stateID symbol$$$$"?: ColumnFadeinState;
  "$$$$btncol.stateID symbol$$$$"?: ButtonColumnState;
  "$$$$chkcol.stateID symbol$$$$"?: CheckColumnState;
  "$$$$rdcol.stateID symbol$$$$"?: RadioColumnState;
  "$$$$branch_graph_col.stateID symbol$$$$"?: BranchGraphColumnState<T>;
  "$$$$tree_col.stateID symbol$$$$"?: TreeColumnState<T>;
  "$$$$inline_menu_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$inline_input_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$small_dialog_input_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$check_header.stateID symbol$$$$"?: CheckHeaderState;
}
