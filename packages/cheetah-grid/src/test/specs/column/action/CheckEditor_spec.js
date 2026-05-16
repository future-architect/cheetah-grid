/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.columns.action;

	function createCancelableEvent() {
		return {
			prevented: false,
			stopped: false,
			preventDefault: function() {
				this.prevented = true;
			},
			stopPropagation: function() {
				this.stopped = true;
			},
		};
	}

	function createGrid() {
		const changes = [];
		const invalidates = [];
		const rejected = [];
		return {
			listeners: {},
			selection: {
				select: {col: 1, row: 2},
				range: {
					start: {col: 1, row: 2},
					end: {col: 1, row: 2},
				},
			},
			element: {
				style: {
					cursor: '',
				},
			},
			keyboardOptions: {},
			values: {
				'1:2': false,
			},
			changes,
			invalidates,
			rejected,
			listen: function(type, listener) {
				this.listeners[type] = listener;
				return type;
			},
			getLayoutCellId: function(col, row) {
				return `${col}:${row}`;
			},
			getElement: function() {
				return this.element;
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getRowRecord: function(row) {
				return {row};
			},
			getColumnDefine: function(col, row) {
				return {field: `${col}:${row}`};
			},
			doGetCellValue: function(col, row, callback) {
				callback(this.values[`${col}:${row}`]);
			},
			doChangeValue: function(col, row, fn) {
				const key = `${col}:${row}`;
				const value = fn(this.values[key]);
				this.values[key] = value;
				changes.push([col, row, value]);
				return true;
			},
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
			fireListeners: function(type, event) {
				rejected.push([type, event]);
			},
		};
	}

	describe('CheckEditor', function() {
		it('binds hover, click, keyboard, and paste toggles', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const {CHECK_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const grid = createGrid();
			const editor = new actions.CheckEditor();

			const ids = editor.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			const keyEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({
				keyCode: 32,
				event: keyEvent,
			});
			const pasteEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'true',
				event: pasteEvent,
			});
			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});

			expect(ids).toEqual([
				DG_EVENT_TYPE.CLICK_CELL,
				DG_EVENT_TYPE.MOUSEOVER_CELL,
				DG_EVENT_TYPE.MOUSEOUT_CELL,
				DG_EVENT_TYPE.KEYDOWN,
				DG_EVENT_TYPE.PASTE_CELL,
			]);
			expect(grid.changes).toEqual([
				[1, 2, true],
				[1, 2, false],
				[1, 2, true],
			]);
			expect(grid[CHECK_COLUMN_STATE_ID].mouseActiveCell).toEqual({col: 1, row: 2});
			expect(grid.element.style.cursor).toEqual('pointer');
			expect(grid.invalidates[0]).toEqual({
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			});
			expect(keyEvent).toMatchObject({prevented: true, stopped: true});
			expect(pasteEvent).toMatchObject({prevented: true, stopped: true});
		});

		it('rejects incompatible paste values and range paste values', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const editor = new actions.CheckEditor();
			const rejectedRange = [];
			editor.bindGridEvent(grid, '1:2');

			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'maybe',
				event: createCancelableEvent(),
			});
			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'true', {
				reject: function() {
					rejectedRange.push('true');
				},
			});
			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'maybe', {
				reject: function() {
					rejectedRange.push('maybe');
				},
			});

			expect(grid.rejected[0][0]).toEqual('rejected_paste_values');
			expect(grid.rejected[0][1].detail[0]).toMatchObject({
				col: 1,
				row: 2,
				record: {row: 2},
				define: {field: '1:2'},
				pasteValue: 'maybe',
			});
			expect(grid.changes).toEqual([[1, 2, true]]);
			expect(rejectedRange).toEqual(['maybe']);
		});
	});
})();
