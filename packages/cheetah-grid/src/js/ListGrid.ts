import * as icons from "./internal/icons";
import * as themes from "./themes";
import { CachedDataSource, DataSource } from "./data";
import {
  CellAddress,
  CellContext,
  CellRange,
  ColorPropertyDefine,
  ColorsPropertyDefine,
  ColumnIconOption,
  ColumnStyleOption,
  DrawGridAPI,
  EventListenerId,
  FieldData,
  FieldDef,
  HeaderValues,
  LayoutObjectId,
  ListGridAPI,
  ListGridEventHandlersEventMap,
  ListGridEventHandlersReturnMap,
  MaybePromise,
  MaybePromiseOrUndef,
  Message,
  PasteCellEvent,
  SelectedCellEvent,
  SortState,
  ThemeDefine
} from "./ts-types";
import {
  ColumnDefine,
  GroupHeaderDefine,
  HeaderDefine,
  HeadersDefine,
  LayoutDefine,
  LayoutMapAPI,
  MultiLayoutMap,
  SimpleHeaderLayoutMap
} from "./list-grid/layout-map";
import {
  DrawGrid,
  DrawGridConstructorOptions,
  DrawGridProtected
} from "./core/DrawGrid";
import {
  cellEquals,
  event,
  isDef,
  isPromise,
  obj,
  then
} from "./internal/utils";
import { BaseColumn } from "./columns/type/BaseColumn";
import { BaseStyle } from "./columns/style";
import { ColumnData } from "./list-grid/layout-map/api";
import { DrawCellInfo } from "./ts-types-internal";
import { GridCanvasHelper } from "./GridCanvasHelper";
import { BaseStyle as HeaderBaseStyle } from "./header/style";
import { LG_EVENT_TYPE } from "./list-grid/LG_EVENT_TYPE";
import { MessageHandler } from "./columns/message/MessageHandler";
import { Rect } from "./internal/Rect";
import { Theme } from "./themes/theme";
import { TooltipHandler } from "./tooltip/TooltipHandler";
//protected symbol
import { getProtectedSymbol } from "./internal/symbolManager";

const _ = getProtectedSymbol();

