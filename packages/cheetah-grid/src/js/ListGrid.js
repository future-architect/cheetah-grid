'use strict';

const {isDef, isPromise, then, obj: {isObject}} = require('./internal/utils');
const GridCanvasHelper = require('./GridCanvasHelper');
const columns = require('./columns');
const {BaseStyle} = columns.style;
const headerType = require('./header/type');
const headerAction = require('./header/action');
const {BaseStyle: HeaderBaseStyle} = require('./header/style');
const DrawGrid = require('./core/DrawGrid');
const {DataSource, CachedDataSource} = require('./data');
const themes = require('./themes');
const icons = require('./internal/icons');
const MessageHandler = require('./columns/message/MessageHandler');
const TooltipHandler = require('./tooltip/TooltipHandler');
const EVENT_TYPE = require('./list-grid/EVENT_TYPE');

//protected symbol
const {PROTECTED_SYMBOL: _} = require('./internal/symbolManager');

let headerId = 0;
//private methods
function _getHeaderCellRange(grid, col, row) {
	return grid[_].headerMap.getHeaderCellRange(col, row);
}
function _updateRect(grid, col, row, context) {
	const rect = context.getRect();
	const {
		startCol,
		endCol,
		startRow,
		endRow,
	} = _getHeaderCellRange(grid, col, row);
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
function _getCellValue(grid, col, row) {
	if (row < grid[_].headerMap.rowCount) {
		return grid[_].headerMap.getCell(col, row).caption;
	} else {
		let {field} = grid[_].headerMap.columns[col];
		if (isObject(field) && field.get && field.set) {
			field = field.get;
		}
		return _getField(grid, field, row);
	}
}
function _setCellValue(grid, col, row, value) {
	if (row < grid[_].headerMap.rowCount) {
		// nop
		return false;
	} else {
		let {field} = grid[_].headerMap.columns[col];
		if (isObject(field) && field.get && field.set) {
			field = field.set;
		}
		const index = _getRowRecordIndex(grid, row);
		const res = grid[_].dataSource.setField(index, field, value);
		return isPromise(res) ? res : true;
	}
}
function _getCellMessage(grid, col, row) {
	if (row < grid[_].headerMap.rowCount) {
		return null;
	} else {
		const {message} = grid[_].headerMap.columns[col];
		if (!message) {
			return null;
		}
		return _getField(grid, message, row);
	}
}
function _getCellIcon0(grid, icon, row) {
	if (!isDef(icon)) {
		return null;
	}
	if (Array.isArray(icon)) {
		return icon.map((i) => _getCellIcon0(grid, i, row));
	}
	if (!isObject(icon) || typeof icon === 'function') {
		return _getField(grid, icon, row);
	}
	const retIcon = {};
	icons.iconPropKeys.forEach((k) => {
		if (icon[k]) {
			const f = _getField(grid, icon[k], row);
			if (isDef(f)) {
				retIcon[k] = f;
			} else {
				if (!_hasField(grid, icon[k], row)) {
					retIcon[k] = icon[k];
				}
			}
		}
	});
	return retIcon;
}
function _getCellIcon(grid, col, row) {
	const {icon} = grid[_].headerMap.columns[col];
	return _getCellIcon0(grid, icon, row);
}
function _getField(grid, field, row) {
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
function _hasField(grid, field, row) {
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
function _onDrawValue(grid, cellValue, context, {col, row}, style, draw) {
	const helper = grid[_].gridCanvasHelper;

	const drawCellBg = ({bgColor} = {}) => {
		const fillOpt = {
			fillColor: bgColor,
		};
			//cell全体を描画
		helper.fillCellWithState(context, fillOpt);
	};
	const drawCellBorder = () => {

		if (context.col === grid.frozenColCount - 1) {
			//固定列罫線
			const rect = context.getRect();
			helper.drawWithClip(context, (ctx) => {
				const borderColor = context.row >= grid.frozenRowCount ? helper.theme.borderColor
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


	const drawCellBase = ({bgColor} = {}) => {
		drawCellBg({bgColor});
		drawCellBorder();
	};
	const info = {
		getRecord: () => grid.getRowRecord(row),
		getIcon: () => _getCellIcon(grid, col, row),
		getMessage: () => _getCellMessage(grid, col, row),
		messageHandler: grid[_].messageHandler,
		style,
		drawCellBase,
		drawCellBg,
		drawCellBorder,
	};

	return draw(cellValue, info, context, grid);
}
function _headerBorderWithState(grid, helper, context) {
	const {col, row} = context;
	const sel = grid.selection.select;
	if (sel.row >= grid[_].headerMap.rowCount) {
		//通常の処理でまかなえる
		helper.borderWithState(context);
		return;
	}

	const {id} = grid[_].headerMap.getCell(col, row);

	const rect = context.getRect();
	const option = {};

	const {id: selId} = grid[_].headerMap.getCell(sel.col, sel.row);
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
		if (col > 0 && grid[_].headerMap.getCell(col - 1, row).id === selId) {
			//右が選択されている
			helper.drawBorderWithClip(context, (ctx) => {
				const borderColors = helper.toBoxArray(
						helper.getColor(helper.theme.highlightBorderColor, sel.col, sel.row, ctx)
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
		} else if (row > 0 &&
						grid[_].headerMap.getCell(col, row - 1).id === selId) {
			//上が選択されている
			helper.drawBorderWithClip(context, (ctx) => {
				const borderColors = helper.toBoxArray(
						helper.getColor(helper.theme.highlightBorderColor, sel.col, sel.row, ctx)
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
function _refreshHeader(grid) {
	if (grid[_].headerEvents) {
		grid[_].headerEvents.forEach((id) => grid.unlisten(id));
	}
	grid[_].headerMap = new HeaderMap(grid[_].header);
	grid[_].headerEvents = [];
	grid[_].headerMap.headerObjects.forEach((cell) => {
		const ids = cell.headerType.bindGridEvent(grid, cell.range);
		grid[_].headerEvents.push(...ids);
		if (cell.style) {
			if (cell.style instanceof HeaderBaseStyle) {
				const id = cell.style.listen(HeaderBaseStyle.EVENT_TYPE.CHANGE_STYLE, () => {
					grid.invalidate();
				});
				grid[_].headerEvents.push(id);
			}
		}
		if (cell.action) {
			const ids = cell.action.bindGridEvent(grid, cell.range);
			grid[_].headerEvents.push(...ids);
		}
	});
	grid[_].headerMap.columns.forEach((col, index) => {
		if (col.action) {
			const ids = col.action.bindGridEvent(grid, index, {
				isTarget(col, row) {
					return index === col && grid.frozenRowCount <= row;
				},
			});
			grid[_].headerEvents.push(...ids);
		}
		if (col.columnType) {
			const ids = col.columnType.bindGridEvent(grid, index, {
				isTarget(col, row) {
					return index === col && grid.frozenRowCount <= row;
				},
			});
			grid[_].headerEvents.push(...ids);
		}
		if (col.style) {
			if (col.style instanceof BaseStyle) {
				const id = col.style.listen(columns.style.EVENT_TYPE.CHANGE_STYLE, () => {
					grid.invalidate();
				});
				grid[_].headerEvents.push(id);
			}
		}
	});
	for (let col = 0; col < grid[_].headerMap.columns.length; col++) {
		const column = grid[_].headerMap.columns[col];
		const {width, minWidth, maxWidth} = column;
		if (width && (width > 0 || typeof width === 'string')) {
			grid.setColWidth(col, width);
		}
		if (minWidth && (minWidth > 0 || typeof minWidth === 'string')) {
			grid.setMinColWidth(col, minWidth);
		}
		if (maxWidth && (maxWidth > 0 || typeof maxWidth === 'string')) {
			grid.setMaxColWidth(col, maxWidth);
		}
	}
	const isArrayHeaderRowHeight = Array.isArray(grid[_].headerRowHeight);
	for (let row = 0; row < grid[_].headerMap.rowCount; row++) {
		const height = isArrayHeaderRowHeight ? grid[_].headerRowHeight[row] : grid[_].headerRowHeight;
		if (height && height > 0) {
			grid.setRowHeight(row, height);
		}
	}
	grid.colCount = grid[_].headerMap.columns.length;
	_refreshRowCount(grid);
	grid.frozenRowCount = grid[_].headerMap.rowCount;
}

function _refreshRowCount(grid) {
	grid.rowCount = grid[_].dataSource.length + grid[_].headerMap.rowCount;
}
function _tryWithUpdateDataSource(grid, fn) {
	if (grid[_].dataSourceEventIds) {
		grid[_].dataSourceEventIds.forEach((id) => grid[_].handler.off(id));
	}

	fn(grid);

	grid[_].dataSourceEventIds = [
		grid[_].handler.on(grid[_].dataSource, DataSource.EVENT_TYPE.UPDATED_LENGTH, () => {
			_refreshRowCount(grid);
			grid.invalidate();
		}),
		grid[_].handler.on(grid[_].dataSource, DataSource.EVENT_TYPE.UPDATED_ORDER, () => {
			grid.invalidate();
		}),
	];
}
function _setRecords(grid, records = []) {
	_tryWithUpdateDataSource(grid, () => {
		grid[_].records = records;
		grid[_].dataSource = CachedDataSource.ofArray(grid[_].records);
	});
}
function _setDataSource(grid, dataSource) {
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

function _getRowRecordIndex(grid, row) {
	if (row < grid[_].headerMap.rowCount) {
		return undefined;
	} else {
		return row - grid[_].headerMap.rowCount;
	}
}
//end private methods
//
//
//

class HeaderMap {
	constructor(header) {
		this._columns = [];
		this._headerCells = [];
		this._headerObjects = [];

		this._addHeaders(0, header, []);
		this._setupHeaderControllers();
	}
	get columns() {
		return this._columns;
	}
	get rowCount() {
		return this._headerCells.length;
	}
	get headerObjects() {
		return this._headerObjects;
	}
	getCell(col, row) {
		return this._headerCells[row][col];
	}
	getHeaderCellRangeById(id) {
		for (let r = 0; r < this.rowCount; r++) {
			for (let c = 0; c < this.columns.length; c++) {
				if (id === this.getCell(c, r).id) {
					return this.getHeaderCellRange(c, r);
				}
			}
		}
		return undefined;
	}
	getHeaderCellRange(col, row) {
		const result = {
			startCol: col,
			startRow: row,
			endCol: col,
			endRow: row,
			isCellInRange(col, row) {
				return this.startCol <= col && col <= this.endCol &&
							this.startRow <= row && row <= this.endRow;
			}
		};
		const {id} = this.getCell(col, row);
		for (let c = col - 1; c >= 0; c--) {
			if (id !== this.getCell(c, row).id) {
				break;
			}
			result.startCol = c;
		}
		for (let c = col + 1; c < this.columns.length; c++) {
			if (id !== this.getCell(c, row).id) {
				break;
			}
			result.endCol = c;
		}
		for (let r = row - 1; r >= 0; r--) {
			if (id !== this.getCell(col, r).id) {
				break;
			}
			result.startRow = r;
		}
		for (let r = row + 1; r < this.rowCount; r++) {
			if (id !== this.getCell(col, r).id) {
				break;
			}
			result.endRow = r;
		}
		return result;
	}
	_addHeaders(row, header, roots) {
		const rowCells = this._headerCells[row] || this._newRow(row);
		header.forEach((hd) => {
			const col = this._columns.length;
			const cell = {
				id: headerId++,
				caption: hd.caption,
				field: hd.headerField || hd.field,
				style: hd.headerStyle,
				headerType: hd.headerType,
				action: hd.headerAction,
				sort: hd.sort,
				define: hd,
			};
			this._headerObjects.push(cell);
			rowCells[col] = cell;
			for (let r = row - 1; r >= 0; r--) {
				this._headerCells[r][col] = roots[r];
			}
			if (hd.columns) {
				this._addHeaders(row + 1, hd.columns, [...roots, cell]);
			} else {
				this._columns.push({
					field: hd.field,
					width: hd.width,
					minWidth: hd.minWidth,
					maxWidth: hd.maxWidth,
					icon: hd.icon,
					message: hd.message,
					columnType: columns.type.of(hd.columnType),
					action: columns.action.of(hd.action),
					style: hd.style,
					define: hd,
				});
				for (let r = row + 1; r < this._headerCells.length; r++) {
					this._headerCells[r][col] = cell;
				}
			}
		});
	}
	_setupHeaderControllers() {
		this._headerObjects.forEach((cell) => {
			cell.range = this.getHeaderCellRangeById(cell.id);
			cell.headerType = headerType.ofCell(cell);
			cell.action = headerAction.ofCell(cell);
		});
	}
	_newRow(row) {
		const newRow = this._headerCells[row] = [];
		if (!this._columns.length) {
			return newRow;
		}
		const prev = this._headerCells[row - 1];
		for (let col = 0; col < prev.length; col++) {
			newRow[col] = prev[col];
		}
		return newRow;
	}
}

function adjustListGridOption(options) {
	if (options) {
		delete options.frozenRowCount;
		delete options.colCount;
		delete options.rowCount;
	}
	return options;
}

/**
 * ListGrid
 * @classdesc cheetahGrid.ListGrid
 * @extends cheetahGrid.core.DrawGrid
 * @memberof cheetahGrid
 */
class ListGrid extends DrawGrid {
	static get EVENT_TYPE() {
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
	constructor(options = {}) {
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
			order: undefined,
		};
		protectedSpace.gridCanvasHelper = new GridCanvasHelper(this);
		protectedSpace.theme = themes.of(options.theme);
		protectedSpace.messageHandler = new MessageHandler(this, (col, row) => _getCellMessage(this, col, row));
		protectedSpace.tooltipHandler = new TooltipHandler(this);
		this.invalidate();
		protectedSpace.handler.on(window, 'resize', () => {
			this.updateSize();
			this.updateScroll();
			this.invalidate();
		});
	}
	/**
	 * Dispose the grid instance.
	 * @returns {void}
	 */
	dispose() {
		const protectedSpace = this[_];
		protectedSpace.messageHandler.dispose();
		protectedSpace.tooltipHandler.dispose();
		super.dispose();
	}
	/**
	 * Gets the define of the header.
	 * @type {Array}
	 */
	get header() {
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
	get records() {
		return this[_].records;
	}
	/**
	 * Set the records from given
	 * @param {Array} records records to set
	 * @type {Array}
	 */
	set records(records) {
		_setRecords(this, records);
		_refreshRowCount(this);
		this.invalidate();
	}
	/**
	 * Get the data source.
	 * @type {DataSource}
	 */
	get dataSource() {
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
	get theme() {
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
	get font() {
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
	get underlayBackgroundColor() {
		return super.underlayBackgroundColor || this[_].gridCanvasHelper.theme.underlayBackgroundColor;
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
	get sortState() {
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

		const newState = this[_].sortState = isDef(sortState) ? sortState : {
			col: -1,
			row: -1,
			order: undefined,
		};

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
	get headerValues() {
		return this[_].headerValues || (this[_].headerValues = {});
	}
	/**
	 * Sets the header values.
	 *
	 * @param {object} headerValues the header values to set
	 * @type {object}
	 */
	set headerValues(headerValues) {
		this[_].headerValues = headerValues || {};
	}
	/**
	 * Get the field of the given column index.
	 * @param  {number} col The column index.
	 * @return {*} The field object.
	 */
	getField(col) {
		return this[_].headerMap.columns[col].field;
	}
	/**
	 * Get the column define of the given column index.
	 * @param  {number} col The column index.
	 * @return {*} The column define object.
	 */
	getColumnDefine(col) {
		return this[_].headerMap.columns[col].define;
	}
	/**
	 * Get the header field of the given header cell.
	 * @param  {number} col The column index.
	 * @param  {number} row The header row index.
	 * @return {*} The field object.
	 */
	getHeaderField(col, row) {
		const hd = this[_].headerMap.getCell(col, row);
		return hd.field;
	}
	/**
	 * Get the header define of the given header cell.
	 * @param  {number} col The column index.
	 * @param  {number} row The header row index.
	 * @return {*} The header define object.
	 */
	getHeaderDefine(col, row) {
		const hd = this[_].headerMap.getCell(col, row);
		return hd.define;
	}
	/**
	 * Get the record of the given row index.
	 * @param  {number} row The row index.
	 * @return {object} The record.
	 */
	getRowRecord(row) {
		if (row < this[_].headerMap.rowCount) {
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
	getColumnIndexByField(field) {
		for (const columnIndex in this[_].headerMap.columns) {
			if (this[_].headerMap.columns[columnIndex].field === field) {
				return columnIndex - 0;
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
	focusGridCell(field, index) {
		const {
			start: {col: startCol, row: startRow},
			end: {col: endCol, row: endRow}
		} = this.selection.range;

		const newCol = this.getColumnIndexByField(field);
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
	makeVisibleGridCell(field, index) {
		this.makeVisibleCell(this.getColumnIndexByField(field), index + this[_].headerMap.rowCount);
	}
	getGridCanvasHelper() {
		return this[_].gridCanvasHelper;
	}
	/**
	 * Get header range information for a given cell.
	 * @param {number} col column index of the cell
	 * @param {number} row row index of the cell
	 * @returns {object} cell range info
	 */
	getHeaderCellRange(col, row) {
		return _getHeaderCellRange(this, col, row);
	}
	getCopyCellValue(col, row) {
		if (row < this[_].headerMap.rowCount) {
			const {startCol, startRow} = _getHeaderCellRange(this, col, row);
			if (startCol !== col || startRow !== row) {
				return '';
			}
		}
		return _getCellValue(this, col, row);
	}
	onDrawCell(col, row, context) {
		const {headerMap} = this[_];
		const column = headerMap.columns[col];

		let draw;
		let style;
		if (row < headerMap.rowCount) {
			const hd = headerMap.getCell(col, row);
			draw = hd.headerType.onDrawCell;
			({style} = hd);
			_updateRect(this, col, row, context);
		} else {
			draw = column.columnType.onDrawCell;
			({style} = column);
		}
		const cellValue = _getCellValue(this, col, row);
		return _onDrawValue(this, cellValue, context, {col, row}, style, draw);
	}
	doGetCellValue(col, row, valueCallback) {
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
	doChangeValue(col, row, changeValueCallback) {
		if (row < this[_].headerMap.rowCount) {
			// nop
			return false;
		} else {
			const before = _getCellValue(this, col, row);
			if (isPromise(before)) {
				//遅延中は無視
				return false;
			}
			const after = changeValueCallback(before);
			if (after === undefined) {
				return false;
			}
			return then(_setCellValue(this, col, row, after), (ret) => {
				if (ret) {
					const {field} = this[_].headerMap.columns[col];
					const self = this;
					this.fireListeners(EVENT_TYPE.CHANGED_VALUE, {
						col,
						row,
						get record() {
							return self.getRowRecord(row);
						},
						field,
						value: after,
						oldValue: before,
					});
				}
				return ret;
			});
		}
	}
	getHeaderValue(col, row) {
		const field = this.getHeaderField(col, row);
		return this.headerValues[field];
	}
	setHeaderValue(col, row, newValue) {
		const field = this.getHeaderField(col, row);

		const oldValue = this.headerValues[field];
		this.headerValues[field] = newValue;

		this.fireListeners(EVENT_TYPE.CHANGED_HEADER_VALUE, {
			col,
			row,
			field,
			value: newValue,
			oldValue,
		});
	}
	bindEventsInternal() {
		this.listen(EVENT_TYPE.SELECTED_CELL, (e) => {
			if (e.row < this[_].headerMap.rowCount) {
				const {startCol, endCol, startRow, endRow} = _getHeaderCellRange(this, e.col, e.row);
				if (startCol !== endCol || startRow !== endRow) {
					this.invalidateGridRect(startCol, startRow, endCol, endRow);
				}
			}
		});
	}
	getMoveLeftColByKeyDownInternal({col, row}) {
		if (row < this[_].headerMap.rowCount) {
			const {startCol} = _getHeaderCellRange(this, col, row);
			col = startCol;
		}
		return super.getMoveLeftColByKeyDownInternal({col, row});
	}
	getMoveRightColByKeyDownInternal({col, row}) {
		if (row < this[_].headerMap.rowCount) {
			const {endCol} = _getHeaderCellRange(this, col, row);
			col = endCol;
		}
		return super.getMoveRightColByKeyDownInternal({col, row});
	}
	getMoveUpRowByKeyDownInternal({col, row}) {
		if (row < this[_].headerMap.rowCount) {
			const {startRow} = _getHeaderCellRange(this, col, row);
			row = startRow;
		}
		return super.getMoveUpRowByKeyDownInternal({col, row});
	}
	getMoveDownRowByKeyDownInternal({col, row}) {
		if (row < this[_].headerMap.rowCount) {
			const {endRow} = _getHeaderCellRange(this, col, row);
			row = endRow;
		}
		return super.getMoveDownRowByKeyDownInternal({col, row});
	}
	getOffsetInvalidateCells() {
		return 1;
	}
}
module.exports = ListGrid;
