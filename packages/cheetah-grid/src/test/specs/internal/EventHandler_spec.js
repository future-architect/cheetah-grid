/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('EventHandler', function() {
		it('registers and removes DOM event listeners', async function() {
			const {EventHandler} = await import('../../../js/internal/EventHandler.ts');
			const handler = new EventHandler();
			const target = new EventTarget();
			const calls = [];
			const listener = function(event) {
				calls.push(event.type);
			};
			const id = handler.on(target, 'change', listener);

			expect(handler.hasListener(target, 'change')).toEqual(true);

			target.dispatchEvent(new Event('change'));
			handler.off(id);
			target.dispatchEvent(new Event('change'));

			expect(calls).toEqual(['change']);
			expect(handler.hasListener(target, 'change')).toEqual(false);
		});

		it('fires once listeners once for custom targets', async function() {
			const {EventHandler} = await import('../../../js/internal/EventHandler.ts');
			const {EventTarget: CustomEventTarget} = await import('../../../js/core/EventTarget.ts');
			const handler = new EventHandler();
			const target = new CustomEventTarget();
			const calls = [];
			const listener = function(value) {
				calls.push(value);
			};

			handler.once(target, 'change', listener);
			handler.fire(target, 'change', 1);
			handler.fire(target, 'change', 2);

			expect(calls).toEqual([1]);
			expect(handler.hasListener(target, 'change')).toEqual(false);
		});

		it('temporarily removes matching events while a callback runs', async function() {
			const {EventHandler} = await import('../../../js/internal/EventHandler.ts');
			const handler = new EventHandler();
			const target = new EventTarget();
			const calls = [];
			const listener = function(event) {
				calls.push(event.type);
			};
			handler.on(target, 'change', listener);

			handler.tryWithOffEvents(target, 'change', function() {
				target.dispatchEvent(new Event('change'));
				expect(calls).toEqual([]);
			});

			target.dispatchEvent(new Event('change'));

			expect(calls).toEqual(['change']);
			expect(handler.hasListener(target, 'change')).toEqual(true);
		});

		it('restores temporarily removed events after callback errors', async function() {
			const {EventHandler} = await import('../../../js/internal/EventHandler.ts');
			const handler = new EventHandler();
			const target = new EventTarget();
			const calls = [];
			const listener = function(event) {
				calls.push(event.type);
			};
			handler.on(target, 'change', listener);

			expect(function() {
				handler.tryWithOffEvents(target, 'change', function() {
					throw new Error('failure');
				});
			}).toThrowError('failure');

			target.dispatchEvent(new Event('change'));

			expect(calls).toEqual(['change']);
		});

		it('clears all listeners and ignores empty off calls', async function() {
			const {EventHandler} = await import('../../../js/internal/EventHandler.ts');
			const handler = new EventHandler();
			const target = new EventTarget();
			const calls = [];
			const listener = function(event) {
				calls.push(event.type);
			};

			handler.on(target, 'change', listener);
			handler.off(null);
			handler.off(undefined);
			handler.clear();
			target.dispatchEvent(new Event('change'));

			expect(calls).toEqual([]);
			expect(handler.hasListener(target, 'change')).toEqual(false);
		});
	});
})();