//private methods
function _getCellRange<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): CellRange {
  return grid[_].layoutMap.getCellRange(col, row);
}
function _updateRect<T>(
  grid: ListGrid<T>,
  col: number,
  row: number,
  context: CellContext
): void {
  context.setRectFilter(rect => {
    let { left, right, top, bottom } = rect;
    const {
      start: { col: startCol, row: startRow },
      end: { col: endCol, row: endRow }
    } = _getCellRange(grid, col, row);
    for (let c = col - 1; c >= startCol; c--) {
      left -= grid.getColWidth(c);
    }
    for (let c = col + 1; c <= endCol; c++) {
      right += grid.getColWidth(c);
    }
    for (let r = row - 1; r >= startRow; r--) {
      top -= grid.getRowHeight(r);
    }
    for (let r = row + 1; r <= endRow; r++) {
      bottom += grid.getRowHeight(r);
    }
    return Rect.bounds(left, top, right, bottom);
  });
}
function _getCellValue<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): FieldData {
  if (row < grid[_].layoutMap.headerRowCount) {
    return grid[_].layoutMap.getHeader(col, row).caption;
  } else {
    const { field } = grid[_].layoutMap.getBody(col, row);
    return _getField(grid, field, row);
  }
}
function _setCellValue<T>(
  grid: ListGrid<T>,
  col: number,
  row: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): MaybePromise<boolean> {
  if (row < grid[_].layoutMap.headerRowCount) {
    // nop
    return false;
  } else {
    const { field } = grid[_].layoutMap.getBody(col, row);
    if (field == null) {
      return false;
    }
    const index = _getRecordIndexByRow(grid, row);
    return grid[_].dataSource.setField(index, field, value);
  }
}
function _getCellMessage<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): FieldData {
  if (row < grid[_].layoutMap.headerRowCount) {
    return null;
  } else {
    const { message } = grid[_].layoutMap.getBody(col, row);
    if (!message) {
      return null;
    }
    return _getField(grid, message as FieldDef<T>, row);
  }
}
function _getCellIcon0<T>(
  grid: ListGrid<T>,
  icon: ColumnIconOption<T>,
  row: number
): ColumnIconOption<T>;
function _getCellIcon0<T>(
  grid: ListGrid<T>,
  icon: ColumnIconOption<T>[],
  row: number
): ColumnIconOption<T>[];
function _getCellIcon0<T>(
  grid: ListGrid<T>,
  icon: ColumnIconOption<T> | ColumnIconOption<T>[],
  row: number
): ColumnIconOption<T> | ColumnIconOption<T>[];
function _getCellIcon0<T>(
  grid: ListGrid<T>,
  icon: ColumnIconOption<T> | ColumnIconOption<T>[],
  row: number
): ColumnIconOption<T> | ColumnIconOption<T>[] {
  if (Array.isArray(icon)) {
    return icon.map(i => _getCellIcon0(grid, i, row));
  }
  if (!obj.isObject(icon) || typeof icon === "function") {
    return _getField(grid, icon, row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const retIcon: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconOpt: any = icon;
  icons.iconPropKeys.forEach(k => {
    if (iconOpt[k]) {
      const f = _getField(grid, iconOpt[k], row);
      if (isDef(f)) {
        retIcon[k] = f;
      } else {
        if (!_hasField(grid, iconOpt[k], row)) {
          retIcon[k] = iconOpt[k];
        }
      }
    }
  });
  return retIcon;
}
function _getCellIcon<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): ColumnIconOption<T> | ColumnIconOption<T>[] | null {
  const { icon } = grid[_].layoutMap.getBody(col, row);
  if (icon == null) {
    return null;
  }
  return _getCellIcon0(grid, icon, row);
}
function _getField<T>(
  grid: ListGrid<T>,
  field: FieldDef<T> | undefined,
  row: number
): FieldData {
  if (!isDef(field)) {
    return null;
  }
  if (row < grid[_].layoutMap.headerRowCount) {
    return null;
  } else {
    const index = _getRecordIndexByRow(grid, row);
    return grid[_].dataSource.getField(index, field);
  }
}
function _hasField<T>(
  grid: ListGrid<T>,
  field: FieldDef<T>,
  row: number
): boolean {
  if (!isDef(field)) {
    return false;
  }
  if (row < grid[_].layoutMap.headerRowCount) {
    return false;
  } else {
    const index = _getRecordIndexByRow(grid, row);
    return grid[_].dataSource.hasField(index, field);
  }
}
function _onDrawValue<T>(
  grid: ListGrid<T>,
  cellValue: MaybePromise<unknown>,
  context: CellContext,
  { col, row }: CellAddress,
  style: ColumnStyleOption | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draw: BaseColumn<T, any>["onDrawCell"]
): MaybePromise<void> {
  const helper = grid[_].gridCanvasHelper;

  const drawCellBg = ({
    bgColor
  }: { bgColor?: ColorPropertyDefine } = {}): void => {
    const fillOpt = {
      fillColor: bgColor
    };
    //cell全体を描画
    helper.fillCellWithState(context, fillOpt);
  };
  const drawCellBorder = (): void => {
    if (context.col === grid.frozenColCount - 1) {
      //固定列罫線
      const rect = context.getRect();
      helper.drawWithClip(context, ctx => {
        const borderColor =
          context.row >= grid.frozenRowCount
            ? helper.theme.borderColor
            : helper.theme.frozenRowsBorderColor;

        const borderColors = helper.toBoxArray(
          helper.getColor(borderColor, context.col, context.row, ctx)
        );
        if (borderColors[1]) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = borderColors[1];
          ctx.beginPath();
          ctx.moveTo(rect.right - 2.5, rect.top);
          ctx.lineTo(rect.right - 2.5, rect.bottom);
          ctx.stroke();
        }
      });
    }

    _borderWithState(grid, helper, context);
  };

  const drawCellBase = ({
    bgColor
  }: { bgColor?: ColorPropertyDefine } = {}): void => {
    drawCellBg({ bgColor });
    drawCellBorder();
  };
  const info: DrawCellInfo<T> = {
    getRecord: () => grid.getRowRecord(row),
    getIcon: () => _getCellIcon(grid, col, row),
    getMessage: () => _getCellMessage(grid, col, row),
    messageHandler: grid[_].messageHandler,
    style,
    drawCellBase,
    drawCellBg,
    drawCellBorder
  };

  return draw(cellValue, info, context, grid);
}
function _borderWithState<T>(
  grid: ListGrid<T>,
  helper: GridCanvasHelper<T>,
  context: CellContext
): void {
  const { col, row } = context;
  const sel = grid.selection.select;
  const { layoutMap } = grid[_];

  const rect = context.getRect();
  const option: { borderColor?: ColorsPropertyDefine; lineWidth?: number } = {};

  const selRecordIndex = layoutMap.getRecordIndexByRow(sel.row);
  const selId = layoutMap.getCellId(sel.col, sel.row);
  function isSelectCell(col: number, row: number): boolean {
    if (col === sel.col && row === sel.row) {
      return true;
    }
    return (
      selId != null &&
      layoutMap.getCellId(col, row) === selId &&
      layoutMap.getRecordIndexByRow(row) === selRecordIndex
    );
  }

  //罫線
  if (isSelectCell(col, row)) {
    option.borderColor = helper.theme.highlightBorderColor;
    option.lineWidth = 2;
    helper.border(context, option);
  } else {
    option.lineWidth = 1;
    // header color
    const isFrozenCell = grid.isFrozenCell(col, row);
    if (isFrozenCell?.row) {
      option.borderColor = helper.theme.frozenRowsBorderColor;
    }
    helper.border(context, option);

    //追加処理
    if (col > 0 && isSelectCell(col - 1, row)) {
      //右が選択されている
      helper.drawBorderWithClip(context, ctx => {
        const borderColors = helper.toBoxArray(
          helper.getColor(
            helper.theme.highlightBorderColor,
            sel.col,
            sel.row,
            ctx
          )
        );
        if (borderColors[1]) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = borderColors[1];
          ctx.beginPath();
          ctx.moveTo(rect.left - 0.5, rect.top);
          ctx.lineTo(rect.left - 0.5, rect.bottom);
          ctx.stroke();
        }
      });
    } else if (row > 0 && isSelectCell(col, row - 1)) {
      //上が選択されている
      helper.drawBorderWithClip(context, ctx => {
        const borderColors = helper.toBoxArray(
          helper.getColor(
            helper.theme.highlightBorderColor,
            sel.col,
            sel.row,
            ctx
          )
        );
        if (borderColors[0]) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = borderColors[0];
          ctx.beginPath();
          ctx.moveTo(rect.left, rect.top - 0.5);
          ctx.lineTo(rect.right, rect.top - 0.5);
          ctx.stroke();
        }
      });
    }
  }
}
function _refreshHeader<T>(grid: ListGrid<T>): void {
  const protectedSpace = grid[_];
  if (protectedSpace.headerEvents) {
    protectedSpace.headerEvents.forEach(id => grid.unlisten(id));
  }

  const headerEvents: EventListenerId[] = (grid[_].headerEvents = []);

  headerEvents.forEach(id => grid.unlisten(id));
  let layoutMap: LayoutMapAPI<T>;
  if (
    protectedSpace.layout &&
    (!Array.isArray(protectedSpace.layout) || protectedSpace.layout.length > 0)
  ) {
    layoutMap = protectedSpace.layoutMap = new MultiLayoutMap(
      protectedSpace.layout
    );
  } else {
    layoutMap = protectedSpace.layoutMap = new SimpleHeaderLayoutMap(
      protectedSpace.header ?? []
    );
  }
  layoutMap.headerObjects.forEach(cell => {
    const ids = cell.headerType.bindGridEvent(grid, cell.id);
    headerEvents.push(...ids);
    if (cell.style) {
      if (cell.style instanceof HeaderBaseStyle) {
        const id = cell.style.listen(
          HeaderBaseStyle.EVENT_TYPE.CHANGE_STYLE,
          () => {
            grid.invalidate();
          }
        );
        headerEvents.push(id);
      }
    }
    if (cell.action) {
      const ids = cell.action.bindGridEvent(grid, cell.id);
      headerEvents.push(...ids);
    }
  });
  layoutMap.columnObjects.forEach(col => {
    if (col.action) {
      const ids = col.action.bindGridEvent(grid, col.id);
      headerEvents.push(...ids);
    }
    if (col.columnType) {
      const ids = col.columnType.bindGridEvent(grid, col.id);
      headerEvents.push(...ids);
    }
    if (col.style) {
      if (col.style instanceof BaseStyle) {
        const id = col.style.listen(BaseStyle.EVENT_TYPE.CHANGE_STYLE, () => {
          grid.invalidate();
        });
        headerEvents.push(id);
      }
    }
  });
  for (let col = 0; col < layoutMap.columnWidths.length; col++) {
    const column = layoutMap.columnWidths[col];
    const { width, minWidth, maxWidth } = column;
    if (width && (width > 0 || typeof width === "string")) {
      grid.setColWidth(col, width);
    }
    if (minWidth && (minWidth > 0 || typeof minWidth === "string")) {
      grid.setMinColWidth(col, minWidth);
    }
    if (maxWidth && (maxWidth > 0 || typeof maxWidth === "string")) {
      grid.setMaxColWidth(col, maxWidth);
    }
  }
  const headerRowHeight = grid[_];
  for (let row = 0; row < layoutMap.headerRowCount; row++) {
    const height = Array.isArray(headerRowHeight)
      ? headerRowHeight[row]
      : headerRowHeight;
    if (height && height > 0) {
      grid.setRowHeight(row, height);
    }
  }
  grid.colCount = layoutMap.colCount;
  _refreshRowCount(grid);
  grid.frozenRowCount = layoutMap.headerRowCount;
}

