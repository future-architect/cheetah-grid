/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const calc = cheetahGrid._internal.calc;

	describe('calc', function() {
		it('toPx num', function() {
			const ret = calc.toPx(25, {
				full: 1200,
			});
			expect(ret).toEqual(25);
		});
		it('toPx str', function() {
			const ret = calc.toPx('30', {
				full: 1200,
			});
			expect(ret).toEqual(30);
		});
		it('toPx px', function() {
			const ret = calc.toPx('30px', {
				full: 1200,
			});
			expect(ret).toEqual(30);
		});
		it('toPx %', function() {
			const ret = calc.toPx('30%', {
				full: 1200,
			});
			expect(ret).toEqual(360);
		});
		it('toPx em', function() {
			const ret = calc.toPx('30em', {
				em: 10,
			});
			expect(ret).toEqual(300);
		});
		it('toPx calc', function() {
			const ret = calc.toPx('calc(30% - 60px)', {
				full: 1200,
			});
			expect(ret).toEqual(300);
		});
		it('toPx calc em', function() {
			const ret = calc.toPx('calc(30em - 60px)', {
				em: 10,
			});
			expect(ret).toEqual(240);
		});
		it('toPx calc in calc', function() {
			const ret = calc.toPx('calc(calc(30% - 60px) * 3)', {
				full: 1200,
			});
			expect(ret).toEqual(900);
		});

	});
})();