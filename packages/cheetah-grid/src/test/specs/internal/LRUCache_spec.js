/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('LRUCache', function() {
		it('evicts the least recently used key', async function() {
			const {LRUCache} = await import('../../../js/internal/LRUCache.ts');
			const cache = new LRUCache(2);

			cache.put('a', 'A');
			expect(cache.get('a')).toEqual('A');
			cache.put('b', 'B');
			expect(cache.get('a')).toEqual('A');
			cache.put('c', 'C');

			expect(cache.get('a')).toEqual('A');
			expect(cache.get('b')).toBeUndefined();
			expect(cache.get('c')).toEqual('C');
		});

		it('refreshes an existing key when it is replaced', async function() {
			const {LRUCache} = await import('../../../js/internal/LRUCache.ts');
			const cache = new LRUCache(2);

			cache.put('a', 'A');
			expect(cache.get('a')).toEqual('A');
			cache.put('b', 'B');
			expect(cache.get('b')).toEqual('B');

			cache.put('a', 'AA');
			expect(cache.get('a')).toEqual('AA');

			cache.put('c', 'C');

			expect(cache.get('a')).toEqual('AA');
			expect(cache.get('b')).toBeUndefined();
			expect(cache.get('c')).toEqual('C');
		});

		it('keeps falsy cached values addressable', async function() {
			const {LRUCache} = await import('../../../js/internal/LRUCache.ts');
			const cache = new LRUCache(2);

			cache.put('zero', 0);
			expect(cache.get('zero')).toEqual(0);
			cache.put('empty', '');
			expect(cache.get('zero')).toEqual(0);
			cache.put('next', 'next');

			expect(cache.get('zero')).toEqual(0);
			expect(cache.get('empty')).toBeUndefined();
			expect(cache.get('next')).toEqual('next');
		});
	});
})();
