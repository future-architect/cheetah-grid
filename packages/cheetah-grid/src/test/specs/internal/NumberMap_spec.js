/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('NumberMap', function() {
		it('iterates matching keys in ascending numeric order', async function() {
			const {NumberMap} = await import('../../../js/internal/NumberMap.ts');
			const map = new NumberMap();
			const entries = [];

			map.put(10, 'ten');
			expect(map.get(10)).toEqual('ten');
			map.put(2, 'two');
			expect(map.get(2)).toEqual('two');
			map.put(7, 'seven');
			expect(map.get(7)).toEqual('seven');
			map.put(4, 'four');
			expect(map.get(4)).toEqual('four');
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
			expect(map.get(3)).toEqual('old');
			map.put(3, 'new');
			expect(map.get(3)).toEqual('new');
			map.put(1, 'one');
			expect(map.has(1)).toEqual(true);
			map.remove(1);
			expect(map.has(1)).toEqual(false);
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
			expect(map.has(0)).toEqual(true);

			map.put(1, 0);
			expect(map.has(1)).toEqual(true);

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
