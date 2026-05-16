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
				'1:3': true,
			},
			records: {
				2: {id: 2},
				3: {id: 3},
			},
			changes,
			invalidates,
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
				return this.records[row];
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
		};
	}

	describe('RadioEditor', function() {
		it('uses group definitions to check the target and clear sibling cells', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const {RADIO_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const grid = createGrid();
			const groups = [];
			const editor = new actions.RadioEditor({
				group: function(info) {
					groups.push(info);
					return [
						{col: 1, row: 2},
						{col: 1, row: 3},
					];
				},
			});

			editor.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});

			expect(groups).toEqual([{
				grid,
				col: 1,
				row: 2,
			}]);
			expect(grid.values).toMatchObject({
				'1:2': true,
				'1:3': false,
			});
			expect(grid.changes).toEqual([
				[1, 2, true],
				[1, 3, false],
			]);
			expect(grid[RADIO_COLUMN_STATE_ID].mouseActiveCell).toEqual({col: 1, row: 2});
			expect(grid.element.style.cursor).toEqual('pointer');
			expect(grid.invalidates[0]).toEqual({
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			});
			expect(grid.invalidates).toContainEqual({
				start: {col: 1, row: 3},
				end: {col: 1, row: 3},
			});
		});

		it('handles paste values with checkAction and rejects non-boolean values', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const checks = [];
			const rejected = [];
			const editor = new actions.RadioEditor({
				checkAction: function(record, cell) {
					checks.push([record, cell.col, cell.row, cell.grid]);
				},
			});

			editor.bindGridEvent(grid, '1:2');
			const trueEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'true',
				event: trueEvent,
			});
			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'false', {
				reject: function() {
					rejected.push('false');
				},
			});
			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'maybe', {
				reject: function() {
					rejected.push('maybe');
				},
			});

			expect(checks).toEqual([[grid.records[2], 1, 2, grid]]);
			expect(trueEvent).toMatchObject({prevented: true, stopped: true});
			expect(rejected).toEqual(['maybe']);
		});
	});
})();
