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
	function expectRadioGroupToggle(grid, groups) {
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
			expect(grid[RADIO_COLUMN_STATE_ID].mouseActiveCell).toEqual({col: 1, row: 2});
			expect(grid.element.style.cursor).toEqual('pointer');
			expect(grid.invalidates[0]).toEqual(grid.getCellRange(1, 2));

			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			expectRadioGroupToggle(grid, groups);

			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});
			expect(grid.element.style.cursor).toEqual('pointer');
			expect(grid.invalidates).toContainEqual(grid.getCellRange(1, 3));
		});

		it('handles bound paste values with checkAction', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const checks = [];
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
			expect(checks).toEqual([[grid.records[2], 1, 2, grid]]);
			expect(trueEvent).toMatchObject({prevented: true, stopped: true});
		});

		it('accepts false range paste values and rejects non-boolean values', function() {
			const grid = createGrid();
			const rejected = [];
			const editor = new actions.RadioEditor();

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'false', {
				reject: function() {
					rejected.push('false');
				},
			});
			expect(rejected).toEqual([]);

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'maybe', {
				reject: function() {
					rejected.push('maybe');
				},
			});

			expect(rejected).toEqual(['maybe']);
		});
	});
})();
