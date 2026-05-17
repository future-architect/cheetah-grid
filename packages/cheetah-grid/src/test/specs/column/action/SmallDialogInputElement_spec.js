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
	function nextTick() {
		return new Promise(function(resolve) {
			setTimeout(resolve);
		});
	}

	async function createAttachedDialog(value) {
		const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
		const grid = createGrid();
		const element = new SmallDialogInputElement();
		element.attach(grid, createEditor(), 1, 2, value);
		await nextTick();

		const dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
		const input = dialog.querySelector('input');
		return {dialog, element, grid, input};
	}

	describe('SmallDialogInputElement', function() {
		it('attaches dialog props and input state', async function() {
			const {dialog, element, input} = await createAttachedDialog('start');

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

			element.dispose();
		});

		it('keeps the dialog open when input validation fails', async function() {
			const {dialog, element, grid, input} = await createAttachedDialog('start');

			input.value = 'bad';
			input.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
			expect(dialog.dataset.helperText).toEqual('1:2:bad');
			input.dispatchEvent(keyEvent(13));

			expect(dialog.dataset.helperText).toEqual('1:2:bad');
			expect(dialog.dataset.errorMessage).toEqual('Input error');
			expect(grid.changes).toEqual([]);
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--shown')).toEqual(true);

			element.dispose();
		});

		it('commits valid enter input and detaches dialog editing state', async function() {
			const {dialog, element, grid, input} = await createAttachedDialog('start');

			input.value = 'good';
			input.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
			expect(dialog.dataset.errorMessage).toEqual(undefined);
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
			expect(dialog.classList.contains('cheetah-grid__small-dialog-input--shown')).toEqual(false);

			element.dispose();
		});

		it('exposes static attr binding', async function() {
			const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
			const grid = createGrid();
			const inputForAttrs = document.createElement('input');

			SmallDialogInputElement.setInputAttrs({type: 'number'}, grid, inputForAttrs);
			expect(inputForAttrs.type).toEqual('number');
		});

		it('clears previous props when reattached', async function() {
			const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
			const grid = createGrid();
			const element = new SmallDialogInputElement();

			element.attach(grid, {
				type: 'text',
				classList: ['first-class'],
				helperText: 'first helper',
			}, 1, 2, 'first');
			let dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			expect(dialog.classList.contains('first-class')).toEqual(true);
			expect(dialog.dataset.helperText).toEqual('first helper');

			element.attach(grid, {
				type: 'search',
				classList: ['second-class'],
				helperText: 'second helper',
			}, 1, 2, 'second');

			dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			const input = dialog.querySelector('input');

			expect(dialog.classList.contains('first-class')).toEqual(false);
			expect(dialog.classList.contains('second-class')).toEqual(true);
			expect(dialog.dataset.helperText).toEqual('second helper');
			expect(input.type).toEqual('search');

			element.dispose();
		});

		it('cancels editing with escape', async function() {
			const {SmallDialogInputElement} = await import('../../../../js/columns/action/internal/SmallDialogInputElement.ts');
			const grid = createGrid();
			const element = new SmallDialogInputElement();
			element.attach(grid, createEditor(), 1, 2, 'start');
			expect(grid.host.querySelector('.cheetah-grid__small-dialog-input')).not.toBeNull();
			await nextTick();
			const dialog = grid.host.querySelector('.cheetah-grid__small-dialog-input');
			const input = dialog.querySelector('input');
			expect(input.value).toEqual('start');

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
