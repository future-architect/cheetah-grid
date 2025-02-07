import type {
  AnyFunction,
  ColorDef,
  MaybePromise,
  MaybePromiseOrUndef,
  RectProps,
} from "./base";
import type {
  AnyListener,
  DrawGridEventHandlersEventMap,
  DrawGridEventHandlersReturnMap,
  EventListenerId,
  ListGridEventHandlersEventMap,
  ListGridEventHandlersReturnMap,
} from "./events";
import type { CellAddress, CellRange, FieldData, FieldDef } from "./grid";
import type {
  ColorPropertyDefine,
  ColorsPropertyDefine,
  FontPropertyDefine,
  LineClamp,
  StylePropertyFunctionArg,
  TextOverflow,
} from "./define";
import type { ColumnDefine, HeadersDefine } from "../list-grid/layout-map/api";
import type { RecordBoolean } from "./column";
import type { RequiredThemeDefine } from "./plugin";
import type { SimpleColumnIconOption } from "../ts-types-internal/data";

export type LayoutObjectId = number | string | symbol;

export type DrawGridKeyboardMoveCellFunction = (context: {
  event: KeyboardEvent;
  cell: CellAddress;
  grid: DrawGridAPI;
}) => CellAddress | null;

export interface DrawGridKeyboardOptions {
  moveCellOnTab?: boolean | DrawGridKeyboardMoveCellFunction;
  moveCellOnEnter?: boolean | DrawGridKeyboardMoveCellFunction;
  deleteCellValueOnDel?: boolean;
  selectAllOnCtrlA?: boolean;
}

export interface DrawGridAPI {
  font?: string;
  rowCount: number;
  colCount: number;
  frozenRowCount: number;
  frozenColCount: number;
  defaultRowHeight: number;
  defaultColWidth: string | number;
  underlayBackgroundColor?: string;
  trimOnPaste: boolean;
  keyboardOptions: DrawGridKeyboardOptions | null;
  readonly selection: Selection;
  readonly canvas: HTMLCanvasElement;
  readonly visibleRowCount: number;
  readonly visibleColCount: number;
  readonly topRow: number;
  readonly leftCol: number;
  scrollLeft: number;
  scrollTop: number;

  getElement(): HTMLElement;
  focus(): void;
  hasFocusGrid(): boolean;
  listen<TYPE extends keyof DrawGridEventHandlersEventMap>(
    type: TYPE,
    listener: (
      ...event: DrawGridEventHandlersEventMap[TYPE]
    ) => DrawGridEventHandlersReturnMap[TYPE]
  ): EventListenerId;
  listen(type: string, listener: AnyListener): EventListenerId;

  configure(name: "fadeinWhenCallbackInPromise", value?: boolean): boolean;

  updateSize(): void;
  updateScroll(): boolean;

  invalidate(): void;
  invalidateCell(col: number, row: number): void;
  invalidateGridRect(
    startCol: number,
    startRow: number,
    endCol?: number,
    endRow?: number
  ): void;
  invalidateCellRange(cellRange: CellRange): void;

  getRowHeight(row: number): number;
  setRowHeight(row: number, height: number): void;
  getColWidth(col: number): number;
  setColWidth(col: number, width: string | number | null): void;
  getMaxColWidth(col: number): string | number | undefined;
  setMaxColWidth(col: number, maxwidth: string | number): void;
  getMinColWidth(col: number): string | number | undefined;
  setMinColWidth(col: number, minwidth: string | number): void;
  getCellRect(col: number, row: number): RectProps;
  getCellRelativeRect(col: number, row: number): RectProps;
  getCellsRect(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number
  ): RectProps;
  getCellRangeRect(cellRange: CellRange): RectProps;

  isFrozenCell(
    col: number,
    row: number
  ): {
    row: boolean;
    col: boolean;
  } | null;
  getRowAt(absoluteY: number): number;
  getColAt(absoluteX: number): number;
  getCellAt(absoluteX: number, absoluteY: number): CellAddress;
  makeVisibleCell(col: number, row: number): void;
  setFocusCursor(col: number, row: number): void;
  focusCell(col: number, row: number): void;
  getCellOverflowText(col: number, row: number): string | null;
  setCellOverflowText(
    col: number,
    row: number,
    overflowText: false | string
  ): void;

  getAttachCellsArea(range: CellRange): {
    element: HTMLElement;
    rect: RectProps;
  };
  onKeyDownMove(evt: KeyboardEvent): void;
  dispose(): void;
  addDisposable(disposable: { dispose(): void }): void;
}

export interface DataSourceAPI<T> {
  length: number;
  get(index: number): MaybePromiseOrUndef<T>;
  getField<F extends FieldDef<T>>(index: number, field: F): FieldData;
  hasField(index: number, field: FieldDef<T>): boolean;
  setField<F extends FieldDef<T>>(
    index: number,
    field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): MaybePromise<boolean>;
  sort(field: FieldDef<T>, order: "desc" | "asc"): MaybePromise<void>;
  dataSource: DataSourceAPI<T>;
}

