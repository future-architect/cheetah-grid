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
			element.detach(true);

			expect(grid.changes).toEqual([[1, 2, 'changed']]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.focused).toEqual(true);
			expect(grid.host.children.length).toEqual(0);

			element.dispose();
		});

		it('commits and moves on enter and tab keys', async function() {
			const {InlineInputElement} = await import('../../../../js/columns/action/internal/InlineInputElement.ts');
			const grid = createGrid();
			const element = new InlineInputElement();

			element.attach(grid, {}, 1, 2, 'first');
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			const firstInput = grid.host.querySelector('input');
			firstInput.value = 'enter';
			firstInput.dispatchEvent(keyEvent(13));

			element.attach(grid, {}, 1, 2, 'second');
			const secondInput = grid.host.querySelector('input');
			secondInput.value = 'tab';
			secondInput.dispatchEvent(keyEvent(9));

			expect(grid.changes).toEqual([
				[1, 2, 'enter'],
				[1, 2, 'tab'],
			]);
			expect(grid.moves).toEqual([13, 9]);

			element.dispose();
		});
	});
})();
