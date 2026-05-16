/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const DrawGrid = cheetahGrid.core.DrawGrid;
	const EVENT_TYPE = DrawGrid.EVENT_TYPE;
	const _ = cheetahGrid._getInternal().symbolManager.PROTECTED_SYMBOL;

	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}

	function createParent(width, height) {
		const parent = document.createElement('div');
		parent.style.width = width || '320px';
		parent.style.height = height || '180px';
		mainEl.appendChild(parent);
		return parent;
	}

	function createGrid(options) {
		const grid = new DrawGrid(Object.assign({
			parentElement: createParent(),
			rowCount: 8,
			colCount: 8,
			frozenColCount: 1,
			frozenRowCount: 1,
			defaultRowHeight: 20,
			defaultColWidth: 40,
			font: '12px sans-serif',
			underlayBackgroundColor: '#eee',
			trimOnPaste: true,
		}, options));
		grid.onDrawCell = function(_col, _row, context) {
			context.addLayerDraw(1, function(ctx) {
				ctx.fillStyle = '#f00';
			});
		};
		return grid;
	}

	function scroll(grid, left, top) {
		grid[_].scrollable.scrollLeft = left;
		grid[_].scrollable.scrollTop = top;
		grid[_].scrollable._handler.fire(grid[_].scrollable._scrollable, 'scroll', {});
	}

	function keyEvent(keyCode, props) {
		const event = new KeyboardEvent('keydown', Object.assign({
			bubbles: true,
			cancelable: true,
		}, props));
		Object.defineProperty(event, 'keyCode', {value: keyCode});
		Object.defineProperty(event, 'which', {value: keyCode});
		return event;
	}

	function mouseEvent(type, x, y, props) {
		return new MouseEvent(type, Object.assign({
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
			buttons: 1,
		}, props));
	}

	describe('DrawGrid API', function() {
		it('updates size, counts, dimensions, ranges, and overflow text', function() {
			const grid = createGrid({
				keyboardOptions: {moveCellOnTab: true},
			});
			const disposed = [];
			try {
				expect(grid.rowCount).toEqual(8);
				expect(grid.colCount).toEqual(8);
				expect(grid.frozenColCount).toEqual(1);
				expect(grid.frozenRowCount).toEqual(1);
				expect(grid.defaultRowHeight).toEqual(20);
				expect(grid.defaultColWidth).toEqual(40);
				expect(grid.font).toEqual('12px sans-serif');
				expect(grid.underlayBackgroundColor).toEqual('#eee');
				expect(grid.trimOnPaste).toEqual(true);
				expect(grid.keyboardOptions).toEqual({moveCellOnTab: true});

				grid.configure('fadeinWhenCallbackInPromise', true);
				expect(grid.configure('fadeinWhenCallbackInPromise')).toEqual(true);
				grid.keyboardOptions = null;
				expect(grid.keyboardOptions).toEqual(null);
				grid.trimOnPaste = false;
				grid.font = '14px serif';
				grid.underlayBackgroundColor = '#fff';
				expect(grid.trimOnPaste).toEqual(false);
				expect(grid.font).toEqual('14px serif');
				expect(grid.underlayBackgroundColor).toEqual('#fff');

				grid.selection.select = {col: 7, row: 7};
				grid.rowCount = 4;
				grid.colCount = 5;
				expect(grid.selection.select).toEqual({col: 4, row: 3});

				grid.frozenColCount = 2;
				grid.frozenRowCount = 2;
				expect(grid.isFrozenCell(1, 3)).toEqual({row: false, col: true});
				expect(grid.isFrozenCell(3, 1)).toEqual({row: true, col: false});
				expect(grid.isFrozenCell(3, 3)).toEqual(null);

				grid.setRowHeight(2, 30);
				expect(grid.getRowHeight(2)).toEqual(30);
				grid.setRowHeight(2, null);
				expect(grid.getRowHeight(2)).toEqual(20);

				grid.setColWidth(1, 60);
				expect(grid.getColWidth(1)).toEqual(60);
				grid.setMinColWidth(1, 70);
				expect(grid.getMinColWidth(1)).toEqual(70);
				expect(grid.getColWidth(1)).toEqual(70);
				grid.setMaxColWidth(1, 55);
				expect(grid.getMaxColWidth(1)).toEqual(55);
				grid.setMinColWidth(1, null);
				expect(grid.getColWidth(1)).toEqual(55);
				grid.setMaxColWidth(1, null);
				grid.setColWidth(1, null);
				expect(grid.getColWidth(1)).toEqual(40);

				grid.defaultColWidth = 'auto';
				grid.setColWidth(0, 50);
				grid.setMaxColWidth(1, 20);
				expect(grid.getColWidth(1)).toEqual(20);
				expect(grid.getColWidth(2)).toEqual(grid.getColWidth(3));
				expect(grid.getColWidth(2)).toEqual(grid.getColWidth(4));
				expect(grid.getColWidth(2)).toBeGreaterThan(grid.getColWidth(1));
				grid.defaultColWidth = 40;
				grid.setMaxColWidth(1, null);
				grid.setColWidth(1, 60);

				const rect = grid.getCellRect(1, 1);
				expect(rect.left).toEqual(50);
				expect(rect.top).toEqual(20);
				expect(rect.width).toEqual(60);
				expect(rect.height).toEqual(20);
				expect(grid.getCellsRect(1, 1, 2, 2).width).toEqual(100);
				expect(grid.getCellRangeRect({
					start: {col: 1, row: 1},
					end: {col: 2, row: 2},
				}).height).toEqual(60);
				expect(grid.getCellAt(10, 10)).toEqual({col: 0, row: 0});
				expect(grid.getRowAt(9999)).toEqual(-1);
				expect(grid.getColAt(9999)).toEqual(-1);

				grid.setCellOverflowText(1, 2, '  overflowed  ');
				expect(grid.getCellOverflowText(1, 2)).toEqual('overflowed');
				grid.setCellOverflowText(1, 2, false);
				expect(grid.getCellOverflowText(1, 2)).toEqual(null);

				expect(function() {
					grid.addDisposable({});
				}).toThrowError('not disposable!');
				grid.addDisposable({
					dispose: function() {
						disposed.push('disposed');
					},
				});
			} finally {
				grid.dispose();
			}
			expect(disposed).toEqual(['disposed']);
		});

		it('scrolls, focuses cells, and invalidates visible areas', function() {
			const grid = createGrid({rowCount: 20, colCount: 20});
			try {
				expect(grid.updateScroll()).toEqual(false);
				scroll(grid, 25, 30);
				expect(grid.scrollLeft).toEqual(25);
				expect(grid.scrollTop).toEqual(30);
				expect(grid.topRow).toBeGreaterThanOrEqual(1);
				expect(grid.leftCol).toBeGreaterThanOrEqual(1);
				expect(grid.visibleRowCount).toBeGreaterThanOrEqual(2);
				expect(grid.visibleRowCount).toBeLessThanOrEqual(grid.rowCount);
				expect(grid.visibleColCount).toBeGreaterThanOrEqual(2);
				expect(grid.visibleColCount).toBeLessThanOrEqual(grid.colCount);

				grid.makeVisibleCell(19, 19);
				expect(grid.scrollLeft).toBeGreaterThan(25);
				expect(grid.scrollTop).toBeGreaterThan(30);
				const focusControl = grid.getElement().querySelector('.grid-focus-control');
				grid.setFocusCursor(2, 2);
				expect(focusControl.style.left).toEqual('80px');
				expect(focusControl.style.top).toEqual('30px');
				grid.focusCell(3, 3);
				expect(focusControl.style.left).toEqual('120px');

				const drawnCells = [];
				grid.onDrawCell = function(col, row) {
					drawnCells.push([col, row]);
				};
				let drawnCount = drawnCells.length;
				grid.invalidateCell(0, 0);
				expect(drawnCells.length).toBeGreaterThan(drawnCount);
				drawnCount = drawnCells.length;
				grid.invalidateGridRect(0, 0, 3, 3);
				expect(drawnCells.length).toBeGreaterThan(drawnCount);
				drawnCount = drawnCells.length;
				grid.invalidateCellRange({
					start: {col: 1, row: 1},
					end: {col: 2, row: 2},
				});
				expect(drawnCells.length).toBeGreaterThan(drawnCount);
				drawnCount = drawnCells.length;
				grid.invalidate();
				expect(drawnCells.length).toBeGreaterThan(drawnCount);

				const area = grid.getAttachCellsArea({
					start: {col: 1, row: 1},
					end: {col: 2, row: 2},
				});
				expect(area.element).toBe(grid.getElement());
				expect(area.rect.width).toEqual(80);
				expect(area.rect.height).toEqual(40);
			} finally {
				grid.dispose();
			}
		});

		it('moves selection with keyboard shortcuts and custom move callbacks', function() {
			const grid = createGrid({
				rowCount: 4,
				colCount: 4,
				keyboardOptions: {
					moveCellOnTab: true,
					moveCellOnEnter: true,
					selectAllOnCtrlA: true,
				},
			});
			try {
				grid.selection.select = {col: 1, row: 1};

				let event = keyEvent(39);
				grid.onKeyDownMove(event);
				expect(event.defaultPrevented).toEqual(true);
				expect(grid.selection.select).toEqual({col: 2, row: 1});

				event = keyEvent(40, {shiftKey: true});
				grid.onKeyDownMove(event);
				expect(event.defaultPrevented).toEqual(true);
				expect(grid.selection.focus).toEqual({col: 2, row: 2});
				expect(grid.selection.select).toEqual({col: 2, row: 1});

				event = keyEvent(36, {ctrlKey: true});
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 0, row: 0});
				expect(event.defaultPrevented).toEqual(true);

				event = keyEvent(35, {ctrlKey: true});
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 3, row: 3});
				expect(event.defaultPrevented).toEqual(true);

				grid.selection.select = {col: 3, row: 0};
				event = keyEvent(9);
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 0, row: 1});
				expect(event.defaultPrevented).toEqual(true);

				grid.selection.select = {col: 2, row: 0};
				event = keyEvent(13, {shiftKey: true});
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 1, row: 3});
				expect(event.defaultPrevented).toEqual(true);

				event = keyEvent(65, {ctrlKey: true});
				grid.onKeyDownMove(event);
				expect(grid.selection.range).toEqual({
					start: {col: 0, row: 0},
					end: {col: 3, row: 3},
				});
				expect(event.defaultPrevented).toEqual(true);

				grid.keyboardOptions = {
					moveCellOnTab: function() {
						return {col: 2, row: 0};
					},
					moveCellOnEnter: function() {
						return {col: 0, row: 2};
					},
				};
				event = keyEvent(9);
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 2, row: 0});
				event = keyEvent(13);
				grid.onKeyDownMove(event);
				expect(grid.selection.select).toEqual({col: 0, row: 2});

				event = keyEvent(37, {altKey: true});
				grid.onKeyDownMove(event);
				expect(event.defaultPrevented).toEqual(false);
			} finally {
				grid.dispose();
			}
		});

		it('fires focus-control input, paste, copy, delete, and focus events', function() {
			const grid = createGrid({
				rowCount: 2,
				colCount: 3,
				keyboardOptions: {
					deleteCellValueOnDel: true,
				},
			});
			const input = grid.getElement().querySelector('.grid-focus-control');
			const events = [];
			try {
				grid.getCopyCellValue = function(col, row) {
					if (row === 0 && col === 0) {
						return 'A\tB';
					}
					if (row === 0 && col === 1) {
						return null;
					}
					if (row === 0 && col === 2) {
						return 123;
					}
					if (row === 1 && col === 0) {
						return Promise.resolve('async');
					}
					if (row === 1 && col === 1) {
						return {};
					}
					return 'line\nbreak';
				};
				grid.listen(EVENT_TYPE.EDITABLEINPUT_CELL, function(e) {
					events.push(['editable', e.col, e.row]);
					return true;
				});
				grid.listen(EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL, function(e) {
					events.push(['modify', e.col, e.row, e.input === input]);
				});
				grid.listen(EVENT_TYPE.INPUT_CELL, function(e) {
					events.push(['input', e.col, e.row, e.value]);
				});
				grid.listen(EVENT_TYPE.KEYDOWN, function(e) {
					events.push(['keydown', e.keyCode]);
				});
				grid.listen(EVENT_TYPE.DELETE_CELL, function(e) {
					events.push(['delete', e.col, e.row, e.event.keyCode]);
				});
				grid.listen(EVENT_TYPE.PASTE_CELL, function(e) {
					events.push([
						'paste',
						e.col,
						e.row,
						e.normalizeValue,
						e.multi,
						e.rangeBoxValues.rowCount,
						e.rangeBoxValues.colCount,
						e.rangeBoxValues.getCellValue(1, 0),
					]);
				});
				grid.listen(EVENT_TYPE.FOCUS_GRID, function() {
					events.push(['focus']);
				});
				grid.listen(EVENT_TYPE.BLUR_GRID, function() {
					events.push(['blur']);
				});

				grid.selection.select = {col: 1, row: 1};
				expect(input.readOnly).toEqual(false);
				input.dispatchEvent(new KeyboardEvent('keypress', {
					key: 'x',
					bubbles: true,
					cancelable: true,
				}));
				input.dispatchEvent(keyEvent(46));
				input.dispatchEvent(new InputEvent('input', {
					data: ' ',
					bubbles: true,
				}));

				const pasteEvent = new ClipboardEvent('paste', {
					bubbles: true,
					cancelable: true,
				});
				Object.defineProperty(pasteEvent, 'clipboardData', {
					value: {
						items: [{}],
						getData: function() {
							return '  a\tb\n c  ';
						},
					},
				});
				input.dispatchEvent(pasteEvent);

				let copyText = null;
				const copyEvent = new ClipboardEvent('copy', {
					bubbles: true,
					cancelable: true,
				});
				Object.defineProperty(copyEvent, 'clipboardData', {
					value: {
						setData: function(_type, value) {
							copyText = value;
						},
					},
				});
				grid.selection.range = {
					start: {col: 0, row: 0},
					end: {col: 2, row: 1},
				};
				input.dispatchEvent(copyEvent);
				input.dispatchEvent(new FocusEvent('focus', {bubbles: true}));
				input.dispatchEvent(new FocusEvent('blur', {bubbles: true}));

				expect(events).toContainEqual(['editable', 1, 1]);
				expect(events).toContainEqual(['modify', 1, 1, true]);
				expect(events).toContainEqual(['input', 1, 1, 'x']);
				expect(events).toContainEqual(['input', 1, 1, ' ']);
				expect(events).toContainEqual(['keydown', 46]);
				expect(events).toContainEqual(['delete', 1, 1, 46]);
				expect(events).toContainEqual(['paste', 1, 1, 'a\tb\n c', true, 2, 2, 'b']);
				expect(events).toContainEqual(['focus']);
				expect(events).toContainEqual(['blur']);
				expect(copyText).toEqual('"A\tB"\t\t123\n\t\t"line\nbreak"');
			} finally {
				grid.dispose();
			}
		});

		it('emits pointer events for cells and ignores out-of-canvas positions', function() {
			const grid = createGrid({rowCount: 4, colCount: 4});
			const element = grid.getElement();
			const scrollable = grid[_].scrollable.getElement();
			const events = [];
			try {
				grid.canvas.getBoundingClientRect = function() {
					return {
						left: 0,
						top: 0,
						right: 200,
						bottom: 100,
						width: 200,
						height: 100,
					};
				};
				[
					EVENT_TYPE.MOUSEENTER_CELL,
					EVENT_TYPE.MOUSELEAVE_CELL,
					EVENT_TYPE.MOUSEOVER_CELL,
					EVENT_TYPE.MOUSEOUT_CELL,
					EVENT_TYPE.MOUSEMOVE_CELL,
					EVENT_TYPE.MOUSEUP_CELL,
					EVENT_TYPE.CLICK_CELL,
					EVENT_TYPE.DBLCLICK_CELL,
					EVENT_TYPE.CONTEXTMENU_CELL,
				].forEach(function(type) {
					grid.listen(type, function(e) {
						events.push([type, e.col, e.row]);
					});
				});
				grid.listen(EVENT_TYPE.MOUSEDOWN_CELL, function(e) {
					events.push([EVENT_TYPE.MOUSEDOWN_CELL, e.col, e.row]);
					return false;
				});

				scrollable.dispatchEvent(mouseEvent('mouseover', 5, 5));
				element.dispatchEvent(mouseEvent('mousemove', 5, 5));
				element.dispatchEvent(mouseEvent('mousemove', 45, 25));
				element.dispatchEvent(mouseEvent('mouseup', 45, 25));
				element.dispatchEvent(mouseEvent('click', 45, 25));
				element.dispatchEvent(mouseEvent('dblclick', 45, 25));
				element.dispatchEvent(mouseEvent('contextmenu', 45, 25));
				element.dispatchEvent(mouseEvent('mousedown', 45, 25));
				scrollable.dispatchEvent(mouseEvent('mouseout', 45, 25));
				element.dispatchEvent(mouseEvent('mouseleave', 45, 25));
				element.style.cursor = 'col-resize';
				element.dispatchEvent(mouseEvent('mousemove', 250, 150));

				expect(events).toContainEqual([EVENT_TYPE.MOUSEENTER_CELL, 0, 0]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEOVER_CELL, 0, 0]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEMOVE_CELL, 0, 0]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEENTER_CELL, 1, 1]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSELEAVE_CELL, 0, 0]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEOUT_CELL, 0, 0]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEUP_CELL, 1, 1]);
				expect(events).toContainEqual([EVENT_TYPE.CLICK_CELL, 1, 1]);
				expect(events).toContainEqual([EVENT_TYPE.DBLCLICK_CELL, 1, 1]);
				expect(events).toContainEqual([EVENT_TYPE.CONTEXTMENU_CELL, 1, 1]);
				expect(events).toContainEqual([EVENT_TYPE.MOUSEDOWN_CELL, 1, 1]);
				expect(element.style.cursor).toEqual('');
			} finally {
				grid.dispose();
			}
		});
	});
})();