function _refreshRowCount<T>(grid: ListGrid<T>): void {
  const { layoutMap } = grid[_];
  grid.rowCount =
    grid[_].dataSource.length * layoutMap.bodyRowCount +
    layoutMap.headerRowCount;
}
function _tryWithUpdateDataSource<T>(
  grid: ListGrid<T>,
  fn: (grid: ListGrid<T>) => void
): void {
  const { dataSourceEventIds } = grid[_];

  if (dataSourceEventIds) {
    dataSourceEventIds.forEach(id => grid[_].handler.off(id));
  }

  fn(grid);

  grid[_].dataSourceEventIds = [
    grid[_].handler.on(
      grid[_].dataSource,
      DataSource.EVENT_TYPE.UPDATED_LENGTH,
      () => {
        _refreshRowCount(grid);
        grid.invalidate();
      }
    ),
    grid[_].handler.on(
      grid[_].dataSource,
      DataSource.EVENT_TYPE.UPDATED_ORDER,
      () => {
        grid.invalidate();
      }
    )
  ];
}
function _setRecords<T>(grid: ListGrid<T>, records: T[] = []): void {
  _tryWithUpdateDataSource(grid, () => {
    grid[_].records = records;
    const newDataSource = (grid[_].dataSource = CachedDataSource.ofArray(
      records
    ));
    grid.addDisposable(newDataSource);
  });
}
function _setDataSource<T>(grid: ListGrid<T>, dataSource: DataSource<T>): void {
  _tryWithUpdateDataSource(grid, () => {
    if (dataSource) {
      if (dataSource instanceof DataSource) {
        grid[_].dataSource = dataSource;
      } else {
        const newDataSource = (grid[_].dataSource = new CachedDataSource(
          dataSource
        ));
        grid.addDisposable(newDataSource);
      }
    } else {
      grid[_].dataSource = DataSource.EMPTY;
    }
    grid[_].records = null;
  });
}

