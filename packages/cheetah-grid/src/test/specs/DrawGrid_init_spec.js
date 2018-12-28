/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off", prefer-template: "off"*/
'use strict';
(function() {
	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}
	const GridCanvasHelper = cheetahGrid.GridCanvasHelper;
	const theme = {};
	const grid = new cheetahGrid.core.DrawGrid({
		parentElement: (function() {
			const parent = document.createElement('div');
			parent.id = 'parent';
			parent.style.width = '500px';
			parent.style.height = '300px';
			mainEl.appendChild(parent);
			return parent;
		})(),
		defaultRowHeight: 24,
	});
	window.gridElement = grid.getElement();
	window.grid = grid;
	grid.rowCount = 100;
	grid.colCount = 100;
	grid.frozenColCount = 2;
	grid.frozenRowCount = 1;
	grid.theme = cheetahGrid.themes.choices.BASIC.extends(theme);
	const helper = new GridCanvasHelper(grid);
	theme.frozenRowsBgColor = '#fff';
	theme.defaultBgColor = '#fff';
	grid.onDrawCell = function(col, row, context) {
		//cell全体を描画
		helper.fillCell(context);
		helper.border(context);

		//文字描画
		const ctx = context.getContext();
		ctx.font = '10px Arial';
		helper.text('[' + col + ':' + row + ']', context, {
			color: 'blue',
			textBaseline: 'top',
		});
	};
	grid.invalidate();
	function repeat(c, n) {
		let arr = [];
		for (let i = 0; i < n; i++) {
			arr = arr.concat(c);
		}
		return arr;
	}

	describe('DrawGrid draw image', function() {

		it('init', function() {
			function createAnswerCanvas() {
				const rows = repeat([24], 18);
				const cols = repeat([80], 10);

				const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				//塗りつぶし
				canvasHelper.fillRect('white');

				//罫線
				const gridHelper = canvasHelper.createGridHelper(cols, rows);
				gridHelper.lineAll(1);

				//TEXT
				ctx.font = '10px Arial';
				ctx.fillStyle = 'blue';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';

				for (let row = 0; row < rows.length; row++) {
					for (let col = 0; col < cols.length; col++) {
						gridHelper.text('[' + col + ':' + row + ']', col, row, {
							offset: 3
						});
					}
				}
				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 50, delta: '12%', blurLevel: 1});
		});
		it('init Small', function() {
			grid.rowCount = 10;
			grid.colCount = 3;
			grid.invalidate();

			function createAnswerCanvas() {
				const rows = repeat([24], 10);
				const cols = repeat([80], 3);


				const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				//全体塗りつぶし
				canvasHelper.fillRect('#F6f6f6');

				const gridHelper = canvasHelper.createGridHelper(cols, rows);

				//内部塗りつぶし
				gridHelper.fillRect('white');

				//罫線
				gridHelper.lineAll(1);

				//TEXT
				ctx.font = '10px Arial';
				ctx.fillStyle = 'blue';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';

				for (let row = 0; row < rows.length; row++) {
					for (let col = 0; col < cols.length; col++) {
						gridHelper.text('[' + col + ':' + row + ']', col, row, {
							offset: 3
						});
					}
				}
				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 50, delta: '12%', blurLevel: 1});
		});
	});

})();