export interface SortState {
  col: number;
  row: number;
  order: "asc" | "desc" | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HeaderValues = Map<any, any>;
export interface ListGridAPI<T> extends DrawGridAPI {
  records: T[] | null;
  dataSource: DataSourceAPI<T>;
  theme: RequiredThemeDefine | null;
  allowRangePaste: boolean;
  header: HeadersDefine<T>;
  headerRowHeight: number[] | number;
  sortState: SortState | null;
  headerValues: HeaderValues;
  recordRowCount: number;
  disabled: boolean;
  readOnly: boolean;
  listen<TYPE extends keyof ListGridEventHandlersEventMap<T>>(
    type: TYPE,
    listener: (
      ...event: ListGridEventHandlersEventMap<T>[TYPE]
    ) => ListGridEventHandlersReturnMap[TYPE]
  ): EventListenerId;
  getField(col: number, row: number): FieldDef<T> | undefined;
  getRowRecord(row: number): MaybePromiseOrUndef<T>;
  getRecordIndexByRow(row: number): number;
  getRecordStartRowByRecordIndex(index: number): number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHeaderField(col: number, row: number): any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHeaderValue(col: number, row: number): any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setHeaderValue(col: number, row: number, newValue: any): void;
  getCellRange(col: number, row: number): CellRange;
  getCellRangeByField(field: FieldDef<T>, index: number): CellRange | null;
  focusGridCell(field: FieldDef<T>, index: number): void;
  makeVisibleGridCell(field: FieldDef<T>, index: number): void;
  getGridCanvasHelper(): GridCanvasHelperAPI;
  doChangeValue(
    col: number,
    row: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeValueCallback: (before: any) => any
  ): MaybePromise<boolean>;
  doGetCellValue(
    col: number,
    row: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueCallback: (value: any) => void
  ): boolean;
  doSetPasteValue(text: string): void;
  doSetPasteValue(
    text: string,
    test: (data: SetPasteValueTestData<T>) => boolean
  ): void;
  getLayoutCellId(col: number, row: number): LayoutObjectId;
  getColumnType(col: number, row: number): ColumnTypeAPI;
  getColumnDefine(col: number, row: number): ColumnDefine<T>;
  getColumnAction(col: number, row: number): ColumnActionAPI | undefined;

  fireListeners<TYPE extends keyof ListGridEventHandlersEventMap<T>>(
    type: TYPE,
    ...event: ListGridEventHandlersEventMap<T>[TYPE]
  ): ListGridEventHandlersReturnMap[TYPE][];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ColumnTypeAPI {}

export interface ColumnActionAPI {
  readonly editable: boolean;
  disabled: RecordBoolean;
}

export type SetPasteValueTestData<T> = CellAddress & {
  grid: ListGridAPI<T>;
  record: T;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValue: any;
};

export interface InlineAPI {
  width(arg: { ctx: CanvasRenderingContext2D }): number;
  font(): string | null;
  color(): ColorDef | null;
  canDraw(): boolean;
  onReady(callback: AnyFunction): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draw(opt: any): void;
  canBreak(): boolean;
}

type ColorsDef = ColorDef | (ColorDef | null)[];
export interface GridCanvasHelperAPI {
  theme: RequiredThemeDefine;

  text(
    text: string | (InlineAPI | string)[],
    context: CellContext,
    option: {
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    }
  ): void;
  button(
    caption: string,
    context: CellContext,
    option: {
      bgColor?: ColorPropertyDefine;
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      shadow?: {
        color?: string;
        blur?: number;
        offsetX?: number;
        offsetY?: number;
        offset?: { x?: number; y?: number };
      };
      font?: FontPropertyDefine;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    }
  ): void;
  checkbox(
    check: boolean,
    context: CellContext,
    option: {
      padding?: number | string | (number | string)[];
      animElapsedTime?: number;
      offset?: number;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      borderColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    }
  ): void;
  radioButton(
    check: boolean,
    context: CellContext,
    option: {
      padding?: number | string | (number | string)[];
      animElapsedTime?: number;
      offset?: number;
      checkColor?: ColorPropertyDefine;
      uncheckBorderColor?: ColorPropertyDefine;
      checkBorderColor?: ColorPropertyDefine;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    }
  ): void;
  multilineText(
    lines: string[],
    context: CellContext,
    option: {
      padding?: number | string | (number | string)[];
      offset?: number;
      color?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      font?: FontPropertyDefine;
      lineHeight?: string | number;
      autoWrapText?: boolean;
      lineClamp?: LineClamp;
      textOverflow?: TextOverflow;
      icons?: SimpleColumnIconOption[];
    }
  ): void;

  getColor(
    color: ColorPropertyDefine,
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): ColorDef;
  getColor(
    color: ColorsPropertyDefine,
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): ColorsDef;
  getStyleProperty<T>(
    style: T | ((args: StylePropertyFunctionArg) => T),
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D
  ): T;
  toBoxPixelArray(
    value: number | string | (number | string)[],
    context: CellContext,
    font: string | undefined
  ): [number, number, number, number];
  fillRectWithState(
    rect: RectProps,
    context: CellContext,
    option: { fillColor?: ColorPropertyDefine }
  ): void;
  drawBorderWithClip(
    context: CellContext,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): void;
  drawWithClip(
    context: CellContext,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): void;
  testFontLoad(
    font: string | undefined,
    value: string,
    context: CellContext
  ): boolean;

  buildCheckBoxInline(
    check: boolean,
    context: CellContext,
    option: {
      animElapsedTime?: number;
      uncheckBgColor?: ColorPropertyDefine;
      checkBgColor?: ColorPropertyDefine;
      borderColor?: ColorPropertyDefine;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
    }
  ): InlineAPI;
}
export interface CellContext {
  readonly col: number;
  readonly row: number;
  getContext(): CanvasRenderingContext2D;
  toCurrentContext(): CellContext;
  getDrawRect(): RectProps | null;
  getRect(): RectProps;
  getSelection(): { select: CellAddress; range: CellRange };
  setRectFilter(rectFilter: (base: RectProps) => RectProps): void;
}

export interface Selection {
  select: CellAddress;
  range: CellRange;
}
