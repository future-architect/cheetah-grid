import {
  CellContext,
  GridCanvasHelper,
  ListGridAPI
} from "../ts-types/grid-engine";
import { ColorPropertyDefine, ColumnIconOption } from "../ts-types/define";
import {
  ColumnStyle,
  ColumnStyleOption,
  HeaderStyleOption
} from "../ts-types/column";
import { CellAddress } from "../ts-types/grid";
import { Message } from "../ts-types/data";

export interface MessageHandler<T> {
  drawCellMessage(
    message: Message,
    context: CellContext,
    style: ColumnStyle,
    helper: GridCanvasHelper,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
}

export interface DrawCellInfo<T> {
  getRecord(): unknown;
  getIcon(): ColumnIconOption<T> | ColumnIconOption<T>[] | null;
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
export type BranchGraphColumnState = {
  [col: number]: { timeline: BranchPoint[][]; branches: string[] };
};

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

export interface GridInternal<T> extends ListGridAPI<T> {
  "$$$$col.fadein_stateID symbol$$$$"?: ColumnFadeinState;
  "$$$$btncol.stateID symbol$$$$"?: ButtonColumnState;
  "$$$$chkcol.stateID symbol$$$$"?: CheckColumnState;
  "$$$$branch_graph_col.stateID symbol$$$$"?: BranchGraphColumnState;
  "$$$$inline_menu_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$inline_input_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$small_dialog_input_editor.stateID symbol$$$$"?: InputEditorState;
  "$$$$check_header.stateID symbol$$$$"?: CheckHeaderState;
}
