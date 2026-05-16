/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('NumberMap', function() {
		it('iterates matching keys in ascending numeric order', async function() {
			const {NumberMap} = await import('../../../js/internal/NumberMap.ts');
			const map = new NumberMap();
			const entries = [];

			map.put(10, 'ten');
			map.put(2, 'two');
			map.put(7, 'seven');
			map.put(4, 'four');
			map.each(3, 10, function(value, key) {
				entries.push([key, value]);
			});

			expect(entries).toEqual([
				[4, 'four'],
				[7, 'seven'],
				[10, 'ten'],
			]);
		});

		it('updates and removes keys without duplicating iteration entries', async function() {
			const {NumberMap} = await import('../../../js/internal/NumberMap.ts');
			const map = new NumberMap();
			const entries = [];

			map.put(3, 'old');
			map.put(3, 'new');
			map.put(1, 'one');
			map.remove(1);
			map.each(0, 5, function(value, key) {
				entries.push([key, value]);
			});

			expect(map.get(1)).toBeUndefined();
			expect(map.has(1)).toEqual(false);
			expect(map.get(3)).toEqual('new');
			expect(entries).toEqual([[3, 'new']]);
		});

		it('tracks keys independently from stored value nullishness', async function() {
			const {NumberMap} = await import('../../../js/internal/NumberMap.ts');
			const map = new NumberMap();
			const entries = [];

			map.put(0, null);
			map.put(1, 0);
			map.each(0, 1, function(value, key) {
				entries.push([key, value]);
			});

			expect(map.has(0)).toEqual(true);
			expect(map.has(1)).toEqual(true);
			expect(entries).toEqual([
				[0, null],
				[1, 0],
			]);
		});
	});
})();