function _getRecordIndexByRow<T>(grid: ListGrid<T>, row: number): number {
  const { layoutMap } = grid[_];
  return layoutMap.getRecordIndexByRow(row);
}

function _onRangePaste<T>(this: ListGrid<T>, event: PasteCellEvent): void {
  const { layoutMap } = this[_];
  const selectionRange = this.selection.range;
  const { start } = this.getCellRange(
    selectionRange.start.col,
    selectionRange.start.row
  );
  const { end } = this.getCellRange(
    selectionRange.end.col,
    selectionRange.end.row
  );
  const values = event.rangeBoxValues;

  const pasteRowCount = Math.min(
    Math.max(end.row - start.row + 1, values.rowCount),
    this.rowCount - start.row
  );
  const pasteColCount = Math.min(
    Math.max(end.col - start.col + 1, values.colCount),
    this.colCount - start.col
  );

  let hasEditable = false;
  const actionColumnsBox: ColumnData<T>[][] = [];
  for (let bodyRow = 0; bodyRow < layoutMap.bodyRowCount; bodyRow++) {
    const actionColumnsRow: ColumnData<T>[] = [];
    actionColumnsBox.push(actionColumnsRow);
    for (let offsetCol = 0; offsetCol < pasteColCount; offsetCol++) {
      const body = layoutMap.getBody(
        start.col + offsetCol,
        bodyRow + layoutMap.bodyRowCount
      );
      actionColumnsRow[offsetCol] = body;
      if (!hasEditable && body.action?.editable) {
        hasEditable = true;
      }
    }
  }
  if (!hasEditable) {
    return;
  }

  const startRow = layoutMap.getRecordStartRowByRecordIndex(
    layoutMap.getRecordIndexByRow(start.row)
  );
  const startRowOffset = start.row - startRow;

  let duplicate: { [key: number]: boolean } = {};
  let actionRow = startRowOffset;
  let valuesRow = 0;
  for (let offsetRow = 0; offsetRow < pasteRowCount; offsetRow++) {
    let valuesCol = 0;
    for (let offsetCol = 0; offsetCol < pasteColCount; offsetCol++) {
      const { action, id } = actionColumnsBox[actionRow][offsetCol];
      if (!duplicate[id as number] && action?.editable) {
        duplicate[id as number] = true;
        const col = start.col + offsetCol;
        const row = start.row + offsetRow;
        const cellValue = values.getCellValue(valuesCol, valuesRow);

        then(this.getRowRecord(row), () => {
          then(_getCellValue(this, col, row), () => {
            action.onPasteCellRangeBox(this, { col, row }, cellValue);
          });
        });
      }
      valuesCol++;
      if (valuesCol >= values.colCount) {
        valuesCol = 0;
      }
    }
    actionRow++;
    if (actionRow >= layoutMap.bodyRowCount) {
      actionRow = 0;
      duplicate = {};
    }
    valuesRow++;
    if (valuesRow >= values.rowCount) {
      valuesRow = 0;
    }
  }

  const newEnd = {
    col: start.col + pasteColCount - 1,
    row: start.row + pasteRowCount - 1
  };
  this.selection.range = {
    start,
    end: newEnd
  };
  this.invalidateCellRange(this.selection.range);
}

