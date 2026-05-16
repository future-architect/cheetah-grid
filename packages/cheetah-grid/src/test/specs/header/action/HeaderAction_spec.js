/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.headers.action;

	function createGrid() {
		const sorts = [];
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
			sortState: {col: 1, row: 2, order: 'asc'},
			recordRowCount: 10,
			frozenRowCount: 1,
			colCount: 5,
			rowCount: 6,
			dataSource: {
				length: 1,
				get: function() {
					return {field: 'value'};
				},
				sort: function(field, order) {
					sorts.push([field, order]);
				},
			},
			sorts,
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
			getField: function(col, row) {
				return `field:${col}:${row}`;
			},
			invalidateGridRect: function(left, top, right, bottom) {
				invalidates.push([left, top, right, bottom]);
			},
		};
	}

	describe('header actions', function() {
		it('resolves built-in actions and custom instances', function() {
			const custom = new actions.SortHeaderAction();

			expect(actions.of()).toBeUndefined();
			expect(actions.of('sort')).toBe(actions.of('SORT'));
			expect(actions.of('check')).toBe(actions.of('CHECK'));
			expect(actions.of('missing')).toBeUndefined();
			expect(actions.of(custom)).toBe(custom);
		});

		it('resolves cell actions from sort definitions before headerAction', function() {
			const sortAction = actions.ofCell({sort: true, headerAction: 'check'});
			const stringSortAction = actions.ofCell({sort: 'name'});
			const customSortAction = actions.ofCell({
				sort: function() {
					// noop
				},
			});

			expect(sortAction).toBe(actions.of('sort'));
			expect(stringSortAction.sort).toEqual('name');
			expect(customSortAction.sort).toBeTypeOf('function');
			expect(actions.ofCell({headerAction: 'check'})).toBe(actions.of('check'));
			expect(actions.ofCell({})).toBeUndefined();
		});

		it('clones base and sort actions independently', function() {
			const base = new actions.BaseAction({disabled: true});
			const sort = new actions.SortHeaderAction({sort: 'name'});
			const baseClone = base.clone();
			const sortClone = sort.clone();

			baseClone.disabled = false;
			sortClone.sort = 'age';

			expect(base.disabled).toEqual(true);
			expect(baseClone.disabled).toEqual(false);
			expect(sort.sort).toEqual('name');
			expect(sortClone.sort).toEqual('age');
		});

		it('executes custom, explicit field, and inferred field sort definitions', function() {
			const calls = [];
			const grid = createGrid();
			const custom = new actions.SortHeaderAction({
				sort: function(info) {
					calls.push(info);
				},
			});
			const explicit = new actions.SortHeaderAction({sort: 'name'});
			const inferred = new actions.SortHeaderAction();

			custom._executeSort({col: 2, row: 3, order: 'desc'}, grid);
			explicit._executeSort({col: 2, row: 3, order: 'asc'}, grid);
			inferred._executeSort({col: 2, row: 3, order: 'desc'}, grid);

			expect(calls).toEqual([{
				order: 'desc',
				col: 2,
				row: 3,
				grid,
			}]);
			expect(grid.sorts).toEqual([
				['name', 'asc'],
				['field:2:4', 'desc'],
			]);
		});

		it('binds click actions that toggle sort order and invalidate the grid', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const action = new actions.SortHeaderAction({sort: 'name'});

			const ids = action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});

			expect(ids).toEqual([
				DG_EVENT_TYPE.CLICK_CELL,
				DG_EVENT_TYPE.MOUSEOVER_CELL,
				DG_EVENT_TYPE.MOUSEMOVE_CELL,
				DG_EVENT_TYPE.MOUSEOUT_CELL,
			]);
			expect(grid.sortState).toEqual({col: 1, row: 2, order: 'desc'});
			expect(grid.sorts).toEqual([['name', 'desc']]);
			expect(grid.invalidates).toEqual([[0, 0, 4, 5]]);
			expect(grid.element.style.cursor).toEqual('');
		});

		it('does not sort while disabled', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const action = new actions.SortHeaderAction({
				disabled: true,
				sort: 'name',
			});

			action.bindGridEvent(grid, '1:2');
			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});

			expect(grid.sortState).toEqual({col: 1, row: 2, order: 'asc'});
			expect(grid.sorts).toEqual([]);
			expect(grid.element.style.cursor).toEqual('');
		});
	});
})();
