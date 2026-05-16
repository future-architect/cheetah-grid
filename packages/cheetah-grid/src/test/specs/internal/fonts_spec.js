/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('fonts', function() {
		it('loads browser fonts once and reports cached fonts as drawable', async function() {
			const fonts = await import('../../../js/internal/fonts.ts');
			const callbacks = [];
			const font = '10px sans-serif';

			await new Promise(function(resolve) {
				fonts.load(font, 'A', function() {
					callbacks.push('first');
					resolve();
				});
			});
			fonts.load(font, 'A', function() {
				callbacks.push('second');
			});

			expect(callbacks).toEqual(['first', 'second']);
			expect(fonts.check(font, 'A')).toEqual(true);
		});
	});
})();