//end private methods
//
//
//

function adjustListGridOption<T>(
  options: ListGridConstructorOptions<T>
): ListGridConstructorOptions<T> {
  delete options.frozenRowCount;
  delete options.colCount;
  delete options.rowCount;
  return options;
}
interface ListGridProtected<T> extends DrawGridProtected {
  dataSourceEventIds?: EventListenerId[];
  headerEvents?: EventListenerId[];
  layoutMap: LayoutMapAPI<T>;
  headerValues?: HeaderValues;
  tooltipHandler: TooltipHandler<T>;
  messageHandler: MessageHandler<T>;
  theme: Theme | null;
  headerRowHeight: number[] | number;
  header: HeadersDefine<T>;
  layout: LayoutDefine<T>;
  gridCanvasHelper: GridCanvasHelper<T>;
  sortState: SortState;
  dataSource: DataSource<T>;
  records?: T[] | null;
  allowRangePaste: boolean;
}
export { ListGridProtected };

export interface ListGridConstructorOptions<T>
  extends DrawGridConstructorOptions {
  /**
   * Simple header property
   */
  header?: HeadersDefine<T>;
  /**
   * Layout property
   */
  layout?: LayoutDefine<T>;
  /**
   * Header row height(s)
   */
  headerRowHeight?: number[] | number;
  /**
   * Records data source
   */
  dataSource?: DataSource<T>;
  /**
   * Simple records data
   */
  records?: T[];
  /**
   * Theme
   */
  theme?: ThemeDefine | string;
  /**
   * If set to true to allow pasting of ranges. default false
   */
  allowRangePaste?: boolean;
  /**
   * @deprecated Cannot be used with ListGrid.
   * @override
   */
  rowCount?: undefined;
  /**
   * @deprecated Cannot be used with ListGrid.
   * @override
   */
  colCount?: undefined;
  /**
   * @deprecated Cannot be used with ListGrid.
   * @override
   */
  frozenRowCount?: undefined;
}
export { HeadersDefine, ColumnDefine, HeaderDefine, GroupHeaderDefine };
/**
 * ListGrid
 * @classdesc cheetahGrid.ListGrid
 * @memberof cheetahGrid
 */
