/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {ImageColumn} = cheetahGrid.columns.type;
	const {ImageStyle} = cheetahGrid.columns.style;

	function createContext() {
		const rect = {
			left: 10,
			top: 20,
			width: 100,
			height: 80,
			right: 110,
			bottom: 100,
		};
		return {
			getRect: function() {
				return rect;
			},
		};
	}

	function createHelper(calls) {
		return {
			toBoxPixelArray: function(padding) {
				return padding;
			},
			drawWithClip: function(context, callback) {
				const ctx = {
					textAlign: '',
					textBaseline: '',
					drawImage: function(...args) {
						calls.push(args);
					},
				};
				callback(ctx);
				calls.push(['align', ctx.textAlign, ctx.textBaseline]);
			},
		};
	}

	describe('ImageColumn', function() {
		it('uses ImageStyle and clones independently', function() {
			const column = new ImageColumn();
			const clone = column.clone();

			expect(column.StyleClass).toBe(ImageStyle);
			expect(clone).not.toBe(column);
			expect(clone.StyleClass).toBe(ImageStyle);
		});

		it('draws images stretched inside margins', function() {
			const calls = [];
			const column = new ImageColumn();
			const image = {width: 50, height: 20};
			const style = new ImageStyle({
				textAlign: 'center',
				textBaseline: 'middle',
				margin: 5,
			});

			column.drawInternal(image, createContext(), style, createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
			});

			expect(calls).toEqual([
				[image, 0, 0, 50, 20, 15, 25, 90, 70],
				['align', 'center', 'middle'],
			]);
		});

		it('draws keep-aspect-ratio images with padding and background', function() {
			const calls = [];
			const bases = [];
			const column = new ImageColumn();
			const image = {width: 100, height: 50};
			const style = new ImageStyle({
				bgColor: 'white',
				imageSizing: 'keep-aspect-ratio',
				margin: 5,
				padding: [10, 20, 10, 20],
				textAlign: 'center',
				textBaseline: 'middle',
			});

			column.drawInternal(image, createContext(), style, createHelper(calls), {}, {
				drawCellBase: function(option) {
					bases.push(option);
				},
			});

			expect(bases).toEqual([{bgColor: 'white'}]);
			expect(calls).toEqual([
				[image, 0, 0, 100, 50, 35, 47.5, 50, 25],
				['align', 'center', 'middle'],
			]);
		});

		it('shrinks keep-aspect-ratio images by height when height is the limiting edge', function() {
			const calls = [];
			const column = new ImageColumn();
			const image = {width: 50, height: 100};
			const style = new ImageStyle({
				imageSizing: 'keep-aspect-ratio',
				margin: 5,
				textAlign: 'center',
				textBaseline: 'middle',
			});

			column.drawInternal(image, createContext(), style, createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
			});

			expect(calls).toEqual([
				[image, 0, 0, 50, 100, 42.5, 25, 35, 70],
				['align', 'center', 'middle'],
			]);
		});

		it('skips drawing when hidden or image value is missing', function() {
			const calls = [];
			const column = new ImageColumn();

			column.drawInternal(null, createContext(), new ImageStyle(), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
			});
			expect(calls).toEqual([]);

			column.drawInternal({width: 10, height: 10}, createContext(), new ImageStyle({visibility: 'hidden'}), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
			});

			expect(calls).toEqual([]);
		});
	});
})();
