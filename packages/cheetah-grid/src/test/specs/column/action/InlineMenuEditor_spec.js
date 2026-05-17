/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.columns.action;
	const {MenuColumn} = cheetahGrid.columns.type;

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
			record: {id: 1},
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
			getRowRecord: function() {
				return this.record;
			},
			getColumnType: function() {
				return new MenuColumn({
					options: {
						b: 'Beta',
					},
				});
			},
			getColumnDefine: function(col, row) {
				return {field: `${col}:${row}`};
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			doChangeValue: function(col, row, fn) {
				const value = fn('old');
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

	function createEditor() {
		return new actions.InlineMenuEditor({
			classList: 'menu-editor',
			options: [
				{value: '', label: 'Empty'},
				{value: 'a', label: 'Alpha'},
				{value: 'b', label: 'Bee'},
			],
		});
	}

	describe('InlineMenuEditor', function() {
		async function createBoundInlineMenuEditor() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const editor = createEditor();
			editor.bindGridEvent(grid, '1:2');
			return {DG_EVENT_TYPE, editor, grid};
		}

		it('normalizes options, class lists, and clones independently', function() {
			const editor = createEditor();
			const clone = editor.clone();

			expect(editor.classList).toEqual(['menu-editor']);
			expect(editor.options({id: 1})).toEqual([
				{value: '', label: 'Empty'},
				{value: 'a', label: 'Alpha'},
				{value: 'b', label: 'Bee'},
			]);

			clone.classList = ['clone-menu'];
			clone.options = {c: 'Charlie'};

			expect(editor.classList).toEqual(['menu-editor']);
			expect(clone.classList).toEqual(['clone-menu']);
			expect(editor.options()).toEqual([
				{value: '', label: 'Empty'},
				{value: 'a', label: 'Alpha'},
				{value: 'b', label: 'Bee'},
			]);
			expect(clone.options()).toEqual([{value: 'c', label: 'Charlie'}]);
		});

		it('pastes direct and caption values', function() {
			const grid = createGrid();
			const editor = createEditor();
			const rejected = [];
			const context = {
				reject: function() {
					rejected.push('rejected');
				},
			};

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'b', context);
			expect(grid.changes).toEqual([[1, 2, 'b']]);
			expect(rejected).toEqual([]);

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'Beta', context);
			expect(grid.changes).toEqual([
				[1, 2, 'b'],
				[1, 2, 'b'],
			]);
			expect(rejected).toEqual([]);
		});

		it('rejects unknown pasted values and deletes to empty options', function() {
			const grid = createGrid();
			const editor = createEditor();
			const rejected = [];
			const context = {
				reject: function() {
					rejected.push('rejected');
				},
			};

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'missing', context);
			expect(grid.changes).toEqual([]);
			expect(rejected).toEqual(['rejected']);

			editor.onDeleteCellRangeBox(grid, {col: 1, row: 2});

			expect(grid.changes).toEqual([[1, 2, '']]);
			expect(rejected).toEqual(['rejected']);
		});

		it('returns listener ids for inline menu editor events', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const grid = createGrid();
			const editor = createEditor();

			const ids = editor.bindGridEvent(grid, '1:2');
			expect(ids).toEqual([
				DG_EVENT_TYPE.CLICK_CELL,
				DG_EVENT_TYPE.KEYDOWN,
				DG_EVENT_TYPE.SELECTED_CELL,
				DG_EVENT_TYPE.SCROLL,
				DG_EVENT_TYPE.MOUSEOVER_CELL,
				DG_EVENT_TYPE.MOUSEMOVE_CELL,
				DG_EVENT_TYPE.MOUSEOUT_CELL,
				DG_EVENT_TYPE.PASTE_CELL,
			]);
		});

		it('binds hover events with cursor updates', async function() {
			const {DG_EVENT_TYPE, grid} = await createBoundInlineMenuEditor();

			grid.listeners[DG_EVENT_TYPE.MOUSEOVER_CELL]({col: 1, row: 2});
			expect(grid.invalidates).toEqual([]);
			expect(grid.element.style.cursor).toEqual('pointer');

			grid.listeners[DG_EVENT_TYPE.MOUSEOUT_CELL]({col: 1, row: 2});
			expect(grid.invalidates).toEqual([]);
			expect(grid.element.style.cursor).toEqual('');
		});

		it('binds accepted paste events and cancels them', async function() {
			const {DG_EVENT_TYPE, grid} = await createBoundInlineMenuEditor();

			const pasteEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'Beta',
				event: pasteEvent,
			});
			expect(grid.changes).toEqual([[1, 2, 'b']]);
			expect(pasteEvent).toMatchObject({prevented: true, stopped: true});
		});

		it('rejects unknown bound paste events without cancelling them', async function() {
			const {DG_EVENT_TYPE, grid} = await createBoundInlineMenuEditor();

			const rejectEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'missing',
				event: rejectEvent,
			});
			expect(grid.rejected[0][0]).toEqual('rejected_paste_values');
			expect(rejectEvent).toMatchObject({prevented: false, stopped: false});
			expect(grid.changes).toEqual([]);
			expect(grid.rejected[0][1].detail[0]).toMatchObject({
				col: 1,
				row: 2,
				record: {id: 1},
				define: {field: '1:2'},
				pasteValue: 'missing',
			});
		});
	});
})();
