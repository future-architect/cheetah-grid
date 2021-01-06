/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const calc = cheetahGrid._getInternal().calc;

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
		it('toPx calc priority (1', function() {
			const ret = calc.toPx('calc(30% - 60px * 3)', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 - 60 * 3));
		});
		it('toPx calc priority (2', function() {
			const ret = calc.toPx('calc(30% - (60px * 3))', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 - 60 * 3));
		});
		it('toPx calc priority (3', function() {
			const ret = calc.toPx('calc(30% - (60px * 3 + 2px * 4))', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 - (60 * 3 + 2 * 4)));
		});
		it('toPx calc priority (4', function() {
			const ret = calc.toPx('calc(30% - (60px * 3 * 2 / 2 * 2))', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 - (60 * 3 * 2 / 2 * 2)));
		});
		it('toPx dot (1', function() {
			const ret = calc.toPx('calc(30% - 14.567px)', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 - (14.567)));
		});
		it('toPx dot (2', function() {
			const ret = calc.toPx('calc(30% - -14.567px)', {
				full: 1200,
			});
			expect(ret).toEqual((1200 * 0.30 + (14.567)));
		});

	});
})();