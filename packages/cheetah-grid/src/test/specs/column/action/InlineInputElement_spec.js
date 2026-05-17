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
			keyboardOptions: {
				moveCellOnEnter: true,
				moveCellOnTab: true,
			},
			font: '12px sans-serif',
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
				const value = fn('old');
				changes.push([col, row, value]);
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

	describe('InlineInputElement', function() {
		it('attaches, changes values, detaches, and disposes the input element', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {
				type: 'text',
				classList: ['inline-class'],
			}, 1, 2, 'value');
			const input = grid.host.querySelector('input');

			expect(input).not.toBeNull();
			expect(input.value).toEqual('value');
			expect(input.type).toEqual('text');
			expect(input.classList.contains('inline-class')).toEqual(true);
			expect(input.style.top).toEqual('10px');
			expect(input.style.left).toEqual('20px');
			expect(input.style.width).toEqual('100px');
			expect(input.style.height).toEqual('30px');

			input.value = 'changed';
			element.doChangeValue();
			expect(grid.changes).toEqual([[1, 2, 'changed']]);
			element.detach(true);

			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.focused).toEqual(true);
			expect(grid.host.children.length).toEqual(0);

			element.dispose();
		});

		it('commits and moves on enter keys', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {}, 1, 2, 'first');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			const firstInput = grid.host.querySelector('input');
			expect(firstInput.value).toEqual('first');
			firstInput.value = 'enter';
			firstInput.dispatchEvent(keyEvent(13));
			expect(grid.changes).toEqual([[1, 2, 'enter']]);
			expect(grid.moves).toEqual([13]);

			element.dispose();
		});

		it('commits and moves on tab keys', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {}, 1, 2, 'second');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			const secondInput = grid.host.querySelector('input');
			expect(secondInput.value).toEqual('second');
			secondInput.value = 'tab';
			secondInput.dispatchEvent(keyEvent(9));

			expect(grid.changes).toEqual([[1, 2, 'tab']]);
			expect(grid.moves).toEqual([9]);

			element.dispose();
		});

		it('ignores enter keys while the input is still attaching', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {}, 1, 2, 'start');
			const input = grid.host.querySelector('input');
			expect(input.value).toEqual('start');

			input.value = 'ignored';
			input.dispatchEvent(keyEvent(13));
			expect(grid.changes).toEqual([]);
			expect(grid.moves).toEqual([]);
			expect(grid.host.contains(input)).toEqual(true);

			element.dispose();
		});

		it('keeps composing input active and commits the value on blur', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {}, 1, 2, 'start');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			const input = grid.host.querySelector('input');
			expect(input.value).toEqual('start');

			input.dispatchEvent(new CompositionEvent('compositionstart', {bubbles: true}));
			expect(input.classList.contains('composition')).toEqual(true);
			input.value = 'composing';
			input.dispatchEvent(keyEvent(13));
			expect(grid.changes).toEqual([]);
			expect(grid.host.contains(input)).toEqual(true);

			input.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true}));
			expect(input.classList.contains('composition')).toEqual(false);
			input.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
			expect(grid.changes).toEqual([[1, 2, 'composing']]);
			expect(grid.host.children.length).toEqual(0);

			element.dispose();
		});

		it('ignores tab keys when tab movement is disabled', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();
			grid.keyboardOptions.moveCellOnTab = false;

			element.attach(grid, {}, 1, 2, 'start');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			const input = grid.host.querySelector('input');
			expect(input.value).toEqual('start');

			input.value = 'ignored';
			input.dispatchEvent(keyEvent(9));
			expect(grid.changes).toEqual([]);
			expect(grid.moves).toEqual([]);
			expect(grid.host.contains(input)).toEqual(true);

			element.dispose();
		});
	});
})();
