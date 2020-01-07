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
		defaultRowHeight: 52,
	});
	window.gridElement = grid.getElement();
	window.grid = grid;
	grid.rowCount = 100;
	grid.colCount = 100;
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


	function setScrollTop(scrollTop) {
		grid[_].scrollable.scrollTop = scrollTop;
		grid[_].scrollable._handler.fire(grid[_].scrollable._scrollable, 'scroll', {});
	}
	function setScrollLeft(scrollLeft) {
		grid[_].scrollable.scrollLeft = scrollLeft;
		grid[_].scrollable._handler.fire(grid[_].scrollable._scrollable, 'scroll', {});
	}

	beforeEach(function() {
		setScrollTop(0);
		setScrollLeft(0);
	});

	describe('DrawGrid visibleRowCount', function() {

		it('"visibleRowCount" and "topRow" must be the expected values.', function() {
			expect(grid.visibleRowCount).toBe(4);
			expect(grid.topRow).toBe(1);

			setScrollTop(10);

			expect(grid.visibleRowCount).toBe(3);
			expect(grid.topRow).toBe(2);
		});


		it('"visibleColCount" and "leftCol" must be the expected values.', function() {
			expect(grid.visibleColCount).toBe(4);
			expect(grid.leftCol).toBe(2);

			setScrollLeft(10);

			expect(grid.visibleColCount).toBe(3);
			expect(grid.leftCol).toBe(3);
		});
	});

})();