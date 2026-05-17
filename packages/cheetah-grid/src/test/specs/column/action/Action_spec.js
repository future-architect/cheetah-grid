/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.columns.action;

	function createGrid() {
		const invalidates = [];
		return {
			listeners: {},
			selection: {
				select: {col: 1, row: 2},
			},
			element: {
				style: {
					cursor: '',
				},
			},
			keyboardOptions: {},
			record: {id: 1},
			canvas: {
				getBoundingClientRect: function() {
					return {left: 100, top: 200};
				},
			},
			scrollLeft: 5,
			scrollTop: 7,
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
			getRowRecord: function() {
				return this.record;
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getCellRect: function() {
				return {
					left: 10,
					top: 20,
					width: 30,
					height: 40,
				};
			},
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
		};
	}

	describe('column actions', function() {
		it('resolves built-in actions and custom instances', function() {
			const custom = new actions.Action();

			expect(actions.of()).toBeUndefined();
			expect(actions.of('check')).toBe(actions.of('CHECK'));
			expect(actions.of('radio')).toBe(actions.of('RADIO'));
			expect(actions.of('input')).toBe(actions.of('INPUT'));
			expect(actions.of('missing')).toBeUndefined();
			expect(actions.of(custom)).toBe(custom);
		});

		it('updates base disabled state and clones generic actions independently', function() {
			const base = new actions.BaseAction({disabled: true});
			const action = new actions.Action({
				disabled: false,
				area: function() {
					return true;
				},
			});
			const actionClone = action.clone();

			base.disabled = false;
			actionClone.area = function() {
				return false;
			};

			expect(base.disabled).toEqual(false);
			expect(action.area()).toEqual(true);
			expect(actionClone.area()).toEqual(false);
			expect(action.editable).toEqual(false);
		});

		it('binds generic action events with area coordinate conversion', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const calls = [];
			const areas = [];
			const action = new actions.Action({
				action: function(record, cell) {
					calls.push([record, cell.col, cell.row, cell.grid]);
				},
				area: function(info) {
					areas.push(info);
					return true;
				},
			});

			action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({
				col: 1,
				row: 2,
				event: {
					clientX: 140,
					clientY: 260,
				},
			});
			expect(areas[0].pointInDrawingCanvas).toEqual({x: 40, y: 60});
			expect(areas[0].pointInCell).toEqual({x: 35, y: 47});
			expect(grid.element.style.cursor).toEqual('pointer');
		});

		it('binds generic click action events', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const calls = [];
			const action = new actions.Action({
				action: function(record, cell) {
					calls.push([record, cell.col, cell.row, cell.grid]);
				},
				area: function() {
					return true;
				},
			});

			action.bindGridEvent(grid, '1:2');

			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({
				col: 1,
				row: 2,
				event: {
					clientX: 140,
					clientY: 260,
				},
			});
			expect(calls).toEqual([[grid.record, 1, 2, grid]]);
		});

		it('binds generic mouseout action events after mouseover activates the cell', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const action = new actions.Action({
				action: function() {},
				area: function() {
					return true;
				},
			});

			action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({
				col: 1,
				row: 2,
				event: {
					clientX: 140,
					clientY: 260,
				},
			});
			expect(grid.invalidates).toEqual([grid.getCellRange(1, 2)]);
			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});
			expect(grid.invalidates).toEqual([grid.getCellRange(1, 2)]);
			expect(grid.element.style.cursor).toEqual('pointer');
		});

		it('skips generic actions while disabled', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const calls = [];
			const action = new actions.Action({
				disabled: true,
				action: function() {
					calls.push('called');
				},
			});

			action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2, event: {}});
			expect(grid.element.style.cursor).toEqual('');

			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2, event: {}});

			expect(calls).toEqual([]);
			expect(grid.element.style.cursor).toEqual('');
		});

		it('creates button action state lazily and clones without sharing options', async function() {
			const {BUTTON_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const grid = {};
			const action = new actions.ButtonAction({
				action: function() {
					return 'first';
				},
			});
			const clone = action.clone();

			clone.action = function() {
				return 'second';
			};

			expect(action.area).toBeUndefined();
			action.area = function() {
				return false;
			};
			expect(action.area).toBeUndefined();
			expect(action.getState(grid)).toBe(action.getState(grid));
			expect(grid[BUTTON_COLUMN_STATE_ID]).toBe(action.getState(grid));
			expect(action.action()).toEqual('first');
			expect(clone.action()).toEqual('second');
		});
	});
})();
