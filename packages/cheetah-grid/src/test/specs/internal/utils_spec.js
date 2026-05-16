/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	describe('utils', function() {
		it('iterates object keys', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const entries = [];

			utils.each({a: 1, b: 2}, function(value, key) {
				entries.push([key, value]);
			});

			expect(entries).toEqual([
				['a', 1],
				['b', 2],
			]);
		});

		it('creates live omitted and defaulted object views', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const source = {a: 1, b: undefined, c: 3};
			const omitted = utils.omit(source, ['c']);
			const defaulted = utils.defaults(source, {b: 2, d: 4});

			expect(omitted).toEqual({a: 1, b: undefined});
			expect(defaulted).toEqual({a: 1, b: 2, c: 3, d: 4});

			omitted.a = 10;
			defaulted.b = 20;

			expect(source.a).toEqual(10);
			expect(source.b).toEqual(20);
			expect(defaulted.b).toEqual(20);
		});

		it('extends objects as live views and lets later sources win duplicated keys', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const first = {a: 1, same: 'first'};
			const second = {b: 2, same: 'second'};
			const extended = utils.extend(first, second);

			expect(extended).toEqual({a: 1, same: 'second', b: 2});

			extended.a = 10;
			extended.same = 'updated';

			expect(first.a).toEqual(10);
			expect(first.same).toEqual('first');
			expect(second.same).toEqual('updated');
		});

		it('safely gets and applies chained properties', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const source = {a: {b: {c: 3}}};

			expect(utils.getChainSafe(source, 'a', 'b', 'c')).toEqual(3);
			expect(utils.getChainSafe(source, 'a', 'x', 'c')).toBeUndefined();
			expect(utils.applyChainSafe(source, function(value, key) {
				return value[key.toLowerCase()];
			}, 'A', 'B', 'C')).toEqual(3);
		});

		it('gets static values or applies functions', async function() {
			const {utils} = await import('./utils-test-module.mjs');

			expect(utils.getOrApply('value', 1, 2)).toEqual('value');
			expect(utils.getOrApply(function(a, b) {
				return a + b;
			}, 1, 2)).toEqual(3);
			expect(utils.getOrApply(null, 1, 2)).toEqual(null);
			expect(utils.getOrApply(undefined, 1, 2)).toBeUndefined();
		});

		it('chains sync and promise values', async function() {
			const {utils} = await import('./utils-test-module.mjs');

			expect(utils.then(1, function(value) {
				return value + 1;
			})).toEqual(2);
			await expect(utils.then(Promise.resolve(1), function(value) {
				return value + 1;
			})).resolves.toEqual(2);
		});

		it('finds values ignoring key case', async function() {
			const {utils} = await import('./utils-test-module.mjs');

			expect(utils.getIgnoreCase({Name: 'Cheetah'}, 'name')).toEqual('Cheetah');
			expect(utils.getIgnoreCase({name: 'Grid'}, 'NAME')).toEqual('Grid');
			expect(utils.getIgnoreCase({other: 'value'}, 'name')).toBeUndefined();
		});

		it('compares cells and ranges', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const range = {
				start: {col: 1, row: 2},
				end: {col: 3, row: 4},
			};

			expect(utils.cellEquals({col: 1, row: 2}, {col: 1, row: 2})).toEqual(true);
			expect(utils.cellEquals({col: 1, row: 2}, {col: 2, row: 2})).toEqual(false);
			expect(utils.cellInRange(range, 1, 2)).toEqual(true);
			expect(utils.cellInRange(range, 3, 4)).toEqual(true);
			expect(utils.cellInRange(range, 0, 2)).toEqual(false);
			expect(utils.cellInRange(range, 2, 5)).toEqual(false);
		});

		it('splits strings into characters and words', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const chars = utils.str.genChars('A\r\n😀B');
			const words = utils.str.genWords('abc あいう 123');

			expect([chars.next(), chars.next(), chars.next(), chars.next(), chars.next()]).toEqual([
				'A',
				'\r\n',
				'😀',
				'B',
				null,
			]);
			expect([words.next(), words.next(), words.next(), words.next(), words.next()]).toEqual([
				'abc',
				' ',
				'あいう',
				' ',
				'123',
			]);
			expect(words.next()).toEqual(null);
		});

		it('checks string suffixes and box arrays', async function() {
			const {utils} = await import('./utils-test-module.mjs');

			expect(utils.str.endsWith('cheetah-grid', 'grid')).toEqual(true);
			expect(utils.str.endsWith('cheetah-grid', 'cheetah', 7)).toEqual(true);
			expect(utils.str.endsWith('cheetah-grid', 'grid', 7)).toEqual(false);
			expect(utils.style.toBoxArray(1)).toEqual([1, 1, 1, 1]);
			expect(utils.style.toBoxArray([1])).toEqual([1, 1, 1, 1]);
			expect(utils.style.toBoxArray([1, 2])).toEqual([1, 2, 1, 2]);
			expect(utils.style.toBoxArray([1, 2, 3])).toEqual([1, 2, 3, 2]);
			expect(utils.style.toBoxArray([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
		});

		it('normalizes keyboard, touch, and cancel events', async function() {
			const {utils} = await import('./utils-test-module.mjs');
			const event = {
				preventDefaultCalled: 0,
				stopPropagationCalled: 0,
				preventDefault: function() {
					this.preventDefaultCalled++;
				},
				stopPropagation: function() {
					this.stopPropagationCalled++;
				},
			};

			expect(utils.event.getKeyCode({keyCode: 13, which: 10})).toEqual(13);
			expect(utils.event.getKeyCode({keyCode: 0, which: 10})).toEqual(10);
			expect(utils.event.isTouchEvent({changedTouches: []})).toEqual(true);
			expect(utils.event.isTouchEvent({button: 0})).toEqual(false);

			utils.event.cancel(event);

			expect(event.preventDefaultCalled).toEqual(1);
			expect(event.stopPropagationCalled).toEqual(1);
		});
	});
})();
