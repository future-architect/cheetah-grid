import * as columns from "./columns";
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
  EventListenerId,
  FieldData,
  FieldDef,
  HeaderValues,
  ListGridAPI,
  ListGridEventHandlersEventMap,
  ListGridEventHandlersReturnMap,
  MaybePromise,
  MaybePromiseOrUndef,
  Message,
  SortState,
  ThemeDefine
} from "./ts-types";
import {
  ColumnDefine,
  GroupHeaderDefine,
  HeaderDefine,
  HeadersDefine,
  LayoutMapAPI,
  SimpleHeaderMap
} from "./internal/layout-map";
import {
  DrawGrid,
  DrawGridConstructorOptions,
  DrawGridProtected
} from "./core/DrawGrid";
import { isDef, isPromise, obj, then } from "./internal/utils";
import { BaseColumn } from "./columns/type/BaseColumn";
import { BaseStyle } from "./columns/style";
import { DrawCellInfo } from "./ts-types-internal";
import { EVENT_TYPE } from "./list-grid/EVENT_TYPE";
import { GridCanvasHelper } from "./GridCanvasHelper";
import { BaseStyle as HeaderBaseStyle } from "./header/style";
import { MessageHandler } from "./columns/message/MessageHandler";
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
  return grid[_].headerMap.getCellRange(col, row);
}
function _updateRect<T>(
  grid: ListGrid<T>,
  col: number,
  row: number,
  context: CellContext
): void {
  const rect = context.getRect();
  const {
    start: { col: startCol, row: startRow },
    end: { col: endCol, row: endRow }
  } = _getCellRange(grid, col, row);
  for (let c = col - 1; c >= startCol; c--) {
    rect.left -= grid.getColWidth(c);
  }
  for (let c = col + 1; c <= endCol; c++) {
    rect.right += grid.getColWidth(c);
  }
  for (let r = row - 1; r >= startRow; r--) {
    rect.top -= grid.getRowHeight(r);
  }
  for (let r = row + 1; r <= endRow; r++) {
    rect.bottom += grid.getRowHeight(r);
  }
  context.setRect(rect);
}
function _getCellValue<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): FieldData {
  if (row < grid[_].headerMap.rowCount) {
    return grid[_].headerMap.getCell(col, row).caption;
  } else {
    const { field } = grid[_].headerMap.columns[col];
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
  if (row < grid[_].headerMap.rowCount) {
    // nop
    return false;
  } else {
    const { field } = grid[_].headerMap.columns[col];
    if (field == null) {
      return false;
    }
    const index = _getRowRecordIndex(grid, row);
    return grid[_].dataSource.setField(index, field, value);
  }
}
function _getCellMessage<T>(
  grid: ListGrid<T>,
  col: number,
  row: number
): FieldData {
  if (row < grid[_].headerMap.rowCount) {
    return null;
  } else {
    const { message } = grid[_].headerMap.columns[col];
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
  const { icon } = grid[_].headerMap.columns[col];
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
  if (row < grid[_].headerMap.rowCount) {
    return null;
  } else {
    const index = _getRowRecordIndex(grid, row);
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
  if (row < grid[_].headerMap.rowCount) {
    return false;
  } else {
    const index = _getRowRecordIndex(grid, row);
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

    if (context.row < grid[_].headerMap.rowCount) {
      _headerBorderWithState(grid, helper, context);
    } else {
      helper.borderWithState(context);
    }
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
function _headerBorderWithState<T>(
  grid: ListGrid<T>,
  helper: GridCanvasHelper<T>,
  context: CellContext
): void {
  const { col, row } = context;
  const sel = grid.selection.select;
  if (sel.row >= grid[_].headerMap.rowCount) {
    //通常の処理でまかなえる
    helper.borderWithState(context);
    return;
  }

  const id = grid[_].headerMap.getCellId(col, row);

  const rect = context.getRect();
  const option: { borderColor?: ColorsPropertyDefine; lineWidth?: number } = {};

  const selId = grid[_].headerMap.getCellId(sel.col, sel.row);
  //罫線
  if (selId === id) {
    option.borderColor = helper.theme.highlightBorderColor;
    option.lineWidth = 2;
    helper.border(context, option);
  } else {
    option.lineWidth = 1;
    // header color
    const isFrozenCell = grid.isFrozenCell(col, row);
    if (isFrozenCell && isFrozenCell.row) {
      option.borderColor = helper.theme.frozenRowsBorderColor;
    }
    helper.border(context, option);

    //追加処理
    if (col > 0 && grid[_].headerMap.getCellId(col - 1, row) === selId) {
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
    } else if (row > 0 && grid[_].headerMap.getCellId(col, row - 1) === selId) {
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
  grid[_].headerMap = new SimpleHeaderMap(grid[_].header);
  grid[_].headerMap.headerObjects.forEach(cell => {
    const ids = cell.headerType.bindGridEvent(grid, cell.range);
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
      const ids = cell.action.bindGridEvent(grid, cell.range);
      headerEvents.push(...ids);
    }
  });
  grid[_].headerMap.columns.forEach((col, index: number) => {
    if (col.action) {
      const ids = col.action.bindGridEvent(grid, index, {
        isTarget(col: number, row: number) {
          return index === col && grid.frozenRowCount <= row;
        }
      });
      headerEvents.push(...ids);
    }
    if (col.columnType) {
      const ids = col.columnType.bindGridEvent(grid, index, {
        isTarget(col: number, row: number) {
          return index === col && grid.frozenRowCount <= row;
        }
      });
      headerEvents.push(...ids);
    }
    if (col.style) {
      if (col.style instanceof BaseStyle) {
        const id = col.style.listen(
          columns.style.EVENT_TYPE.CHANGE_STYLE,
          () => {
            grid.invalidate();
          }
        );
        headerEvents.push(id);
      }
    }
  });
  for (let col = 0; col < grid[_].headerMap.columns.length; col++) {
    const column = grid[_].headerMap.columns[col];
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
  for (let row = 0; row < grid[_].headerMap.rowCount; row++) {
    const height = Array.isArray(headerRowHeight)
      ? headerRowHeight[row]
      : headerRowHeight;
    if (height && height > 0) {
      grid.setRowHeight(row, height);
    }
  }
  grid.colCount = grid[_].headerMap.columns.length;
  _refreshRowCount(grid);
  grid.frozenRowCount = grid[_].headerMap.rowCount;
}

function _refreshRowCount<T>(grid: ListGrid<T>): void {
  grid.rowCount = grid[_].dataSource.length + grid[_].headerMap.rowCount;
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
    grid[_].dataSource = CachedDataSource.ofArray(records);
  });
}
function _setDataSource<T>(grid: ListGrid<T>, dataSource: DataSource<T>): void {
  _tryWithUpdateDataSource(grid, () => {
    if (dataSource) {
      if (dataSource instanceof DataSource) {
        grid[_].dataSource = dataSource;
      } else {
        grid[_].dataSource = new CachedDataSource(dataSource);
      }
    } else {
      grid[_].dataSource = DataSource.EMPTY;
    }
    grid[_].records = null;
  });
}

function _getRowRecordIndex<T>(grid: ListGrid<T>, row: number): number {
  if (row < grid[_].headerMap.rowCount) {
    return -1;
  } else {
    return row - grid[_].headerMap.rowCount;
  }
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
export interface ListGridProtected<T> extends DrawGridProtected {
  dataSourceEventIds?: EventListenerId[];
  headerEvents?: EventListenerId[];
  headerMap: LayoutMapAPI<T>;
  headerValues?: HeaderValues;
  tooltipHandler: TooltipHandler<T>;
  messageHandler: MessageHandler<T>;
  theme: Theme | null;
  headerRowHeight: number[] | number;
  header: HeadersDefine<T>;
  gridCanvasHelper: GridCanvasHelper<T>;
  sortState: SortState;
  dataSource: DataSource<T>;
  records?: T[] | null;
}
export interface ListGridConstructorOptions<T>
  extends DrawGridConstructorOptions {
  header?: HeadersDefine<T>;
  headerRowHeight?: number[] | number;
  dataSource?: DataSource<T>;
  records?: T[];
  theme?: ThemeDefine | string;
}
export { HeadersDefine, ColumnDefine, HeaderDefine, GroupHeaderDefine };
/**
 * ListGrid
 * @classdesc cheetahGrid.ListGrid
 * @extends cheetahGrid.core.DrawGrid
 * @memberof cheetahGrid
 */
export class ListGrid<T> extends DrawGrid implements ListGridAPI<T> {
  [_]: ListGridProtected<T>;
  static get EVENT_TYPE(): typeof EVENT_TYPE {
    return EVENT_TYPE;
  }
  /**
   * constructor
   *
   * <pre>
   * Constructor options
   * -----
   * header: see header property
   * records {array}: records data
   * dataSource {DataSource}: records data source
   * frozenColCount {number}: default 0
   * defaultRowHeight {number}: default grid row height. default 40
   * defaultColWidth {number}: default grid col width. default 80
   * borderColor: border color
   * parentElement {Element}: canvas parentElement
   * theme {object}: theme
   * -----
   * </pre>
   *
   * @constructor
   * @param  {Object} options Constructor options
   */
  constructor(options: ListGridConstructorOptions<T> = {}) {
    super(adjustListGridOption(options));
    const protectedSpace = this[_];
    protectedSpace.header = options.header || [];
    protectedSpace.headerRowHeight = options.headerRowHeight || [];
    if (options.dataSource) {
      _setDataSource(this, options.dataSource);
    } else {
      _setRecords(this, options.records);
    }
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
   * @type {Array}
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
   *
   * @param {Array} header the define of the header to set
   * @type {Array}
   */
  set header(header) {
    this[_].header = header;
    _refreshHeader(this);
  }
  /**
   * Get the records.
   * @type {Array}
   */
  get records(): T[] | null {
    return this[_].records || null;
  }
  /**
   * Set the records from given
   * @param {Array} records records to set
   * @type {Array}
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
   * @type {DataSource}
   */
  get dataSource(): DataSource<T> {
    return this[_].dataSource;
  }
  /**
   * Set the data source from given
   * @param {DataSource} dataSource data source to set
   * @type {DataSource}
   */
  set dataSource(dataSource) {
    _setDataSource(this, dataSource);
    _refreshRowCount(this);
    this.invalidate();
  }
  /**
   * Get the theme.
   * @type {object}
   */
  get theme(): Theme | null {
    return this[_].theme;
  }
  /**
   * Set the theme from given
   * @param {object} theme theme to set
   * @type {object}
   */
  set theme(theme) {
    this[_].theme = themes.of(theme);
    this.invalidate();
  }
  /**
   * Get the font definition as a string.
   * @override
   * @type {string}
   */
  get font(): string {
    return super.font || this[_].gridCanvasHelper.theme.font;
  }
  /**
   * Set the font definition with the given string.
   * @override
   * @param {string} font the font definition to set
   * @type {string}
   */
  set font(font) {
    super.font = font;
  }
  /**
   * Get the background color of the underlay.
   * @override
   * @type {*}
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
   * @param {*} underlayBackgroundColor the background color of the underlay to set
   * @type {*}
   */
  set underlayBackgroundColor(underlayBackgroundColor) {
    super.underlayBackgroundColor = underlayBackgroundColor;
  }
  /**
   * Get the sort state.
   * @type {object}
   */
  get sortState(): SortState {
    return this[_].sortState;
  }
  /**
   * Sets the sort state.
   * If `null` to set, the sort state is initialized.
   *
   * @param {object} sortState the sort state to set
   * @type {object}
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
   * @type {object}
   */
  get headerValues(): HeaderValues {
    return this[_].headerValues || (this[_].headerValues = new Map());
  }
  /**
   * Sets the header values.
   *
   * @param {object} headerValues the header values to set
   * @type {object}
   */
  set headerValues(headerValues) {
    this[_].headerValues = headerValues || new Map();
  }
  /**
   * Get the field of the given column index.
   * @param  {number} col The column index.
   * @return {*} The field object.
   */
  getField(col: number): FieldDef<T> | undefined {
    return this[_].headerMap.columns[col].field;
  }
  /**
   * Get the column define of the given column index.
   * @param  {number} col The column index.
   * @return {*} The column define object.
   */
  getColumnDefine(col: number): ColumnDefine<T> {
    return this[_].headerMap.columns[col].define;
  }
  /**
   * Get the header field of the given header cell.
   * @param  {number} col The column index.
   * @param  {number} row The header row index.
   * @return {*} The field object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHeaderField(col: number, row: number): any | undefined {
    const hd = this[_].headerMap.getCell(col, row);
    return hd.field;
  }
  /**
   * Get the header define of the given header cell.
   * @param  {number} col The column index.
   * @param  {number} row The header row index.
   * @return {*} The header define object.
   */
  getHeaderDefine(col: number, row: number): HeaderDefine<T> {
    const hd = this[_].headerMap.getCell(col, row);
    return hd.define;
  }
  /**
   * Get the record of the given row index.
   * @param  {number} row The row index.
   * @return {object} The record.
   */
  getRowRecord(row: number): MaybePromiseOrUndef<T> {
    if (row < this[_].headerMap.rowCount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined;
    } else {
      return this[_].dataSource.get(_getRowRecordIndex(this, row));
    }
  }
  /**
   * Get the column index of the given field.
   * @param  {*} field The field.
   * @return {number} The column index.
   */
  getColumnIndexByField(field: FieldDef<T>): number | null {
    for (const columnIndex in this[_].headerMap.columns) {
      if (this[_].headerMap.columns[columnIndex].field === field) {
        return Number(columnIndex) - 0;
      }
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

    const newCol = this.getColumnIndexByField(field);
    if (newCol == null) {
      return;
    }
    const newRow = index + this[_].headerMap.rowCount;
    this.focusCell(newCol, newRow);
    this.selection.select = {
      col: newCol,
      row: newRow
    };
    this.invalidateGridRect(startCol, startRow, endCol, endRow);
    this.invalidateCell(newCol, newRow);
  }
  /**
   * Scroll to where cell is visible.
   * @param  {*} field The field.
   * @param  {number} index The record index
   * @return {void}
   */
  makeVisibleGridCell(field: FieldDef<T>, index: number): void {
    this.makeVisibleCell(
      this.getColumnIndexByField(field) || 0,
      index + this[_].headerMap.rowCount
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
  getCopyCellValue(col: number, row: number): string {
    const {
      start: { col: startCol, row: startRow }
    } = _getCellRange(this, col, row);
    if (startCol !== col || startRow !== row) {
      return "";
    }
    return _getCellValue(this, col, row);
  }
  onDrawCell(
    col: number,
    row: number,
    context: CellContext
  ): MaybePromise<void> {
    const { headerMap } = this[_];
    const column = headerMap.columns[col];

    let draw;
    let style;
    if (row < headerMap.rowCount) {
      const hd = headerMap.getCell(col, row);
      draw = hd.headerType.onDrawCell;
      ({ style } = hd);
      _updateRect(this, col, row, context);
    } else {
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
    if (row < this[_].headerMap.rowCount) {
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
    if (row < this[_].headerMap.rowCount) {
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
          const { field } = this[_].headerMap.columns[col];
          this.fireListeners(EVENT_TYPE.CHANGED_VALUE, {
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

    this.fireListeners(EVENT_TYPE.CHANGED_HEADER_VALUE, {
      col,
      row,
      field,
      value: newValue,
      oldValue
    });
  }
  bindEventsInternal(): void {
    this.listen(EVENT_TYPE.SELECTED_CELL, e => {
      const {
        start: { col: startCol, row: startRow },
        end: { col: endCol, row: endRow }
      } = _getCellRange(this, e.col, e.row);
      if (startCol !== endCol || startRow !== endRow) {
        this.invalidateGridRect(startCol, startRow, endCol, endRow);
      }
    });
  }
  getMoveLeftColByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      start: { col: startCol }
    } = _getCellRange(this, col, row);
    col = startCol;
    return super.getMoveLeftColByKeyDownInternal({ col, row });
  }
  getMoveRightColByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      end: { col: endCol }
    } = _getCellRange(this, col, row);
    col = endCol;
    return super.getMoveRightColByKeyDownInternal({ col, row });
  }
  getMoveUpRowByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      start: { row: startRow }
    } = _getCellRange(this, col, row);
    row = startRow;
    return super.getMoveUpRowByKeyDownInternal({ col, row });
  }
  getMoveDownRowByKeyDownInternal({ col, row }: CellAddress): number {
    const {
      end: { row: endRow }
    } = _getCellRange(this, col, row);
    row = endRow;
    return super.getMoveDownRowByKeyDownInternal({ col, row });
  }
  getOffsetInvalidateCells(): number {
    return 1;
  }
  fireListeners<TYPE extends keyof ListGridEventHandlersEventMap<T>>(
    type: TYPE,
    ...event: ListGridEventHandlersEventMap<T>[TYPE]
  ): ListGridEventHandlersReturnMap[TYPE][] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.fireListeners(type as any, ...event);
  }
}
