/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('canvases', function() {
		it('calculates left/top start positions with offsets and padding', async function() {
			const canvases = await import('../../../js/internal/canvases.ts');
			const ctx = {
				textBaseline: 'top',
			};
			const rect = {left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50};

			expect(canvases.calcStartPosition(ctx, rect, 20, 10, {
				offset: 2,
				padding: {left: 3, top: 4},
			})).toEqual({x: 15, y: 26});
			expect(ctx.textAlign).toEqual('left');
			expect(ctx.textBaseline).toEqual('top');
		});

		it('calculates right, center, bottom, and middle start positions', async function() {
			const canvases = await import('../../../js/internal/canvases.ts');
			const rect = {left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50};

			expect(canvases.calcStartPosition({
				textAlign: 'right',
				textBaseline: 'bottom',
			}, rect, 20, 10, {
				offset: 2,
				padding: {right: 3, bottom: 4},
			})).toEqual({x: 85, y: 54});

			expect(canvases.calcStartPosition({
				textAlign: 'center',
				textBaseline: 'middle',
			}, rect, 20, 10, {
				padding: {left: 4, right: 10, top: 6, bottom: 2},
			})).toEqual({x: 47, y: 42});
		});

		it('calculates base positions as zero-sized start positions', async function() {
			const canvases = await import('../../../js/internal/canvases.ts');
			const ctx = {
				textAlign: 'center',
				textBaseline: 'middle',
			};
			const rect = {left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50};

			expect(canvases.calcBasePosition(ctx, rect, {
				padding: {left: 4, right: 10, top: 6, bottom: 2},
			})).toEqual({x: 57, y: 47});
		});

		it('measures font size once per font and restores context state', async function() {
			const canvases = await import('../../../js/internal/canvases.ts');
			let measureCount = 0;
			const ctx = {
				font: '10px sans-serif',
				canvas: {
					style: {
						letterSpacing: '',
					},
				},
				measureText: function() {
					measureCount++;
					return {width: 12};
				},
			};

			expect(canvases.getFontSize(ctx, '__test_font_12px__')).toEqual({width: 12, height: 12});
			expect(canvases.getFontSize(ctx, '__test_font_12px__')).toEqual({width: 12, height: 12});
			expect(measureCount).toEqual(1);
			expect(ctx.font).toEqual('10px sans-serif');
			expect(ctx.canvas.style.letterSpacing).toEqual('');
		});
	});
})();
