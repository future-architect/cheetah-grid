/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.headers.action;

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
		const invalidates = [];
		const writes = [];
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
			values: {
				'1:2': false,
			},
			invalidates,
			writes,
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
			getHeaderValue: function(col, row) {
				return this.values[`${col}:${row}`];
			},
			setHeaderValue: function(col, row, value) {
				this.values[`${col}:${row}`] = value;
				writes.push([col, row, value]);
			},
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
		};
	}

	describe('CheckHeaderAction', function() {
		it('binds hover events for check headers', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const {CHECK_HEADER_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const grid = createGrid();
			const action = new actions.CheckHeaderAction();

			const ids = action.bindGridEvent(grid, '1:2');
			expect(ids).toEqual([
				DG_EVENT_TYPE.CLICK_CELL,
				DG_EVENT_TYPE.MOUSEOVER_CELL,
				DG_EVENT_TYPE.MOUSEMOVE_CELL,
				DG_EVENT_TYPE.MOUSEOUT_CELL,
				DG_EVENT_TYPE.KEYDOWN,
			]);

			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			expect(grid.invalidates[0]).toEqual({
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			});

			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});
			expect(grid[CHECK_HEADER_STATE_ID].mouseActiveCell).toBeUndefined();
			expect(grid.element.style.cursor).toEqual('');
		});

		it('binds click and keyboard toggles for check headers', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const action = new actions.CheckHeaderAction();

			action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			expect(grid.writes).toEqual([[1, 2, true]]);

			const keyEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({
				keyCode: 32,
				event: keyEvent,
			});
			expect(grid.writes).toEqual([
				[1, 2, true],
				[1, 2, false],
			]);
			expect(keyEvent).toMatchObject({prevented: true, stopped: true});
		});

		it('skips toggles while disabled or blocked', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const {CHECK_HEADER_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const disabledGrid = createGrid();
			const disabledAction = new actions.CheckHeaderAction({
				disabled: true,
			});
			disabledAction.bindGridEvent(disabledGrid, '1:2');

			disabledGrid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			expect(disabledGrid.element.style.cursor).toEqual('');

			disabledGrid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			expect(disabledGrid.writes).toEqual([]);

			const blockedGrid = createGrid();
			const action = new actions.CheckHeaderAction();
			action.bindGridEvent(blockedGrid, '1:2');
			blockedGrid[CHECK_HEADER_STATE_ID].block['1:2'] = true;
			blockedGrid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});

			expect(blockedGrid.writes).toEqual([]);
		});
	});
})();
