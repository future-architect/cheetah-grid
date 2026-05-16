/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const ListGrid = cheetahGrid.ListGrid;
	const DataSource = cheetahGrid.data.DataSource;
	const EVENT_TYPE = ListGrid.EVENT_TYPE;

	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}

	function createParent() {
		const parent = document.createElement('div');
		parent.style.width = '360px';
		parent.style.height = '200px';
		mainEl.appendChild(parent);
		return parent;
	}

	function createColumnType(calls) {
		return {
			bindGridEvent: function(_grid, id) {
				calls.push(['bindColumnType', id]);
				return [];
			},
			getCopyCellValue: function(value) {
				return `copy:${value == null ? '' : value}`;
			},
			onDrawCell: function(value, info, context) {
				calls.push([
					'drawColumn',
					value,
					info.getRecord(),
					info.getIcon(),
					info.getMessage(),
					info.style,
					context.getRect().width,
				]);
			},
		};
	}

	function createHeaderType(calls) {
		return {
			bindGridEvent: function(_grid, id) {
				calls.push(['bindHeaderType', id]);
				return [];
			},
			getCopyCellValue: function(value) {
				return `header:${value == null ? '' : value}`;
			},
			onDrawCell: function(value, info, context) {
				calls.push(['drawHeader', value, info.getIcon(), info.style, context.getRect().width]);
			},
		};
	}

	function createHeaderAction(calls) {
		return {
			bindGridEvent: function(_grid, id) {
				calls.push(['bindHeaderAction', id]);
				return [];
			},
		};
	}

	function createAction(calls) {
		return {
			editable: true,
			bindGridEvent: function(_grid, id) {
				calls.push(['bindAction', id]);
				return [];
			},
			onPasteCellRangeBox: function(grid, cell, value, context) {
				calls.push(['pasteAction', cell.col, cell.row, value, grid.getRowRecord(cell.row)]);
				if (value === 'reject') {
					context.reject();
				}
			},
			onDeleteCellRangeBox: function(_grid, cell) {
				calls.push(['deleteAction', cell.col, cell.row]);
			},
		};
	}

	function createContext(col, row) {
		let rectFilter = null;
		const baseRect = {
			left: 10,
			top: 20,
			width: 40,
			height: 20,
			right: 50,
			bottom: 40,
		};
		return {
			col,
			row,
			setRectFilter: function(filter) {
				rectFilter = filter;
			},
			getRect: function() {
				return rectFilter ? rectFilter(baseRect) : baseRect;
			},
			getContext: function() {
				return {
					canvas: {style: {}},
					font: '12px sans-serif',
					fillStyle: '#000',
					strokeStyle: '#000',
					textAlign: 'left',
					textBaseline: 'top',
					lineWidth: 1,
					measureText: function(text) {
						return {width: String(text).length * 6};
					},
					save: function() {},
					restore: function() {},
					beginPath: function() {},
					rect: function() {},
					clip: function() {},
					fill: function() {},
					stroke: function() {},
					moveTo: function() {},
					lineTo: function() {},
					fillText: function() {},
					strokeRect: function() {},
				};
			},
			addLayerDraw: function() {},
		};
	}

	function createSimpleGrid(calls) {
		const columnType = createColumnType(calls);
		const headerType = createHeaderType(calls);
		const action = createAction(calls);
		const headerAction = createHeaderAction(calls);
		const style = new cheetahGrid.columns.style.Style({color: '#123'});
		const headerStyle = new cheetahGrid.headers.style.Style({color: '#456'});
		const records = [
			{
				name: 'Ada',
				age: 36,
				iconName: 'account',
				iconWidth: 12,
				message: {type: 'info', message: 'ready'},
				asyncMessage: Promise.resolve({type: 'warning', message: 'later'}),
			},
			{
				name: 'Grace',
				age: 85,
				iconName: 'fallback',
				message: null,
				asyncMessage: Promise.resolve(null),
			},
		];
		const header = [
			{
				caption: 'Person',
				headerType,
				headerAction,
				headerStyle,
				headerField: 'personHeader',
				headerIcon: {path: 'M0 0h1v1z', width: 8},
				columns: [
					{
						caption: function() {
							return 'Name';
						},
						field: 'name',
						width: 80,
						minWidth: 30,
						maxWidth: 120,
						headerField: 'nameHeader',
						headerType,
						headerAction,
						headerStyle,
						headerIcon: {path: 'M0 0h2v2z', width: 9},
						icon: [
							{name: 'iconName', width: 'iconWidth'},
							{path: 'literal-path', width: 6},
						],
						message: ['message', 'asyncMessage'],
						columnType,
						action,
						style,
					},
					{
						caption: 'Age',
						field: 'age',
						width: 60,
						columnType,
						action,
						style,
						headerField: 'ageHeader',
						headerType,
					},
				],
			},
		];
		const grid = new ListGrid({
			parentElement: createParent(),
			header,
			headerRowHeight: [24, 28],
			records,
			allowRangePaste: false,
			theme: 'BASIC',
		});
		return {grid, records, header, action, columnType, headerType, style, headerStyle};
	}

	function createMultiGrid(calls) {
		const action = createAction(calls);
		const columnType = createColumnType(calls);
		const layout = {
			header: [[
				{caption: 'Name', headerField: 'nameHeader'},
				{caption: 'Note', headerField: 'noteHeader'},
			]],
			body: [
				[
					{field: 'name', colSpan: 2, action, columnType},
				],
				[
					{field: 'note', action, columnType},
					{field: 'status', action, columnType},
				],
			],
		};
		const records = [
			{name: 'Ada', note: 'n1', status: 'open'},
			{name: 'Grace', note: 'n2', status: 'done'},
		];
		const grid = new ListGrid({
			parentElement: createParent(),
			layout,
			records,
			allowRangePaste: true,
			trimOnPaste: true,
		});
		return {grid, records};
	}

	function keyEvent(keyCode) {
		const event = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(event, 'keyCode', {value: keyCode});
		Object.defineProperty(event, 'which', {value: keyCode});
		return event;
	}

	function clipboardEvent() {
		return {
			defaultPrevented: false,
			preventDefault: function() {
				this.defaultPrevented = true;
			},
			stopPropagation: function() {
				this.stopped = true;
			},
		};
	}

	describe('ListGrid API', function() {
		it('exposes header, record, field, theme, and sort APIs', function() {
			const calls = [];
			const {grid, records, header, columnType} = createSimpleGrid(calls);
			const headerValueEvents = [];
			try {
				grid.listen(EVENT_TYPE.CHANGED_HEADER_VALUE, function(e) {
					headerValueEvents.push([e.col, e.row, e.field, e.value, e.oldValue]);
				});

				expect(grid.header).toBe(header);
				expect(grid.layout).toEqual([]);
				expect(grid.headerRowHeight).toEqual([24, 28]);
				expect(grid.recordRowCount).toEqual(1);
				expect(grid.records).toBe(records);
				expect(grid.dataSource.length).toEqual(2);
				expect(grid.theme).not.toEqual(null);
				expect(grid.allowRangePaste).toEqual(false);
				grid.allowRangePaste = true;
				expect(grid.allowRangePaste).toEqual(true);
				expect(grid.font).toBeUndefined();
				grid.font = '13px serif';
				expect(grid.font).toEqual('13px serif');
				expect(grid.underlayBackgroundColor).toBeTypeOf('string');
				grid.underlayBackgroundColor = '#abc';
				expect(grid.underlayBackgroundColor).toEqual('#abc');

				expect(grid.getField(0, 2)).toEqual('name');
				expect(grid.getColumnDefine(0, 2).field).toEqual('name');
				expect(grid.getColumnType(0, 2)).toBe(columnType);
				expect(grid.getColumnAction(0, 2).editable).toEqual(true);
				expect(grid.getHeaderField(0, 1)).toEqual('nameHeader');
				expect(grid.getHeaderDefine(0, 1).caption()).toEqual('Name');
				expect(grid.getRowRecord(0)).toEqual(undefined);
				expect(grid.getRowRecord(2)).toBe(records[0]);
				expect(grid.getRecordIndexByRow(2)).toEqual(0);
				expect(grid.getRecordStartRowByRecordIndex(1)).toEqual(3);
				expect(grid.getColumnIndexByField('age')).toEqual(1);
				expect(grid.getColumnIndexByField('missing')).toEqual(null);
				expect(grid.getCellRangeByField('name', 1)).toEqual({
					start: {col: 0, row: 3},
					end: {col: 0, row: 3},
				});
				expect(grid.getCellRangeByField('missing', 0)).toEqual(null);
				expect(grid.getGridCanvasHelper()).toBe(grid.getGridCanvasHelper());
				expect(grid.getCellRange(0, 0)).toEqual({
					start: {col: 0, row: 0},
					end: {col: 1, row: 0},
				});
				expect(grid.getHeaderCellRange(0, 0)).toEqual(grid.getCellRange(0, 0));
				expect(grid.getLayoutCellId(0, 2)).toBeTypeOf('number');

				grid.focusGridCell('age', 1);
				expect(grid.selection.select).toEqual({col: 1, row: 3});
				grid.focusGridCell('missing', 1);
				expect(grid.selection.select).toEqual({col: 1, row: 3});
				grid.makeVisibleGridCell('age', 1);
				grid.makeVisibleGridCell('missing', 1);

				grid.setHeaderValue(0, 1, 'manual');
				expect(grid.getHeaderValue(0, 1)).toEqual('manual');
				grid.sortState = {col: 0, row: 1, order: 'asc'};
				expect(grid.sortState).toEqual({col: 0, row: 1, order: 'asc'});
				expect(grid.getHeaderValue(0, 1)).toEqual('asc');
				grid.sortState = {col: 1, row: 1, order: 'desc'};
				expect(grid.getHeaderValue(0, 1)).toEqual(undefined);
				expect(grid.getHeaderValue(1, 1)).toEqual('desc');
				grid.sortState = null;
				expect(grid.sortState).toEqual({col: -1, row: -1, order: undefined});

				grid.headerValues = new Map([['nameHeader', 'mapValue']]);
				expect(grid.getHeaderValue(0, 1)).toEqual('mapValue');
				grid.headerValues = null;
				expect(grid.getHeaderValue(0, 1)).toEqual(undefined);

				expect(calls).toContainEqual(['bindHeaderType', expect.any(Number)]);
				expect(calls).toContainEqual(['bindHeaderAction', expect.any(Number)]);
				expect(calls).toContainEqual(['bindColumnType', expect.any(Number)]);
				expect(calls).toContainEqual(['bindAction', expect.any(Number)]);
				expect(headerValueEvents.length).toBeGreaterThan(0);

			} finally {
				grid.dispose();
			}
		});

		it('refreshes header, layout, and header row height definitions', function() {
			const calls = [];
			const columnType = createColumnType(calls);
			const headerType = createHeaderType(calls);
			const grid = new ListGrid({
				parentElement: createParent(),
				header: [{caption: 'Name', field: 'name', headerType, columnType}],
				records: [{name: 'Ada'}],
			});
			try {
				grid.header = [
					{caption: 'Only', field: 'name', headerType},
				];
				expect(grid.colCount).toEqual(1);
				grid.layout = [[{field: 'name', columnType}]];
				expect(grid.recordRowCount).toEqual(1);
				grid.headerRowHeight = 30;
				expect(grid.getRowHeight(0)).toEqual(30);
			} finally {
				grid.dispose();
			}
		});

		it('updates records and data sources and responds to data source events', function() {
			const calls = [];
			const {grid} = createSimpleGrid(calls);
			try {
				const beforeRecords = grid.records;
				grid.records = null;
				expect(grid.records).toBe(beforeRecords);

				grid.records = [{name: 'New', age: 1}];
				expect(grid.records).toEqual([{name: 'New', age: 1}]);
				expect(grid.rowCount).toEqual(3);

				const ds = DataSource.ofArray([{name: 'DS', age: 2}]);
				grid.dataSource = ds;
				expect(grid.dataSource).toBe(ds);
				expect(grid.records).toEqual(null);
				ds.length = 2;
				expect(grid.rowCount).toEqual(4);
				ds.sort('name', 'asc');

				grid.dataSource = {
					length: 1,
					get: function() {
						return {name: 'Wrapped', age: 3};
					},
				};
				expect(grid.dataSource.get(0)).toEqual({name: 'Wrapped', age: 3});

				grid.dataSource = null;
				expect(grid.dataSource.length).toEqual(0);
				expect(grid.rowCount).toEqual(2);

				grid.theme = null;
				expect(grid.theme).toEqual(null);
			} finally {
				grid.dispose();
			}
		});

		it('draws and copies header/body cells through layout-aware cell ranges', function() {
			const calls = [];
			const {grid, records, style, headerStyle} = createSimpleGrid(calls);
			try {
				grid.onDrawCell(0, 0, createContext(0, 0));
				grid.onDrawCell(0, 1, createContext(0, 1));
				grid.onDrawCell(0, 2, createContext(0, 2));
				grid.onDrawCell(99, 99, createContext(99, 99));

				expect(calls).toContainEqual(['drawHeader', 'Person', {path: 'M0 0h1v1z', width: 8}, headerStyle, 100]);
				expect(calls).toContainEqual(['drawHeader', 'Name', {path: 'M0 0h2v2z', width: 9}, headerStyle, 40]);
				expect(calls).toContainEqual([
					'drawColumn',
					'Ada',
					records[0],
					[
						{name: 'account', width: 12},
						{path: 'literal-path', width: 6},
					],
					{type: 'info', message: 'ready'},
					style,
					40,
				]);

				expect(grid.getCopyCellValue(0, 0)).toEqual('header:Person');
				expect(grid.getCopyCellValue(1, 0, {
					start: {col: 0, row: 0},
					end: {col: 1, row: 0},
				})).toEqual('');
				expect(grid.getCopyCellValue(0, 2)).toEqual('copy:Ada');
			} finally {
				grid.dispose();
			}
		});

		it('gets, changes, pastes, deletes, and rejects values through actions', async function() {
			const calls = [];
			const {grid, records} = createMultiGrid(calls);
			const events = [];
			try {
				grid.listen(EVENT_TYPE.BEFORE_CHANGE_VALUE, function(e) {
					events.push(['before', e.col, e.row, e.field, e.value, e.oldValue]);
				});
				grid.listen(EVENT_TYPE.CHANGED_VALUE, function(e) {
					events.push(['changed', e.col, e.row, e.field, e.value, e.oldValue]);
				});
				grid.listen(EVENT_TYPE.REJECTED_PASTE_VALUES, function(e) {
					events.push(['rejected', e.detail.length, e.detail[0].pasteValue]);
				});

				expect(grid.doGetCellValue(0, 0, function() {})).toEqual(false);
				const got = [];
				expect(grid.doGetCellValue(0, 1, function(value) {
					got.push(value);
				})).toEqual(true);
				expect(got).toEqual(['Ada']);

				expect(grid.doChangeValue(0, 0, function() {
					return 'header';
				})).toEqual(false);
				expect(grid.doChangeValue(0, 1, function() {
					return undefined;
				})).toEqual(false);
				expect(grid.doChangeValue(0, 1, function(before) {
					return `${before}!`;
				})).toEqual(true);
				expect(records[0].name).toEqual('Ada!');
				expect(events).toContainEqual(['before', 0, 1, 'name', 'Ada!', 'Ada']);
				expect(events).toContainEqual(['changed', 0, 1, 'name', 'Ada!', 'Ada']);

				grid.selection.range = {
					start: {col: 0, row: 1},
					end: {col: 1, row: 2},
				};
				grid.doSetPasteValue('reject\tone\nthree\tfour', function(data) {
					events.push(['testPaste', data.col, data.row, data.value, data.oldValue]);
					return true;
				});
				await new Promise(function(resolve) {
					setTimeout(resolve, 120);
				});

				expect(calls).toContainEqual(['pasteAction', 0, 1, 'reject', records[0]]);
				expect(calls).toContainEqual(['pasteAction', 0, 2, 'three', records[0]]);
				expect(events).toContainEqual(['rejected', 1, 'reject']);
				expect(grid.selection.range).toEqual({
					start: {col: 0, row: 1},
					end: {col: 1, row: 2},
				});

				const pasteEvent = clipboardEvent();
				grid.fireListeners(EVENT_TYPE.PASTE_CELL, {
					col: 0,
					row: 1,
					value: 'x\ty',
					normalizeValue: 'x\ty',
					multi: true,
					rangeBoxValues: null,
					event: pasteEvent,
				});
				expect(pasteEvent.defaultPrevented).toEqual(true);

				const deleteEvent = clipboardEvent();
				grid.fireListeners(EVENT_TYPE.DELETE_CELL, {
					col: 0,
					row: 1,
					event: deleteEvent,
				});
				expect(deleteEvent.defaultPrevented).toEqual(true);
				expect(calls).toContainEqual(['deleteAction', 0, 1]);
				expect(calls).toContainEqual(['deleteAction', 0, 2]);
			} finally {
				grid.dispose();
			}
		});

		it('uses merged cell ranges for keyboard movement and paste/delete early returns', function() {
			const calls = [];
			const {grid} = createMultiGrid(calls);
			try {
				grid.selection.select = {col: 0, row: 1};
				let event = keyEvent(40);
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 0, row: 2});

				grid.selection.select = {col: 0, row: 2};
				event = keyEvent(38);
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 0, row: 1});

				grid.allowRangePaste = false;
				const pasteEvent = clipboardEvent();
				grid.fireListeners(EVENT_TYPE.PASTE_CELL, {
					col: 0,
					row: 1,
					value: 'single',
					normalizeValue: 'single',
					multi: false,
					rangeBoxValues: null,
					event: pasteEvent,
				});
				expect(pasteEvent.defaultPrevented).toEqual(false);

				grid.allowRangePaste = true;
				grid.selection.range = {
					start: {col: 0, row: 0},
					end: {col: 0, row: 0},
				};
				const headerPasteEvent = clipboardEvent();
				grid.fireListeners(EVENT_TYPE.PASTE_CELL, {
					col: 0,
					row: 0,
					value: 'a\tb',
					normalizeValue: 'a\tb',
					multi: true,
					rangeBoxValues: null,
					event: headerPasteEvent,
				});
				expect(headerPasteEvent.defaultPrevented).toEqual(false);

				const headerDeleteEvent = clipboardEvent();
				grid.fireListeners(EVENT_TYPE.DELETE_CELL, {
					col: 0,
					row: 0,
					event: headerDeleteEvent,
				});
				expect(headerDeleteEvent.defaultPrevented).toEqual(false);
			} finally {
				grid.dispose();
			}
		});
	});
})();
