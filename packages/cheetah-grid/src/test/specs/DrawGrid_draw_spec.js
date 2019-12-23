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
	const _ = cheetahGrid._getInternal().symbolManager.getProtectedSymbol();

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
	grid.rowCount = 3;
	grid.colCount = 10;
	grid.frozenColCount = 2;
	grid.frozenRowCount = 1;

	const helper = new GridCanvasHelper(grid);
	const theme = {};
	grid.theme = cheetahGrid.themes.choices.BASIC.extends(theme);
	theme.frozenRowsBgColor = '#d3d3d3';
	grid.getRecordIndexByRow = function(row) {
		return row - grid.frozenRowCount;
	};
	grid.onDrawCell = function(col, row, context) {
		//cell全体を描画
		helper.fillCellWithState(context);
		helper.borderWithState(context);

		//文字描画
		const ctx = context.getContext();
		ctx.font = '16px sans-serif';
		ctx.fillStyle = '#000';
		helper.text('[' + col + ':' + row + ']', context);
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

		it('draw default helper', function() {
			function createAnswerCanvas() {
				const rows = repeat([24], 3);
				const cols = repeat([80], 10);

				const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = canvasHelper.createGridHelper(cols, rows);

				//塗りつぶし
				canvasHelper.fillRect('#f6f6f6');
				gridHelper.fillRect('white');
				gridHelper.fillRect('#d3d3d3', 0, 0, null, 0);
				gridHelper.fillRect('#F6F6F6', 0, 2, null, 2);

				//罫線
				gridHelper.lineAll(1);
				ctx.strokeStyle = '#5e9ed6';
				gridHelper.lineH(1, 0, 0, 0);
				gridHelper.lineH(2, 0, 0, 0, true);
				gridHelper.lineV(1, 0, 0, 0);
				gridHelper.lineV(2, 0, 0, 0, true);

				//TEXT
				ctx.font = '16px sans-serif';
				ctx.fillStyle = '#000';

				for (let row = 0; row < rows.length; row++) {
					for (let col = 0; col < cols.length; col++) {
						gridHelper.text('[' + col + ':' + row + ']', col, row, {
							offset: 3,
							textBaseline: 'middle'
						});
					}
				}
				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 0, delta: '15%', blurLevel: 1});
		});

		it('select and makeVisible', function() {
			grid.selection.select = {col: 8, row: 1};
			grid.makeVisibleCell(8, 1);
			grid[_].scrollable._handler.fire(grid[_].scrollable._scrollable, 'scroll', {});
			grid.invalidate();

			function createAnswerCanvas() {
				const rows = repeat([24], 3);
				const cols = repeat([80], 10);
				cols[2] = grid.canvas.width - (6 * 80);

				const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = canvasHelper.createGridHelper(cols, rows);

				//塗りつぶし
				canvasHelper.fillRect('#f6f6f6');
				gridHelper.fillRect('white');
				gridHelper.fillRect('#d3d3d3', 0, 0, null, 0);
				gridHelper.fillRect('#F6F6F6', 0, 2, null, 2);

				//罫線
				gridHelper.lineAll(1);
				ctx.strokeStyle = '#5e9ed6';
				gridHelper.lineH(1, 0, 6, 6, true);
				gridHelper.lineH(1, 1, 6, 6);
				gridHelper.lineH(2, 1, 6, 6, true);
				gridHelper.lineV(1, 5, 1, 1, true);
				gridHelper.lineV(1, 6, 1, 1);
				gridHelper.lineV(2, 6, 1, 1, true);

				//TEXT
				ctx.font = '16px sans-serif';
				ctx.fillStyle = '#000';

				for (let row = 0; row < rows.length; row++) {
					for (let col = 0; col < cols.length; col++) {
						const text = col < 2 ? '[' + col + ':' + row + ']'
							: (col === 2 ? '' : '[' + (col + 2) + ':' + row + ']');
						gridHelper.text(text, col, row, {
							offset: 3,
							textBaseline: 'middle'
						});
					}
				}
				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 0, delta: '15%', blurLevel: 1});
		});
	});

})();