export class ListGrid<T> extends DrawGrid implements ListGridAPI<T> {
  protected [_]: ListGridProtected<T>;
  static get EVENT_TYPE(): typeof LG_EVENT_TYPE {
    return LG_EVENT_TYPE;
  }
  /**
   * constructor
   *
   * @constructor
   * @param options Constructor options
   */
  constructor(options: ListGridConstructorOptions<T> = {}) {
    super(adjustListGridOption(options));
    const protectedSpace = this[_];
    protectedSpace.header = options.header || [];
    protectedSpace.layout = options.layout || [];
    protectedSpace.headerRowHeight = options.headerRowHeight || [];
    if (options.dataSource) {
      _setDataSource(this, options.dataSource);
    } else {
      _setRecords(this, options.records);
    }
    protectedSpace.allowRangePaste = options.allowRangePaste ?? false;
    _refreshHeader(this);
    protectedSpace.sortState = {
      col: -1,
      row: -1,
      order: undefined
    };
    protectedSpace.gridCanvasHelper = new GridCanvasHelper(this);
    protectedSpace.theme = themes.of(options.theme);
    protectedSpace.messageHandler = new MessageHandler(
      this,
      (col: number, row: number): Message => _getCellMessage(this, col, row)
    );
    protectedSpace.tooltipHandler = new TooltipHandler(this);
    this.invalidate();
    protectedSpace.handler.on(window, "resize", () => {
      this.updateSize();
      this.updateScroll();
      this.invalidate();
    });
  }
  /**
   * Dispose the grid instance.
   * @returns {void}
   */
  dispose(): void {
    const protectedSpace = this[_];
    protectedSpace.messageHandler.dispose();
    protectedSpace.tooltipHandler.dispose();
    super.dispose();
  }
  /**
   * Gets the define of the header.
   */
  get header(): HeadersDefine<T> {
    return this[_].header;
  }
  /**
   * Sets the define of the header with the given data.
   * <pre>
   * column options
   * -----
   * caption: header caption
   * field: field name
   * width: column width
   * minWidth: column min width
   * maxWidth: column max width
   * icon: icon name
   * message: message key name
   * columnType: column type
   * action: column action
   * style: column style
   * headerType: header type
   * headerStyle: header style
   * headerAction: header action
   * headerField: header field name
   * sort: define sort setting
   * -----
   *
   * multiline header
   * -----
   * caption: header caption
   * columns: columns define
   * -----
   * </pre>
   */
  set header(header) {
    this[_].header = header;
    _refreshHeader(this);
  }
  /**
   * Gets the define of the layout.
   */
  get layout(): LayoutDefine<T> {
    return this[_].layout;
  }
  /**
   * Sets the define of the layout with the given data.
   */
  set layout(layout) {
    this[_].layout = layout;
    _refreshHeader(this);
  }
  /**
   * Get the row count per record
   */
  get recordRowCount(): number {
    return this[_].layoutMap.bodyRowCount;
  }
  /**
   * Get the records.
   */
  get records(): T[] | null {
    return this[_].records || null;
  }
  /**
   * Set the records from given
   */
  set records(records) {
    if (records == null) {
      return;
    }
    _setRecords(this, records);
    _refreshRowCount(this);
    this.invalidate();
  }
  /**
   * Get the data source.
   */
  get dataSource(): DataSource<T> {
    return this[_].dataSource;
  }
  /**
   * Set the data source from given
   */
  set dataSource(dataSource) {
    _setDataSource(this, dataSource);
    _refreshRowCount(this);
    this.invalidate();
  }
  /**
   * Get the theme.
   */
  get theme(): Theme | null {
    return this[_].theme;
  }
  /**
   * Set the theme from given
   */
  set theme(theme) {
    this[_].theme = themes.of(theme);
    this.invalidate();
  }
  /**
   * If set to true to allow pasting of ranges.
   */
  get allowRangePaste(): boolean {
    return this[_].allowRangePaste;
  }
  set allowRangePaste(allowRangePaste) {
    this[_].allowRangePaste = allowRangePaste;
  }
  /**
   * Get the font definition as a string.
   * @override
   */
  get font(): string {
    return super.font || this[_].gridCanvasHelper.theme.font;
  }
  /**
   * Set the font definition with the given string.
   * @override
   */
  set font(font) {
    super.font = font;
  }
  /**
   * Get the background color of the underlay.
   * @override
   */
  get underlayBackgroundColor(): string {
    return (
      super.underlayBackgroundColor ||
      this[_].gridCanvasHelper.theme.underlayBackgroundColor
    );
  }
  /**
   * Set the background color of the underlay.
   * @override
   */
  set underlayBackgroundColor(underlayBackgroundColor) {
    super.underlayBackgroundColor = underlayBackgroundColor;
  }
  /**
   * Get the sort state.
   */
  get sortState(): SortState {
    return this[_].sortState;
  }
  /**
   * Sets the sort state.
   * If `null` to set, the sort state is initialized.
   */
  set sortState(sortState) {
    const oldState = this.sortState;
    let oldField;
    if (oldState.col >= 0 && oldState.row >= 0) {
      oldField = this.getHeaderField(oldState.col, oldState.row);
    }

    const newState = (this[_].sortState = isDef(sortState)
      ? sortState
      : {
          col: -1,
          row: -1,
          order: undefined
        });

    let newField;
    if (newState.col >= 0 && newState.row >= 0) {
      newField = this.getHeaderField(newState.col, newState.row);
    }

    // bind header value
    if (isDef(oldField) && oldField !== newField) {
      this.setHeaderValue(oldState.col, oldState.row, undefined);
    }
    if (isDef(newField)) {
      this.setHeaderValue(newState.col, newState.row, newState.order);
    }
  }
  /**
   * Get the header values.
   */
  get headerValues(): HeaderValues {
    return this[_].headerValues || (this[_].headerValues = new Map());
  }
  /**
   * Sets the header values.
   */
  set headerValues(headerValues) {
    this[_].headerValues = headerValues || new Map();
  }
  /**
   * Get the field of the given column index.
   * @param  {number} col The column index.
   * @param  {number} row The row index.
   * @return {*} The field object.
   */
  getField(col: number, row: number): FieldDef<T> | undefined {
    return this[_].layoutMap.getBody(
      col,
      row ?? this[_].layoutMap.headerRowCount
    ).field;
  }
  /**
   * Get the column define of the given column index.
   * @param  {number} col The column index.
   * @param  {number} row The row index.
   * @return {*} The column define object.
   */
  getColumnDefine(col: number, row: number): ColumnDefine<T> {
    return this[_].layoutMap.getBody(
      col,
      row ?? this[_].layoutMap.headerRowCount
    ).define;
  }
  /**
   * Get the header field of the given header cell.
   * @param  {number} col The column index.
   * @param  {number} row The header row index.
   * @return {*} The field object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHeaderField(col: number, row: number): any | undefined {
    const hd = this[_].layoutMap.getHeader(col, row);
    return hd.field;
  }
  /**
   * Get the header define of the given header cell.
   * @param  {number} col The column index.
   * @param  {number} row The header row index.
   * @return {*} The header define object.
   */
  getHeaderDefine(col: number, row: number): HeaderDefine<T> {
    const hd = this[_].layoutMap.getHeader(col, row);
    return hd.define;
  }
  /**
   * Get the record of the given row index.
   * @param  {number} row The row index.
   * @return {object} The record.
   */
  getRowRecord(row: number): MaybePromiseOrUndef<T> {
    if (row < this[_].layoutMap.headerRowCount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined;
    } else {
      return this[_].dataSource.get(_getRecordIndexByRow(this, row));
    }
  }
  /**
   * Get the record index of the given row index.
   * @param  {number} row The row index.
   */
  getRecordIndexByRow(row: number): number {
    return _getRecordIndexByRow(this, row);
  }
  /**
   * Gets the row index starting at the given record index.
   * @param  {number} index The record index.
   */
  getRecordStartRowByRecordIndex(index: number): number {
    return this[_].layoutMap.getRecordStartRowByRecordIndex(index);
  }
  /**
   * Get the column index of the given field.
   * @param  {*} field The field.
   * @return {number} The column index.
   * @deprecated use `getCellRangeByField` instead
   */
  getColumnIndexByField(field: FieldDef<T>): number | null {
    const range = this.getCellRangeByField(field, 0);
    return range?.start.col ?? null;
  }
  /**
   * Get the column index of the given field.
   * @param  {*} field The field.
   * @param  {number} index The record index
   * @return {number} The column index.
   */
  getCellRangeByField(field: FieldDef<T>, index: number): CellRange | null {
    const { layoutMap } = this[_];
    const colObj = layoutMap.columnObjects.find(col => col.field === field);
    if (colObj) {
      const layoutRange = layoutMap.getBodyLayoutRangeById(colObj.id);
      const startRow = layoutMap.getRecordStartRowByRecordIndex(index);
      return {
        start: {
          col: layoutRange.start.col,
          row: startRow + layoutRange.start.row
        },
        end: {
          col: layoutRange.end.col,
          row: startRow + layoutRange.end.row
        }
      };
    }
    return null;
  }
  /**
   * Focus the cell.
   * @param  {*} field The field.
   * @param  {number} index The record index
   * @return {void}
   */
  focusGridCell(field: FieldDef<T>, index: number): void {
    const {
      start: { col: startCol, row: startRow },
      end: { col: endCol, row: endRow }
    } = this.selection.range;

    const newFocus = this.getCellRangeByField(field, index)?.start;
    if (newFocus == null) {
      return;
    }
    this.focusCell(newFocus.col, newFocus.row);
    this.selection.select = newFocus;
    this.invalidateGridRect(startCol, startRow, endCol, endRow);
    this.invalidateCell(newFocus.col, newFocus.row);
  }
  /**
   * Scroll to where cell is visible.
   * @param  {*} field The field.
   * @param  {number} index The record index
   * @return {void}
   */
  makeVisibleGridCell(field: FieldDef<T>, index: number): void {
    const cell = this.getCellRangeByField(field, index)?.start;
    this.makeVisibleCell(
      cell?.col ?? 0,
      cell?.row ?? this[_].layoutMap.headerRowCount
    );
  }
  getGridCanvasHelper(): GridCanvasHelper<T> {
    return this[_].gridCanvasHelper;
  }
  /**
   * Get cell range information for a given cell.
   * @param {number} col column index of the cell
   * @param {number} row row index of the cell
   * @returns {object} cell range info
   */
  getCellRange(col: number, row: number): CellRange {
    return _getCellRange(this, col, row);
  }
  /**
   * Get header range information for a given cell.
   * @param {number} col column index of the cell
   * @param {number} row row index of the cell
   * @returns {object} cell range info
   * @deprecated use `getCellRange` instead
   */
  getHeaderCellRange(col: number, row: number): CellRange {
    return this.getCellRange(col, row);
  }
  protected getCopyCellValue(
    col: number,
    row: number,
    range?: CellRange
  ): string {
    const cellRange = _getCellRange(this, col, row);
    const startCol = range
      ? Math.max(range.start.col, cellRange.start.col)
      : cellRange.start.col;
    const startRow = range
      ? Math.max(range.start.row, cellRange.start.row)
      : cellRange.start.row;
    if (startCol !== col || startRow !== row) {
      return "";
    }
    return _getCellValue(this, col, row);
  }
  protected onDrawCell(
    col: number,
    row: number,
    context: CellContext
  ): MaybePromise<void> {
    const { layoutMap } = this[_];

    let draw;
    let style;
    if (row < layoutMap.headerRowCount) {
      const hd = layoutMap.getHeader(col, row);
      draw = hd.headerType.onDrawCell;
      ({ style } = hd);
      _updateRect(this, col, row, context);
    } else {
      const column = layoutMap.getBody(col, row);
      draw = column.columnType.onDrawCell;
      ({ style } = column);
      _updateRect(this, col, row, context);
    }
    const cellValue = _getCellValue(this, col, row);
    return _onDrawValue(this, cellValue, context, { col, row }, style, draw);
  }
  doGetCellValue(
    col: number,
    row: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueCallback: (value: any) => void
  ): boolean {
    if (row < this[_].layoutMap.headerRowCount) {
      // nop
      return false;
    } else {
      const value = _getCellValue(this, col, row);
      if (isPromise(value)) {
        //遅延中は無視
        return false;
      }
      valueCallback(value);
    }
    return true;
  }
  doChangeValue(
    col: number,
    row: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeValueCallback: (before: any) => any
  ): MaybePromise<boolean> {
    if (row < this[_].layoutMap.headerRowCount) {
      // nop
      return false;
    } else {
      const record = this.getRowRecord(row);
      if (isPromise(record)) {
        //遅延中は無視
        return false;
      }
      const before = _getCellValue(this, col, row);
      if (isPromise(before)) {
        //遅延中は無視
        return false;
      }
      const after = changeValueCallback(before);
      if (after === undefined) {
        return false;
      }
      return then(_setCellValue(this, col, row, after), ret => {
        if (ret) {
          const { field } = this[_].layoutMap.getBody(col, row);
          this.fireListeners(LG_EVENT_TYPE.CHANGED_VALUE, {
            col,
            row,
            record: record as T,
            field: field as FieldDef<T>,
            value: after,
            oldValue: before
          });
        }
        return ret;
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHeaderValue(col: number, row: number): any | undefined {
    const field = this.getHeaderField(col, row);
    return this.headerValues.get(field);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setHeaderValue(col: number, row: number, newValue: any): void {
    const field = this.getHeaderField(col, row);

    const oldValue = this.headerValues.get(field);
    this.headerValues.set(field, newValue);

    this.fireListeners(LG_EVENT_TYPE.CHANGED_HEADER_VALUE, {
      col,
      row,
      field,
      value: newValue,
      oldValue
    });
  }
  getLayoutCellId(col: number, row: number): LayoutObjectId {
    return this[_].layoutMap.getCellId(col, row);
  }
  protected bindEventsInternal(): void {
    const grid: DrawGridAPI = this as DrawGridAPI;
    grid.listen(LG_EVENT_TYPE.SELECTED_CELL, (e: SelectedCellEvent) => {
      const range = _getCellRange(this, e.col, e.row);
      const {
        start: { col: startCol, row: startRow },
        end: { col: endCol, row: endRow }
      } = range;
      if (startCol !== endCol || startRow !== endRow) {
        this.invalidateCellRange(range);
      }
    });
    grid.listen(LG_EVENT_TYPE.PASTE_CELL, (e: PasteCellEvent) => {
      if (!this[_].allowRangePaste) {
        return;
      }
      const { start, end } = this.selection.range;
      if (!e.multi && cellEquals(start, end)) {
        return;
      }
      const { layoutMap } = this[_];

      if (start.row < layoutMap.headerRowCount) {
        return;
      }
      event.cancel(e.event);
      _onRangePaste.call<ListGrid<T>, [PasteCellEvent], void>(this, e);
    });
  }
  protected getMoveLeftColByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      start: { col: startCol }
    } = _getCellRange(this, col, row);
    col = startCol;
    return super.getMoveLeftColByKeyDownInternal({ col, row });
  }
  protected getMoveRightColByKeyDownInternal({
    col,
    row
  }: CellAddress): number {
    const {
      end: { col: endCol }
    } = _getCellRange(this, col, row);
    col = endCol;
    return super.getMoveRightColByKeyDownInternal({ col, row });
  }
  protected getMoveUpRowByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      start: { row: startRow }
    } = _getCellRange(this, col, row);
    row = startRow;
    return super.getMoveUpRowByKeyDownInternal({ col, row });
  }
  protected getMoveDownRowByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      end: { row: endRow }
    } = _getCellRange(this, col, row);
    row = endRow;
    return super.getMoveDownRowByKeyDownInternal({ col, row });
  }
  protected getOffsetInvalidateCells(): number {
    return 1;
  }
  protected getCopyRangeInternal(range: CellRange): CellRange {
    const { start } = this.getCellRange(range.start.col, range.start.row);
    const { end } = this.getCellRange(range.end.col, range.end.row);
    return { start, end };
  }
  fireListeners<TYPE extends keyof ListGridEventHandlersEventMap<T>>(
    type: TYPE,
    ...event: ListGridEventHandlersEventMap<T>[TYPE]
  ): ListGridEventHandlersReturnMap[TYPE][] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.fireListeners(type as any, ...event);
  }
}
