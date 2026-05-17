/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('EventTarget', function() {
		it('listens, fires, and unlistens by id', async function() {
			const {EventTarget} = await import('../../../js/core/EventTarget.ts');
			const target = new EventTarget();
			const calls = [];
			const id = target.listen('change', function(value) {
				calls.push(['first', value, this]);
				return 'result';
			});

			expect(target.hasListeners('change')).toEqual(true);
			expect(target.fireListeners('change', 1)).toEqual(['result']);

			target.unlisten(id);

			expect(target.hasListeners('change')).toEqual(false);
			expect(target.fireListeners('change', 2)).toEqual([]);
			expect(calls).toEqual([['first', 1, target]]);
		});

		it('removes a listener by function and keeps other listeners', async function() {
			const {EventTarget} = await import('../../../js/core/EventTarget.ts');
			const target = new EventTarget();
			const calls = [];
			const first = function(value) {
				calls.push(['first', value]);
			};
			const second = function(value) {
				calls.push(['second', value]);
			};

			target.addEventListener('change', first);
			target.addEventListener('change', second);
			expect(target.hasListeners('change')).toEqual(true);

			target.removeEventListener('change', first);
			expect(target.hasListeners('change')).toEqual(true);

			target.fireListeners('change', 1);

			expect(calls).toEqual([['second', 1]]);
			expect(target.hasListeners('change')).toEqual(true);
		});

		it('filters nullish listener results', async function() {
			const {EventTarget} = await import('../../../js/core/EventTarget.ts');
			const target = new EventTarget();

			target.listen('change', function() {
				return null;
			});
			expect(target.fireListeners('change')).toEqual([]);

			target.listen('change', function() {
				return undefined;
			});
			expect(target.fireListeners('change')).toEqual([]);

			target.listen('change', function() {
				return 0;
			});
			expect(target.fireListeners('change')).toEqual([0]);

			target.listen('change', function() {
				return false;
			});

			expect(target.fireListeners('change')).toEqual([0, false]);
		});

		it('does nothing after dispose', async function() {
			const {EventTarget} = await import('../../../js/core/EventTarget.ts');
			const target = new EventTarget();

			target.listen('change', function() {
				throw new Error('disposed listener should not fire');
			});
			target.dispose();

			expect(target.hasListeners('change')).toEqual(false);
			expect(target.fireListeners('change')).toEqual([]);
		});
	});
})();
