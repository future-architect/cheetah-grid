/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", max-len: "off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const COLOR = 'rgba(0, 0, 0, 0.87)';
	const FROZEN_ROWS_COLOR = 'rgba(0, 0, 0, 0.54)';
	const BORDER_COLOR = '#ccc7c7';
	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}

	const records = [{bool: true}, {bool: false}];

	const grid = new cheetahGrid.ListGrid({
		parentElement: (function() {
			const parent = document.createElement('div');
			parent.id = 'parent';
			parent.style.width = '500px';
			parent.style.height = '300px';
			mainEl.appendChild(parent);
			return parent;
		})(),
		defaultRowHeight: 24,
		header: [
			{
				field: 'bool',
				caption: 'style',
				width: 150,
				style: {indicatorTopLeft: {style: 'triangle'}},
			},
			{
				field: 'bool',
				caption: 'function',
				width: 150,
				style: (rec) => ({
					indicatorTopLeft: {style: rec.bool ? 'triangle' : undefined},
				}),
			},
			{
				field: 'bool',
				caption: 'style-string',
				width: 150,
				style: {indicatorTopLeft: 'triangle'},
			},
		],
		records: records,
	});
	window.gridElement = grid.getElement();
	window.grid = grid;
	const theme = {indicators: {topLeftColor: undefined, topLeftSize: undefined}};
	grid.theme = cheetahGrid.themes.choices.MATERIAL_DESIGN.extends(theme);

	describe('indicatorTopLeft', function() {
		function createAnswerCanvasBase() {
			const rows = [24, 24, 24];
			const cols = [150, 150, 150];

			const canvasHelper = window.createCanvasHelper(
					grid.canvas.width,
					grid.canvas.height
			);
			const ctx = canvasHelper.context;
			ctx.font = '16px sans-serif';

			const gridHelper = canvasHelper.createGridHelper(cols, rows);

			//塗りつぶし
			canvasHelper.fillRect('#FFF');
			gridHelper.fillRect('#FFF');

			//罫線
			ctx.strokeStyle = BORDER_COLOR;
			gridHelper.lineH(1, 0, 0, null);
			gridHelper.lineH(1, 1, 0, null);
			gridHelper.lineH(1, 2, 0, null);
			gridHelper.lineH(1, 2, 0, null, true);

			ctx.strokeStyle = '#5e9ed6';
			gridHelper.lineH(1, 0, 0, 0);
			gridHelper.lineH(2, 0, 0, 0, true);
			gridHelper.lineV(1, 0, 0, 0);
			gridHelper.lineV(2, 0, 0, 0, true);

			//TEXT
			ctx.fillStyle = FROZEN_ROWS_COLOR;
			const headerTextOpt = {
				offset: 3,
				textBaseline: 'middle',
				textAlign: 'left',
			};
			gridHelper.text('style', 0, 0, headerTextOpt);
			gridHelper.text('function', 1, 0, headerTextOpt);
			gridHelper.text('style-string', 2, 0, headerTextOpt);
			ctx.fillStyle = COLOR;
			const textOpt = {
				offset: 3,
				textBaseline: 'middle',
				textAlign: 'left',
			};
			gridHelper.text('true', 0, 1, textOpt);
			gridHelper.text('true', 1, 1, textOpt);
			gridHelper.text('true', 2, 1, textOpt);
			gridHelper.text('false', 0, 2, textOpt);
			gridHelper.text('false', 1, 2, textOpt);
			gridHelper.text('false', 2, 2, textOpt);

			return {
				canvasHelper: canvasHelper,
				gridHelper: gridHelper,
			};
		}

		it('init drawing', function(done) {
			function createAnswerCanvas() {
				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;

				const gridHelper = base.gridHelper;

				for (const cell of [
					[0, 1],
					[1, 1],
					[2, 1],
					[0, 2],
					[2, 2],
				]) {
					drawTopLeftTriangleIndicator({
						ctx,
						color: BORDER_COLOR,
						rect: gridHelper.getRect(cell[0], cell[1]),
						size: 4,
					});
				}

				return canvasHelper.canvas;
			}
			const canvas = createAnswerCanvas();
			setTimeout(function() {
				expect(grid.canvas).toMatchImage(canvas, {
					tolerance: 50,
					delta: '10%',
					blurLevel: 1,
				});
				done();
			}, 200);
		});
		it('update color', function() {
			const color = '#00F';
			theme.indicators.topLeftColor = color;
			grid.invalidate();

			function createAnswerCanvas() {
				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (const cell of [
					[0, 1],
					[1, 1],
					[2, 1],
					[0, 2],
					[2, 2],
				]) {
					drawTopLeftTriangleIndicator({
						ctx,
						color,
						rect: gridHelper.getRect(cell[0], cell[1]),
						size: 4,
					});
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {
				tolerance: 100,
				delta: '10%',
				blurLevel: 1,
			});
		});
		it('reset color', function() {
			theme.indicators.topLeftColor = undefined;
			grid.invalidate();

			function createAnswerCanvas() {
				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (const cell of [
					[0, 1],
					[1, 1],
					[2, 1],
					[0, 2],
					[2, 2],
				]) {
					drawTopLeftTriangleIndicator({
						ctx,
						color: BORDER_COLOR,
						rect: gridHelper.getRect(cell[0], cell[1]),
						size: 4,
					});
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {
				tolerance: 100,
				delta: '10%',
				blurLevel: 1,
			});
		});
		it('update size', function() {
			const size = 6;
			theme.indicators.topLeftSize = size;
			grid.invalidate();

			function createAnswerCanvas() {
				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (const cell of [
					[0, 1],
					[1, 1],
					[2, 1],
					[0, 2],
					[2, 2],
				]) {
					drawTopLeftTriangleIndicator({
						ctx,
						color: BORDER_COLOR,
						rect: gridHelper.getRect(cell[0], cell[1]),
						size,
					});
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {
				tolerance: 100,
				delta: '10%',
				blurLevel: 1,
			});
		});
		it('reset size', function() {
			theme.indicators.topLeftSize = undefined;
			grid.invalidate();

			function createAnswerCanvas() {
				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (const cell of [
					[0, 1],
					[1, 1],
					[2, 1],
					[0, 2],
					[2, 2],
				]) {
					drawTopLeftTriangleIndicator({
						ctx,
						color: BORDER_COLOR,
						rect: gridHelper.getRect(cell[0], cell[1]),
						size: 4,
					});
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {
				tolerance: 100,
				delta: '10%',
				blurLevel: 1,
			});
		});
	});
})();

function drawTopLeftTriangleIndicator({ctx, rect, color, size}) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(rect.left + 1, rect.top + 1);
	ctx.lineTo(rect.left + 1 + size, rect.top + 1);
	ctx.lineTo(rect.left + 1, rect.top + 1 + size);
	ctx.closePath();
	ctx.fill();
}
