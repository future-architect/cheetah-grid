/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.columns.action;

	function createGrid() {
		const host = document.createElement('div');
		const changes = [];
		const invalidates = [];
		const disposables = [];
		return {
			host,
			changes,
			invalidates,
			disposables,
			font: '12px sans-serif',
			keyboardOptions: {
				moveCellOnEnter: true,
				moveCellOnTab: true,
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getAttachCellsArea: function() {
				return {
					element: host,
					rect: {
						top: 10,
						left: 20,
						width: 100,
						height: 30,
					},
				};
			},
			addDisposable: function(disposable) {
				disposables.push(disposable);
			},
			doGetCellValue: function(_col, _row, callback) {
				callback('opened');
			},
			doChangeValue: function(col, row, fn) {
				changes.push([col, row, fn('old')]);
			},
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
			focus: function() {
				this.focused = true;
			},
			onKeyDownMove: function() {
				// noop
			},
		};
	}

	describe('input editors', function() {
		it('clones inline input options and applies input attributes', function() {
			const editor = new actions.InlineInputEditor({
				classList: 'inline-editor',
				type: 'email',
			});
			const clone = editor.clone();
			const input = document.createElement('input');

			clone.classList = ['clone-editor'];
			clone.type = 'search';
			editor.onSetInputAttrsInternal({}, {col: 1, row: 2}, input);

			expect(editor.classList).toEqual(['inline-editor']);
			expect(editor.type).toEqual('email');
			expect(clone.classList).toEqual(['clone-editor']);
			expect(clone.type).toEqual('search');
			expect(input.classList.contains('inline-editor')).toEqual(true);
			expect(input.type).toEqual('email');
		});

		it('clones small dialog input options and exposes validators', function() {
			const helperText = function(value) {
				return `helper:${value}`;
			};
			const inputValidator = function(value) {
				return value ? '' : 'required';
			};
			const validator = function(value) {
				return value === 'ok' ? '' : 'invalid';
			};
			const editor = new actions.SmallDialogInputEditor({
				classList: ['dialog-editor'],
				type: 'number',
				helperText,
				inputValidator,
				validator,
			});
			const clone = editor.clone();
			const input = document.createElement('input');

			clone.classList = ['clone-dialog'];
			clone.type = 'text';
			editor.onSetInputAttrsInternal({}, {col: 1, row: 2}, input);

			expect(editor.classList).toEqual(['dialog-editor']);
			expect(editor.type).toEqual('number');
			expect(editor.helperText).toBe(helperText);
			expect(editor.inputValidator).toBe(inputValidator);
			expect(editor.validator).toBe(validator);
			expect(clone.classList).toEqual(['clone-dialog']);
			expect(clone.type).toEqual('text');
			expect(clone.helperText).toBe(helperText);
			expect(clone.inputValidator).toBe(inputValidator);
			expect(clone.validator).toBe(validator);
			expect(input.className).toEqual('');
			expect(input.type).toEqual('number');
		});

		it('attaches inline input editors, commits on selection change, and disposes shared state', function() {
			const grid = createGrid();
			const editor = new actions.InlineInputEditor({
				classList: 'inline-editor',
				type: 'text',
			});
			const cell = {col: 1, row: 2};

			editor.onInputCellInternal(grid, cell, 'input');
			const input = grid.host.querySelector('input');
			input.value = 'changed';
			editor.onChangeSelectCellInternal(grid, cell, false);

			expect(grid.changes).toEqual([[1, 2, 'changed']]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.host.children.length).toEqual(0);

			grid.disposables.forEach(function(disposable) {
				disposable.dispose();
			});
		});

		it('opens and cancels small dialog input editors through grid lifecycle hooks', function() {
			const grid = createGrid();
			const editor = new actions.SmallDialogInputEditor({
				classList: 'dialog-editor',
				type: 'text',
				helperText: 'helper',
			});
			const cell = {col: 1, row: 2};

			editor.onOpenCellInternal(grid, cell);
			let dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			let input = dialog.querySelector('input');

			expect(input.value).toEqual('opened');
			expect(dialog.classList.contains('dialog-editor')).toEqual(true);
			expect(dialog.dataset.helperText).toEqual('helper');

			editor.onGridScrollInternal(grid);

			expect(grid.focused).toEqual(true);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--hidden')).toEqual(true);

			editor.onInputCellInternal(grid, cell, 'disabled');
			editor.onChangeDisabledInternal();
			editor.onInputCellInternal(grid, cell, 'readonly');
			editor.onChangeReadOnlyInternal();
			dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			input = dialog.querySelector('input');

			expect(input.readOnly).toEqual(true);
			expect(grid.invalidates.length).toEqual(3);

			grid.disposables.forEach(function(disposable) {
				disposable.dispose();
			});
		});
	});
})();
