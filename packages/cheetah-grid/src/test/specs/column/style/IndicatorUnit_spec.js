/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createContext() {
		return {
			col: 2,
			row: 3,
			getRect: function() {
				return {
					left: 10,
					top: 20,
					width: 100,
					height: 60,
					right: 110,
					bottom: 80,
				};
			},
		};
	}

	function createHelper(calls) {
		return {
			theme: {
				indicators: {
					topLeftColor: 'themeTopLeft',
					topLeftSize: 7,
					topRightColor: 'themeTopRight',
					topRightSize: 8,
					bottomRightColor: 'themeBottomRight',
					bottomRightSize: 9,
					bottomLeftColor: 'themeBottomLeft',
					bottomLeftSize: 10,
				},
			},
			getColor: function(color, col, row) {
				return `${color}:${col}:${row}`;
			},
			drawBorderWithClip: function(context, callback) {
				calls.push(['clip', context]);
				callback({
					fillStyle: '',
					beginPath: function() {
						calls.push(['beginPath']);
					},
					moveTo: function(x, y) {
						calls.push(['moveTo', x, y]);
					},
					lineTo: function(x, y) {
						calls.push(['lineTo', x, y]);
					},
					closePath: function() {
						calls.push(['closePath']);
					},
					fill: function() {
						calls.push(['fill', this.fillStyle]);
					},
				});
			},
		};
	}

	describe('indicator drawing', function() {
		it('resolves triangle indicators and ignores unknown styles', async function() {
			const {getDrawIndicator} = await import('../../../../js/columns/indicator/handlers.ts');
			const {drawTriangleIndicator} = await import('../../../../js/columns/indicator/triangle.ts');

			expect(getDrawIndicator({style: 'triangle'})).toBe(drawTriangleIndicator);
			expect(getDrawIndicator({style: 'missing'})).toBeNull();
		});

		it('draws top-left triangles with explicit color and size', async function() {
			const {drawTriangleIndicator} = await import('../../../../js/columns/indicator/triangle.ts');
			const calls = [];
			const context = createContext();

			drawTriangleIndicator(context, {
				style: 'triangle',
				color: 'red',
				size: 5,
			}, 0, createHelper(calls));

			expect(calls).toEqual([
				['clip', context],
				['beginPath'],
				['moveTo', 11, 21],
				['lineTo', 16, 21],
				['lineTo', 11, 26],
				['closePath'],
				['fill', 'red'],
			]);
		});

		it('uses themed color and size for each triangle corner', async function() {
			const {drawTriangleIndicator} = await import('../../../../js/columns/indicator/triangle.ts');
			const expected = [
				[1, ['moveTo', 108, 21], ['lineTo', 100, 21], ['lineTo', 108, 29], 'themeTopRight:2:3'],
				[2, ['moveTo', 108, 78], ['lineTo', 99, 78], ['lineTo', 108, 69], 'themeBottomRight:2:3'],
				[3, ['moveTo', 11, 78], ['lineTo', 21, 78], ['lineTo', 11, 68], 'themeBottomLeft:2:3'],
			];

			expected.forEach(function([kind, moveTo, lineTo1, lineTo2, color]) {
				const calls = [];
				drawTriangleIndicator(createContext(), {style: 'triangle'}, kind, createHelper(calls));

				expect(calls.slice(2)).toEqual([
					moveTo,
					lineTo1,
					lineTo2,
					['closePath'],
					['fill', color],
				]);
			});
		});
	});
})();
