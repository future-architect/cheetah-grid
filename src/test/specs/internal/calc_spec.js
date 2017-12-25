/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const calc = cheetahGrid._internal.calc;

	describe('calc', function() {
		it('toPxWidth num', function() {
			const ret = calc.toPxWidth(25, {
				width: 1200,
			});
			expect(ret).toEqual(25);
		});
		it('toPxWidth str', function() {
			const ret = calc.toPxWidth('30', {
				width: 1200,
			});
			expect(ret).toEqual(30);
		});
		it('toPxWidth px', function() {
			const ret = calc.toPxWidth('30px', {
				width: 1200,
			});
			expect(ret).toEqual(30);
		});
		it('toPxWidth %', function() {
			const ret = calc.toPxWidth('30%', {
				width: 1200,
			});
			expect(ret).toEqual(360);
		});
		it('toPxWidth calc', function() {
			const ret = calc.toPxWidth('calc(30% - 60px)', {
				width: 1200,
			});
			expect(ret).toEqual(300);
		});
		it('toPxWidth calc in calc', function() {
			const ret = calc.toPxWidth('calc(calc(30% - 60px) * 3)', {
				width: 1200,
			});
			expect(ret).toEqual(900);
		});

	});
})();