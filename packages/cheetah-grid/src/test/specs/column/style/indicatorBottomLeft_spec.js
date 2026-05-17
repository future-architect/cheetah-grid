/*global cheetahGrid*/
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
				style: {indicatorBottomLeft: {style: 'triangle'}},
			},
			{
				field: 'bool',
				caption: 'function',
				width: 150,
				style: (rec) => ({
					indicatorBottomLeft: {style: rec.bool ? 'triangle' : undefined},
				}),
			},
			{
				field: 'bool',
				caption: 'style-string',
				width: 150,
				style: {indicatorBottomLeft: 'triangle'},
			},
		],
		records: records,
	});
	window.gridElement = grid.getElement();
	window.grid = grid;
	const theme = {indicators: {bottomLeftColor: undefined, bottomLeftSize: undefined}};
	grid.theme = cheetahGrid.themes.choices.MATERIAL_DESIGN.extends(theme);

	describe('indicatorBottomLeft', function() {
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

		function createAnswerCanvas(color, size) {
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
				drawBottomLeftTriangleIndicator({
					ctx,
					color,
					rect: gridHelper.getRect(cell[0], cell[1]),
					size,
				});
			}
			return canvasHelper.canvas;
		}
		function expectCanvas(canvas, tolerance) {
			expect(grid.canvas).toMatchImage(canvas, {
				tolerance,
				delta: '10%',
				blurLevel: 1,
			});
		}

		it('init drawing', function(done) {
			const canvas = createAnswerCanvas(BORDER_COLOR, 4);
			setTimeout(function() {
				expectCanvas(canvas, 50);
				done();
			}, 200);
		});
		it('update color', function() {
			const color = '#00F';
			theme.indicators.bottomLeftColor = color;
			grid.invalidate();

			expectCanvas(createAnswerCanvas(color, 4), 100);
		});
		it('reset color', function() {
			theme.indicators.bottomLeftColor = undefined;
			grid.invalidate();

			expectCanvas(createAnswerCanvas(BORDER_COLOR, 4), 100);
		});
		it('update size', function() {
			const size = 6;
			theme.indicators.bottomLeftSize = size;
			grid.invalidate();

			expectCanvas(createAnswerCanvas(BORDER_COLOR, size), 100);
		});
		it('reset size', function() {
			theme.indicators.bottomLeftSize = undefined;
			grid.invalidate();

			expectCanvas(createAnswerCanvas(BORDER_COLOR, 4), 100);
		});
	});
})();

function drawBottomLeftTriangleIndicator({ctx, rect, color, size}) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(rect.left + 1, rect.bottom - 2);
	ctx.lineTo(rect.left + 1 + size, rect.bottom - 2);
	ctx.lineTo(rect.left + 1, rect.bottom - 2 - size);
	ctx.closePath();
	ctx.fill();
}
