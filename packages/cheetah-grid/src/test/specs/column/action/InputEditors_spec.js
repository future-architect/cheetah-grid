/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const actions = cheetahGrid.columns.action;

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
	});
})();
