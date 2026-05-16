/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createGrid() {
		const host = document.createElement('div');
		const changes = [];
		const invalidates = [];
		const moves = [];
		return {
			host,
			changes,
			invalidates,
			moves,
			font: '12px sans-serif',
			keyboardOptions: {
				moveCellOnEnter: true,
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
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
			focus: function() {
				this.focused = true;
			},
			doChangeValue: function(col, row, fn) {
				changes.push([col, row, fn('old')]);
			},
			onKeyDownMove: function(event) {
				moves.push(event.keyCode);
			},
		};
	}

	function keyEvent(keyCode) {
		const event = new KeyboardEvent('keydown', {
			keyCode,
			which: keyCode,
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(event, 'keyCode', {value: keyCode});
		Object.defineProperty(event, 'which', {value: keyCode});
		return event;
	}

	function createEditor() {
		return {
			type: 'text',
			classList: ['dialog-class'],
			helperText: function(value, info) {
				return `${info.col}:${info.row}:${value}`;
			},
			inputValidator: function(value) {
				return value === 'bad' ? 'Input error' : '';
			},
			validator: function(value) {
				return value === 'reject' ? 'Rejected' : '';
			},
		};
	}

	describe('SmallDialogInputElement', function() {
		it('attaches dialog props, validates input, commits enter, and detaches', async function() {
			const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
			const grid = createGrid();
			const element = new SmallDialogInputElement();

			element.attach(grid, createEditor(), 1, 2, 'start');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});

			const dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			const input = dialog.querySelector('input');

			expect(dialog.classList.contains('dialog-class')).toEqual(true);
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--shown')).toEqual(true);
			expect(dialog.dataset.helperText).toEqual('1:2:start');
			expect(dialog.style.top).toEqual('10px');
			expect(dialog.style.left).toEqual('20px');
			expect(dialog.style.width).toEqual('100px');
			expect(input.style.height).toEqual('30px');
			expect(input.style.font).toEqual('12px sans-serif');
			expect(input.readOnly).toEqual(false);
			expect(input.tabIndex).toEqual(0);
			expect(input.value).toEqual('start');

			input.value = 'bad';
			input.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
			input.dispatchEvent(keyEvent(13));

			expect(dialog.dataset.helperText).toEqual('1:2:bad');
			expect(dialog.dataset.errorMessage).toEqual('Input error');
			expect(grid.changes).toEqual([]);
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--shown')).toEqual(true);

			input.value = 'good';
			input.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
			input.dispatchEvent(keyEvent(13));

			expect(dialog.dataset.errorMessage).toEqual(undefined);
			expect(grid.changes).toEqual([[1, 2, 'good']]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.focused).toEqual(true);
			expect(grid.moves).toEqual([13]);
			expect(input.readOnly).toEqual(true);
			expect(input.tabIndex).toEqual(-1);

			element.dispose();
		});

		it('clears previous props, exposes static attr binding, and cancels with escape', async function() {
			const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
			const grid = createGrid();
			const element = new SmallDialogInputElement();
			const inputForAttrs = document.createElement('input');

			SmallDialogInputElement.setInputAttrs({type: 'number'}, grid, inputForAttrs);
			expect(inputForAttrs.type).toEqual('number');

			element.attach(grid, {
				type: 'text',
				classList: ['first-class'],
				helperText: 'first helper',
			}, 1, 2, 'first');
			element.attach(grid, {
				type: 'search',
				classList: ['second-class'],
				helperText: 'second helper',
			}, 1, 2, 'second');

			const dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			const input = dialog.querySelector('input');

			expect(dialog.classList.contains('first-class')).toEqual(false);
			expect(dialog.classList.contains('second-class')).toEqual(true);
			expect(dialog.dataset.helperText).toEqual('second helper');
			expect(input.type).toEqual('search');

			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			input.dispatchEvent(keyEvent(27));

			expect(grid.changes).toEqual([]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.focused).toEqual(true);
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--hidden')).toEqual(true);

			element.dispose();
		});
	});
})();
