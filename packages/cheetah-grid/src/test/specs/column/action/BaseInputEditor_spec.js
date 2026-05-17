/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
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
		return {
			listeners: {},
			selection: {
				select: {col: 1, row: 2},
				range: {
					start: {col: 1, row: 2},
					end: {col: 1, row: 2},
				},
			},
			record: {disabled: false, readOnly: false},
			changes,
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
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col: col + 1, row: row + 1},
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
			getCellRangeRect: function() {
				return {
					left: 15,
					top: 25,
					width: 60,
					height: 80,
				};
			},
			doChangeValue: function(col, row, fn) {
				changes.push([col, row, fn('old')]);
			},
		};
	}

	function createInput() {
		return {
			style: {
				top: '100px',
				left: '200px',
				width: '10px',
				height: '20px',
			},
		};
	}

	async function createEditorClass() {
		const {BaseInputEditor} = await import('../../../../js/columns/action/BaseInputEditor.ts');
		return class TestInputEditor extends BaseInputEditor {
			constructor(option) {
				super(option);
				this.calls = [];
				this.multiline = false;
			}
			clone() {
				const clone = new TestInputEditor(this);
				clone.multiline = this.multiline;
				return clone;
			}
			onInputCellInternal(_grid, cell, inputValue) {
				this.calls.push(['input', cell, inputValue]);
			}
			onOpenCellInternal(_grid, cell) {
				this.calls.push(['open', cell]);
			}
			onChangeSelectCellInternal(_grid, cell, selected) {
				this.calls.push(['select', cell, selected]);
			}
			onSetInputAttrsInternal(_grid, cell, input) {
				this.calls.push(['attrs', cell, Object.assign({}, input.style)]);
			}
			onGridScrollInternal() {
				this.calls.push(['scroll']);
			}
			onChangeDisabledInternal() {
				this.calls.push(['disabled']);
			}
			onChangeReadOnlyInternal() {
				this.calls.push(['readOnly']);
			}
			isSupportMultilineValue() {
				return this.multiline;
			}
		};
	}

	async function createBoundEditor(option) {
		const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
		const TestInputEditor = await createEditorClass();
		const editor = new TestInputEditor(option);
		const grid = createGrid();
		const ids = editor.bindGridEvent(grid, '1:2');
		return {DG_EVENT_TYPE, editor, grid, ids};
	}

	describe('BaseInputEditor', function() {
		it('returns the listener ids used to bind grid events', async function() {
			const {DG_EVENT_TYPE, ids} = await createBoundEditor();
			expect(ids).toEqual([
				DG_EVENT_TYPE.INPUT_CELL,
				DG_EVENT_TYPE.PASTE_CELL,
				DG_EVENT_TYPE.DBLCLICK_CELL,
				DG_EVENT_TYPE.DBLTAP_CELL,
				DG_EVENT_TYPE.KEYDOWN,
				DG_EVENT_TYPE.SELECTED_CELL,
				DG_EVENT_TYPE.SCROLL,
				DG_EVENT_TYPE.EDITABLEINPUT_CELL,
				DG_EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL,
			]);
		});

		it('binds input events for the target cell', async function() {
			const {DG_EVENT_TYPE, editor, grid} = await createBoundEditor();

			grid.listeners[DG_EVENT_TYPE.INPUT_CELL]({col: 9, row: 2, value: 'ignored'});
			expect(editor.calls).toEqual([]);
			grid.listeners[DG_EVENT_TYPE.INPUT_CELL]({col: 1, row: 2, value: 'typed'});
			expect(editor.calls).toEqual([
				['input', {col: 1, row: 2}, 'typed'],
			]);
		});

		it('binds single-value paste events for the target cell', async function() {
			const {DG_EVENT_TYPE, editor, grid} = await createBoundEditor();

			const pasteEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: false,
				normalizeValue: 'pasted',
				event: pasteEvent,
			});
			expect(pasteEvent).toMatchObject({prevented: true, stopped: true});
			expect(editor.calls).toEqual([
				['input', {col: 1, row: 2}, 'pasted'],
			]);

			const multiPasteEvent = createCancelableEvent();
			grid.listeners[DG_EVENT_TYPE.PASTE_CELL]({
				col: 1,
				row: 2,
				multi: true,
				normalizeValue: 'ignored',
				event: multiPasteEvent,
			});
			expect(multiPasteEvent).toMatchObject({prevented: false, stopped: false});
			expect(editor.calls).toEqual([
				['input', {col: 1, row: 2}, 'pasted'],
			]);
		});

		it('binds double click, double tap, and keydown events to open the cell', async function() {
			const {DG_EVENT_TYPE, editor, grid} = await createBoundEditor();

			const tapEvent = createCancelableEvent();
			const keyEvent = {
				keyCode: 113,
				stopped: false,
				stopCellMoving: function() {
					this.stopped = true;
				},
			};
			grid.listeners[DG_EVENT_TYPE.DBLCLICK_CELL]({col: 1, row: 2});
			expect(editor.calls).toEqual([
				['open', {col: 1, row: 2}],
			]);
			grid.listeners[DG_EVENT_TYPE.DBLTAP_CELL]({col: 1, row: 2, event: tapEvent});
			expect(tapEvent).toMatchObject({prevented: true, stopped: true});
			expect(editor.calls).toEqual([
				['open', {col: 1, row: 2}],
				['open', {col: 1, row: 2}],
			]);
			grid.listeners[DG_EVENT_TYPE.KEYDOWN](keyEvent);
			expect(keyEvent.stopped).toEqual(true);
			expect(editor.calls).toEqual([
				['open', {col: 1, row: 2}],
				['open', {col: 1, row: 2}],
				['open', {col: 1, row: 2}],
			]);
		});

		it('binds selection, scroll, editable checks, and editable input attributes', async function() {
			const {DG_EVENT_TYPE, editor, grid} = await createBoundEditor();

			grid.listeners[DG_EVENT_TYPE.SELECTED_CELL]({col: 1, row: 2, selected: true});
			expect(editor.calls).toEqual([
				['select', {col: 1, row: 2}, true],
			]);
			grid.listeners[DG_EVENT_TYPE.SCROLL]();
			expect(editor.calls).toEqual([
				['select', {col: 1, row: 2}, true],
				['scroll'],
			]);

			const input = createInput();
			expect(grid.listeners[DG_EVENT_TYPE.EDITABLEINPUT_CELL]({col: 1, row: 2})).toEqual(true);
			expect(grid.listeners[DG_EVENT_TYPE.EDITABLEINPUT_CELL]({col: 9, row: 2})).toEqual(false);
			grid.listeners[DG_EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL]({
				col: 1,
				row: 2,
				input,
			});

			expect(editor.calls).toEqual([
				['select', {col: 1, row: 2}, true],
				['scroll'],
				['attrs', {col: 1, row: 2}, {
					top: '105px',
					left: '205px',
					width: '60px',
					height: '80px',
				}],
			]);
		});

		it('respects readOnly and disabled predicates', async function() {
			const {DG_EVENT_TYPE} = await import('../../../../js/core/DG_EVENT_TYPE.ts');
			const TestInputEditor = await createEditorClass();
			const grid = createGrid();
			const editor = new TestInputEditor({
				readOnly: function(record) {
					return record.readOnly;
				},
				disabled: function(record) {
					return record.disabled;
				},
			});

			editor.bindGridEvent(grid, '1:2');
			grid.record.readOnly = true;
			grid.listeners[DG_EVENT_TYPE.INPUT_CELL]({col: 1, row: 2, value: 'ignored'});
			expect(grid.listeners[DG_EVENT_TYPE.EDITABLEINPUT_CELL]({col: 1, row: 2})).toEqual(false);

			grid.record.readOnly = false;
			grid.record.disabled = true;
			grid.listeners[DG_EVENT_TYPE.DBLCLICK_CELL]({col: 1, row: 2});
			expect(grid.listeners[DG_EVENT_TYPE.EDITABLEINPUT_CELL]({col: 1, row: 2})).toEqual(false);

			editor.readOnly = true;
			editor.disabled = true;
			expect(editor.calls).toEqual([
				['readOnly'],
				['disabled'],
			]);
		});

		it('pastes and deletes range box values through grid changes', async function() {
			const TestInputEditor = await createEditorClass();
			const grid = createGrid();
			const editor = new TestInputEditor();
			const multiline = new TestInputEditor();
			multiline.multiline = true;

			editor.onPasteCellRangeBox(grid, {col: 1, row: 2}, 'A\nB');
			expect(grid.changes).toEqual([[1, 2, 'A B']]);

			multiline.onPasteCellRangeBox(grid, {col: 2, row: 3}, 'A\nB');
			expect(grid.changes).toEqual([
				[1, 2, 'A B'],
				[2, 3, 'A\nB'],
			]);

			editor.onDeleteCellRangeBox(grid, {col: 1, row: 2});

			expect(grid.changes).toEqual([
				[1, 2, 'A B'],
				[2, 3, 'A\nB'],
				[1, 2, ''],
			]);
		});
	});
})();
