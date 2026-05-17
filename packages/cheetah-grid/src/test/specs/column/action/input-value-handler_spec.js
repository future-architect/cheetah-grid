/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('input-value-handler', function() {
		it('sets regular input values without changing number input type', async function() {
			const {setInputValue} = await import('../../../../js/columns/action/internal/input-value-handler.ts');
			const input = document.createElement('input');
			input.type = 'number';

			setInputValue(input, '123');

			expect(input.type).toEqual('number');
			expect(input.value).toEqual('123');
		});

		it('temporarily relaxes number inputs so a minus sign can be entered', async function() {
			const {setInputValue} = await import('../../../../js/columns/action/internal/input-value-handler.ts');
			const input = document.createElement('input');
			input.type = 'number';

			setInputValue(input, '-');
			expect(input.type).toEqual('text');
			expect(input.value).toEqual('-');

			input.dispatchEvent(new Event('input'));

			expect(input.type).toEqual('number');
		});

		it('normalizes nullish values to an empty string', async function() {
			const {setInputValue} = await import('../../../../js/columns/action/internal/input-value-handler.ts');
			const input = document.createElement('input');
			input.value = 'old';

			setInputValue(input, null);

			expect(input.value).toEqual('');
		});
	});
})();
