/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createGrid(overflowText) {
		return {
			listeners: {},
			selection: {
				select: {col: 0, row: 0},
			},
			listen: function(type, listener) {
				this.listeners[type] = listener;
			},
			getCellOverflowText: function(col, row) {
				return overflowText[`${col}:${row}`];
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col: col + 1, row: row + 1},
				};
			},
		};
	}

	function createTooltipInstance() {
		return {
			attaches: [],
			moves: [],
			detaches: 0,
			disposes: 0,
			attachTooltipElement: function(col, row, content) {
				this.attaches.push([col, row, content]);
			},
			moveTooltipElement: function(col, row) {
				this.moves.push([col, row]);
			},
			detachTooltipElement: function() {
				this.detaches++;
			},
			dispose: function() {
				this.disposes++;
			},
		};
	}

	describe('TooltipHandler', function() {
		it('attaches, moves, and detaches overflow text tooltips', async function() {
			const {TooltipHandler} = await import('../../../js/tooltip/TooltipHandler.ts');
			const grid = createGrid({'1:2': 'Overflow'});
			const handler = new TooltipHandler(grid);
			const tooltip = createTooltipInstance();
			handler._tooltipInstances['overflow-text'] = tooltip;

			handler._attach(1, 2);
			handler._move(1, 2);
			handler._move(3, 2);
			handler._detach();
			handler._detach();

			expect(tooltip.attaches).toEqual([[1, 2, 'Overflow']]);
			expect(tooltip.moves).toEqual([[1, 2]]);
			expect(tooltip.detaches).toEqual(1);
			expect(handler._isAttachCell(1, 2)).toEqual(false);
		});

		it('detaches the current tooltip when a new cell has no tooltip', async function() {
			const {TooltipHandler} = await import('../../../js/tooltip/TooltipHandler.ts');
			const grid = createGrid({'1:2': 'Overflow'});
			const handler = new TooltipHandler(grid);
			const tooltip = createTooltipInstance();
			handler._tooltipInstances['overflow-text'] = tooltip;

			handler._attach(1, 2);
			handler._attach(4, 4);

			expect(tooltip.attaches).toEqual([[1, 2, 'Overflow']]);
			expect(tooltip.detaches).toEqual(1);
		});

		it('responds to grid mouse, selection, scroll, and changed-value events', async function() {
			const {TooltipHandler} = await import('../../../js/tooltip/TooltipHandler.ts');
			const {LG_EVENT_TYPE} = await import('../../../js/list-grid/LG_EVENT_TYPE.ts');
			const overflowText = {'1:2': 'Overflow'};
			const grid = createGrid(overflowText);
			const handler = new TooltipHandler(grid);
			const tooltip = createTooltipInstance();
			handler._tooltipInstances['overflow-text'] = tooltip;

			grid.listeners[LG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			grid.listeners[LG_EVENT_TYPE.SCROLL]();
			grid.listeners[LG_EVENT_TYPE.MOUSEOUT_CELL]({
				col: 1,
				row: 2,
				related: {col: 1, row: 2},
			});
			grid.listeners[LG_EVENT_TYPE.SELECTED_CELL]({col: 1, row: 2});
			grid.listeners[LG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			overflowText['1:2'] = null;
			grid.listeners[LG_EVENT_TYPE.CHANGED_VALUE]({col: 1, row: 2});

			expect(tooltip.attaches).toEqual([
				[1, 2, 'Overflow'],
				[1, 2, 'Overflow'],
			]);
			expect(tooltip.moves).toEqual([[1, 2]]);
			expect(tooltip.detaches).toEqual(2);
		});
	});
})();
