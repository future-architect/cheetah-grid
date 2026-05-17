/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('menu-items', function() {
		it('normalizes empty, object, string, and array options', async function() {
			const {normalize} = await import('../../../js/internal/menu-items.ts');

			expect(normalize()).toEqual([]);
			expect(normalize({a: 'A', b: 'B'})).toEqual([
				{value: 'a', label: 'A'},
				{value: 'b', label: 'B'},
			]);
			expect(normalize('{"x":"X"}')).toEqual([{value: 'x', label: 'X'}]);
			expect(normalize([
				{value: 'one', caption: 'One'},
				{value: 'two', label: 'Two'},
			])).toEqual([
				{value: 'one', caption: 'One', label: 'One'},
				{value: 'two', label: 'Two'},
			]);
		});

		it('normalizes static and record-dependent options as functions', async function() {
			const {normalizeToFn} = await import('../../../js/internal/menu-items.ts');
			const staticOptions = normalizeToFn({a: 'A'});
			expect(staticOptions()).toEqual([{value: 'a', label: 'A'}]);

			const dynamicOptions = normalizeToFn(function(record) {
				return record ? record.options : undefined;
			});

			expect(dynamicOptions({options: {b: 'B'}})).toEqual([{value: 'b', label: 'B'}]);
			expect(dynamicOptions()).toEqual([]);
		});
	});
})();
