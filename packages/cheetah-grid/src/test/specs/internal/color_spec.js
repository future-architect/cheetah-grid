/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const color = cheetahGrid._getInternal().color;


	describe('color', function() {

		it('#FFF', function() {
			expect(color.colorToRGB('#000')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('#111')).toEqual({
				r: 17,
				g: 17,
				b: 17,
				a: 1,
			});
			expect(color.colorToRGB('#FFF')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 1,
			});
			expect(color.colorToRGB('#abc')).toEqual({
				r: 170,
				g: 187,
				b: 204,
				a: 1
			});
		});

		it('#FFFFFF', function() {
			expect(color.colorToRGB('#000000')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('#111111')).toEqual({
				r: 17,
				g: 17,
				b: 17,
				a: 1,
			});
			expect(color.colorToRGB('#FFFFFF')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 1,
			});
			expect(color.colorToRGB('#aabbcc')).toEqual({
				r: 170,
				g: 187,
				b: 204,
				a: 1
			});
		});

		it('rgb', function() {
			expect(color.colorToRGB('rgb(0,0,0)')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('rgb( 0 , 0 , 0 )')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('rgb(1,1,1)')).toEqual({
				r: 1,
				g: 1,
				b: 1,
				a: 1,
			});
			expect(color.colorToRGB('rgb(255, 255, 255)')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 1,
			});
		});

		it('rgb%', function() {
			expect(color.colorToRGB('rgb(0%,0%,0%)')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('rgb( 0% , 0% , 0% )')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('rgb(1%,1%,1%)')).toEqual({
				r: 3,
				g: 3,
				b: 3,
				a: 1,
			});
			expect(color.colorToRGB('rgb(100%, 100%, 100%)')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 1,
			});
		});
		it('rgba', function() {
			expect(color.colorToRGB('rgba(0,0,0,1)')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('rgba( 0 , 0 , 0 , 0.5 )')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 0.5,
			});
			expect(color.colorToRGB('rgba(1,1,1,0.7)')).toEqual({
				r: 1,
				g: 1,
				b: 1,
				a: 0.7,
			});
			expect(color.colorToRGB('rgba(255, 255, 255, 0.2)')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 0.2,
			});
		});
		it('rgba%', function() {
			expect(color.colorToRGB('rgba(0%,0%,0%,0.2)')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 0.2,
			});
			expect(color.colorToRGB('rgba( 0% , 0% , 0% , 0.5 )')).toEqual({
				r: 0,
				g: 0,
				b: 0,
				a: 0.5,
			});
			expect(color.colorToRGB('rgba(1%,1%,1%,0.4)')).toEqual({
				r: 3,
				g: 3,
				b: 3,
				a: 0.4,
			});
			expect(color.colorToRGB('rgba(100%, 100%, 100%,0.7)')).toEqual({
				r: 255,
				g: 255,
				b: 255,
				a: 0.7,
			});
		});
		it('style', function() {
			expect(color.colorToRGB('red')).toEqual({
				r: 255,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('red ')).toEqual({
				r: 255,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('yellow')).toEqual({
				r: 255,
				g: 255,
				b: 0,
				a: 1,
			});
			expect(color.colorToRGB('aqua')).toEqual({
				r: 0,
				g: 255,
				b: 255,
				a: 1,
			});
			expect(color.colorToRGB('beige')).toEqual({
				r: 245,
				g: 245,
				b: 220,
				a: 1,
			});
		});
	});
})();