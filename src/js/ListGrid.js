'use strict';
{
	const {extend, array: {isArray, find: arrayFind}, isDef, isPromise, obj: {isObject}} = require('./internal/utils');
	const GridCanvasHelper = require('./GridCanvasHelper');
	const columns = require('./columns');
	const {BaseStyle} = columns.style;
	const headerType = require('./header/type');
	const {BaseStyle: HeaderBaseStyle} = require('./header/style');
	const DrawGrid = require('./core/DrawGrid');
	const {DataSource, CachedDataSource} = require('./data');
	const themes = require('./themes');
	const icons = require('./internal/icons');
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
			if (grid.hasListeners(EVENT_TYPE.SET_VALUE)) {
				const ret = grid.fireListeners(EVENT_TYPE.SET_VALUE, grid.getRowRecord(row), field, value);
				grid[_].dataSource.clearCache();
				return arrayFind(ret, isDef);
			} else {
				const index = _getRowRecordIndex(grid, row);
				const res = grid[_].dataSource.setField(index, field, value);
				return isPromise(res) ? res : true;
			}
		}
	}
	function _getCellIcon0(grid, icon, row) {
		if (!isDef(icon)) {
			return null;
		}
		if (isArray(icon)) {
			return icon.map((i) => _getCellIcon0(grid, i, row, name));
		}
		if (!isObject(icon)) {
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
	function _getCellIcon(grid, col, row, name) {
		const {[name]: icon} = grid[_].headerMap.columns[col];
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

		const drawCellBase = ({bgColor} = {}) => {
			const fillOpt = {
				fillColor: bgColor,
			};
			//cell全体を描画
			helper.fillCellWithState(context, fillOpt);

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
		const info = {
			getRecord: () => grid.getRowRecord(row),
			getIcon: () => _getCellIcon(grid, col, row, 'icon'),
			style,
			drawCellBase,
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
			option.borderColor = helper.theme.hiliteBorderColor;
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
							helper.getColor(helper.theme.hiliteBorderColor, sel.col, sel.row, ctx)
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
							helper.getColor(helper.theme.hiliteBorderColor, sel.col, sel.row, ctx)
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
			const ids = cell.headerType.bindGridEvent(grid);
			grid[_].headerEvents.push(...ids);
			if (cell.style) {
				if (cell.style instanceof HeaderBaseStyle) {
					const id = cell.style.listen(HeaderBaseStyle.EVENT_TYPE.CHANGE_STYLE, () => {
						grid.invalidate();
					});
					grid[_].headerEvents.push(id);
				}
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
		grid.colCount = grid[_].headerMap.columns.length;
		_refreshRowCount(grid);
		grid.frozenRowCount = grid[_].headerMap.rowCount;
		for (let col = 0; col < grid[_].headerMap.columns.length; col++) {
			const column = grid[_].headerMap.columns[col];
			const width = column.width;
			if (width && (width > 0 || typeof width === 'string')) {
				grid.setColWidth(col, width);
			}
			const minWidth = column.minWidth;
			if (minWidth && (minWidth > 0 || typeof minWidth === 'string')) {
				grid.setMinColWidth(col, minWidth);
			}
			const maxWidth = column.maxWidth;
			if (maxWidth && (maxWidth > 0 || typeof maxWidth === 'string')) {
				grid.setMaxColWidth(col, maxWidth);
			}
		}
		const isArrayHeaderRowHeight = isArray(grid[_].headerRowHeight);
		for (let row = 0; row < grid[_].headerMap.rowCount; row++) {
			const height = isArrayHeaderRowHeight ? grid[_].headerRowHeight[row] : grid[_].headerRowHeight;
			if (height && height > 0) {
				grid.setRowHeight(row, height);
			}
		}
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
			this._setupHeaderType();
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
					style: hd.headerStyle,
					sort: hd.sort,
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
						width: hd.width,
						minWidth: hd.minWidth,
						maxWidth: hd.maxWidth,
						field: hd.field,
						icon: hd.icon,
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
		_setupHeaderType() {
			this._headerObjects.forEach((cell) => {
				cell.range = this.getHeaderCellRangeById(cell.id);
				cell.headerType = headerType.create(cell);
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
	
	const EVENT_TYPE = extend(DrawGrid.EVENT_TYPE, {
		SET_VALUE: 'set_value',
	});

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
			this[_].header = options.header || [];
			this[_].headerRowHeight = options.headerRowHeight || [];
			if (options.dataSource) {
				_setDataSource(this, options.dataSource);
			} else {
				_setRecords(this, options.records);
			}
			_refreshHeader(this);
			this[_].sortState = {
				col: -1,
				order: undefined,
			};
			this[_].gridCanvasHelper = new GridCanvasHelper(this);
			this[_].theme = themes.of(options.theme);
			this.invalidate();
			this[_].handler.on(window, 'resize', () => {
				this.updateSize();
				this.updateScroll();
				this.invalidate();
			});
		}
		/**
		 * header define
		 * @type {Array}
		 */
		get header() {
			return this[_].header;
		}
		/**
		 * header define
		 * <pre>
		 * column options
		 * -----
		 * caption: header caption
		 * field: field name
		 * width: column width
		 * columnType: ColumnType
		 * action: ColumnAction
		 * style
		 * -----
		 *
		 * multiline header
		 * -----
		 * caption: header caption
		 * columns: columns define
		 * -----
		 * </pre>
		 *
		 * @type {Array}
		 */
		set header(header) {
			this[_].header = header;
			_refreshHeader(this);
		}
		get records() {
			return this[_].records;
		}
		set records(records) {
			_setRecords(this, records);
			_refreshRowCount(this);
			this.invalidate();
		}
		get dataSource() {
			return this[_].dataSource;
		}
		set dataSource(dataSource) {
			_setDataSource(this, dataSource);
			_refreshRowCount(this);
			this.invalidate();
		}
		get theme() {
			return this[_].theme;
		}
		set theme(theme) {
			this[_].theme = themes.of(theme);
			this.invalidate();
		}
		get font() {
			return super.font || this[_].gridCanvasHelper.theme.font;
		}
		set font(font) {
			super.font = font;
		}
		get underlayBackgroundColor() {
			return super.underlayBackgroundColor || this[_].gridCanvasHelper.theme.underlayBackgroundColor;
		}
		set underlayBackgroundColor(underlayBackgroundColor) {
			super.underlayBackgroundColor = underlayBackgroundColor;
		}
		get sortState() {
			return this[_].sortState;
		}
		set sortState(sortState) {
			this[_].sortState = sortState;
		}
		getField(col) {
			return this[_].headerMap.columns[col].field;
		}
		getRowRecord(row) {
			if (row < this[_].headerMap.rowCount) {
				return undefined;
			} else {
				return this[_].dataSource.get(_getRowRecordIndex(this, row));
			}
		}
		getGridCanvasHelper() {
			return this[_].gridCanvasHelper;
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
			const column = this[_].headerMap.columns[col];

			let draw;
			let style;
			if (row < this[_].headerMap.rowCount) {
				const hd = this[_].headerMap.getCell(col, row);
				draw = hd.headerType.onDrawCell;
				style = hd.style;
				_updateRect(this, col, row, context);
			} else {
				draw = column.columnType.onDrawCell;
				style = column.style;
			}
			const cellValue = _getCellValue(this, col, row);
			return _onDrawValue(this, cellValue, context, {col, row}, style, draw);
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
				return _setCellValue(this, col, row, after);
			}
		}
		bindEventsInternal() {
			this.listen(EVENT_TYPE.SELECTED_CELL, (cell, selected) => {
				if (cell.row < this[_].headerMap.rowCount) {
					const {startCol, endCol, startRow, endRow} = _getHeaderCellRange(this, cell.col, cell.row);
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
		getColumnIndexByField(field) {
			for (const columnIndex in this[_].headerMap.columns) {
				if (this[_].headerMap.columns[columnIndex].field === field) {
					return columnIndex - 0;
				}
			}
			return null;
		}
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
		makeVisibleGridCell(field, index) {
			this.makeVisibleCell(this.getColumnIndexByField(field), index + this[_].headerMap.rowCount);
		}
	}
	module.exports = ListGrid;
}