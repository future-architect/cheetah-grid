/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createGrid() {
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
			listen: function(type, listener) {
				this.listeners[type] = listener;
				return type;
			},
			getLayoutCellId: function(col, row) {
				return `${col}:${row}`;
			},
			getRowRecord: function() {
				return this.record;
			},
			getElement: function() {
				return this.element;
			},
		};
	}

	describe('actionBind', function() {
		it('binds click and pointer actions for target cells and areas', async function() {
			const actionBind = await import('../../../../js/columns/action/actionBind.ts');
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const actions = [];
			const overs = [];
			const outs = [];

			const ids = actionBind.bindCellClickAction(grid, '1:2', {
				action: function(cell) {
					actions.push(cell);
				},
				mouseOver: function(cell) {
					overs.push(cell);
					return true;
				},
				mouseOut: function(cell) {
					outs.push(cell);
				},
				area: function(e) {
					return e.inArea;
				},
			});

			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2, inArea: true});
			grid.listeners[DG_EVENT_TYPE.MOUSEMOVE_CELL]({col: 1, row: 2, inArea: false});
			grid.listeners[DG_EVENT_TYPE.MOUSEMOVE_CELL]({col: 1, row: 2, inArea: true});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2, inArea: true});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 3, inArea: true});
			grid.selection.select = {col: 0, row: 0};
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2, inArea: true});

			expect(ids).toEqual([
				DG_EVENT_TYPE.CLICK_CELL,
				DG_EVENT_TYPE.MOUSEOVER_CELL,
				DG_EVENT_TYPE.MOUSEOUT_CELL,
				DG_EVENT_TYPE.MOUSEMOVE_CELL,
			]);
			expect(overs).toEqual([
				{col: 1, row: 2},
				{col: 1, row: 2},
			]);
			expect(outs).toEqual([{col: 1, row: 2}]);
			expect(actions).toEqual([{col: 1, row: 2}]);
			expect(grid.element.style.cursor).toEqual('pointer');
		});

		it('skips click actions while records are pending', async function() {
			const actionBind = await import('../../../../js/columns/action/actionBind.ts');
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const actions = [];
			grid.record = Promise.resolve({id: 1});

			actionBind.bindCellClickAction(grid, '1:2', {
				action: function(cell) {
					actions.push(cell);
				},
			});
			grid.listeners[DG_EVENT_TYPE.CLICK_CELL]({col: 1, row: 2});

			expect(actions).toEqual([]);
		});

		it('binds keyboard actions and cancels accepted keyboard events', async function() {
			const actionBind = await import('../../../../js/columns/action/actionBind.ts');
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const actions = [];
			const event = {
				preventDefaultCalled: 0,
				stopPropagationCalled: 0,
				preventDefault: function() {
					this.preventDefaultCalled++;
				},
				stopPropagation: function() {
					this.stopPropagationCalled++;
				},
			};

			const ids = actionBind.bindCellKeyAction(grid, '1:2', {
				action: function(cell) {
					actions.push(cell);
				},
				acceptKeys: [65],
			});

			grid.keyboardOptions.moveCellOnEnter = true;
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({keyCode: 13, event});
			grid.keyboardOptions.moveCellOnEnter = false;
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({keyCode: 65, event});
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({keyCode: 32, event});
			grid.selection.select = {col: 9, row: 9};
			grid.listeners[DG_EVENT_TYPE.KEYDOWN]({keyCode: 32, event});

			expect(ids).toEqual([DG_EVENT_TYPE.KEYDOWN]);
			expect(actions).toEqual([
				{col: 1, row: 2},
				{col: 1, row: 2},
			]);
			expect(event.preventDefaultCalled).toEqual(2);
			expect(event.stopPropagationCalled).toEqual(2);
		});
	});
})();
