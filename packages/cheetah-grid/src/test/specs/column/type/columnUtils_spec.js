/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('columnUtils', function() {
		it('loads normalized icons and tests icon fonts', async function() {
			const columnUtils = await import('../../../../js/columns/type/columnUtils.ts');
			const calls = [];
			const context = {
				toCurrentContext: function() {
					return this;
				},
			};
			const helper = {
				testFontLoad: function(font, content, ctx) {
					calls.push([font, content, ctx]);
				},
			};
			let callbackIcons;
			let callbackContext;

			columnUtils.loadIcons({
				font: '16px sans-serif',
				content: 'A',
				color: 'red',
			}, context, helper, function(icons, ctx) {
				callbackIcons = icons;
				callbackContext = ctx;
			});

			expect(calls).toEqual([['16px sans-serif', 'A', context]]);
			expect(callbackIcons).toEqual([{
				content: 'A',
				font: '16px sans-serif',
				color: 'red',
				width: undefined,
				src: undefined,
				svg: undefined,
				name: undefined,
				path: undefined,
				tagName: undefined,
				isLiga: undefined,
				offsetTop: undefined,
				offsetLeft: undefined,
			}]);
			expect(callbackContext).toBe(context);
		});

		it('loads promise icons with the current context', async function() {
			const columnUtils = await import('../../../../js/columns/type/columnUtils.ts');
			const currentContext = {};
			const context = {
				toCurrentContext: function() {
					return currentContext;
				},
			};
			const helper = {
				testFontLoad: function() {
					// noop
				},
			};
			const callbacks = [];

			columnUtils.loadIcons(Promise.resolve({name: 'arrow_upward'}), context, helper, function(icons, ctx) {
				callbacks.push([icons, ctx]);
			});

			expect(callbacks).toEqual([[undefined, context]]);
			await Promise.resolve();
			expect(callbacks).toEqual([
				[undefined, context],
				[
					[{
						content: undefined,
						font: undefined,
						color: undefined,
						width: undefined,
						src: undefined,
						svg: undefined,
						name: 'arrow_upward',
						path: undefined,
						tagName: undefined,
						isLiga: undefined,
						offsetTop: undefined,
						offsetLeft: undefined,
					}],
					currentContext,
				],
			]);
		});

		it('calls back with undefined when no icons are supplied', async function() {
			const columnUtils = await import('../../../../js/columns/type/columnUtils.ts');
			const context = {};
			const callbacks = [];

			columnUtils.loadIcons(null, context, {}, function(icons, ctx) {
				callbacks.push([icons, ctx]);
			});

			expect(callbacks).toEqual([[undefined, context]]);
		});
	});
})();
