/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('internal icons', function() {
		it('normalizes scalar icon props into a single icon', async function() {
			const icons = await import('../../../js/internal/icons.ts');

			expect(icons.toNormalizeArray({
				content: 'A',
				font: '16px sans-serif',
				color: 'red',
				width: 10,
				offsetTop: 1,
				offsetLeft: 2,
				unknown: 'ignored',
			})).toEqual([{
				content: 'A',
				font: '16px sans-serif',
				color: 'red',
				width: 10,
				src: undefined,
				svg: undefined,
				name: undefined,
				path: undefined,
				tagName: undefined,
				isLiga: undefined,
				offsetTop: 1,
				offsetLeft: 2,
			}]);
		});

		it('expands array props and repeats scalar props', async function() {
			const icons = await import('../../../js/internal/icons.ts');

			expect(icons.toNormalizeArray({
				content: ['A', 'B'],
				color: 'red',
				width: [10],
			})).toEqual([
				{
					content: 'A',
					font: undefined,
					color: 'red',
					width: 10,
					src: undefined,
					svg: undefined,
					name: undefined,
					path: undefined,
					tagName: undefined,
					isLiga: undefined,
					offsetTop: undefined,
					offsetLeft: undefined,
				},
				{
					content: 'B',
					font: undefined,
					color: 'red',
					width: null,
					src: undefined,
					svg: undefined,
					name: undefined,
					path: undefined,
					tagName: undefined,
					isLiga: undefined,
					offsetTop: undefined,
					offsetLeft: undefined,
				},
			]);
		});

		it('returns array options unchanged except for normalized known keys', async function() {
			const icons = await import('../../../js/internal/icons.ts');

			expect(icons.toNormalizeArray([
				{content: 'A', color: 'red', unknown: 'ignored'},
				{src: 'image.png', width: 20},
			])).toEqual([
				{content: 'A', color: 'red'},
				{src: 'image.png', width: 20},
			]);
		});
	});
})();
