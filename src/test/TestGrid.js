/*global cheetahGrid*/
/*eslint prefer-rest-params:0, consistent-this:0, prefer-destructuring:0, prefer-template:0 */
'use strict';
(function() {
	const DrawGrid = cheetahGrid.core.DrawGrid;
	const GridCanvasHelper = cheetahGrid.GridCanvasHelper;
	const themes = cheetahGrid.themes;
	const theme = {};

	const TestGrid = function(args) {
		let obj;
		// for es6 or IE
		if (window.Reflect) {
			obj = Reflect.construct(DrawGrid, arguments, TestGrid);
		} else {
			DrawGrid.apply(this, arguments);
			obj = this;
		}
		obj.rowCount = 1000000;
		obj.colCount = 200;
		obj.frozenColCount = 2;
		obj.frozenRowCount = 1;
		obj.invalidate();
		obj.theme = themes.theme.create(theme);
		return obj;
	};
	TestGrid.prototype = Object.create(DrawGrid.prototype);
	TestGrid.prototype.getCopyCellValue = function(col, row) {
		return '[' + col + ':' + row + ']';
	};
	TestGrid.prototype.getGridCanvasHelper = function() {
		return this._gridCanvasHelper || (this._gridCanvasHelper = new GridCanvasHelper(this));
	};

	TestGrid.prototype.onDrawCell = function(col, row, context) {
		const helper = this.getGridCanvasHelper();
		//cell全体を描画
		helper.fillCellWithState(context);
		helper.borderWithState(context);

		//文字描画
		helper.text('[' + col + ':' + row + ']', context, {
			// color: 'blue'
		});
	};
	TestGrid.prototype._getInitContext = function() {
		const ctx = DrawGrid.prototype._getInitContext.apply(this, arguments);

		// 描画確認用
		function getRandomColor() {
			const letters = 'ABCDEF';
			let color = '#';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 6)];
			}
			return color;
		}
		theme.defaultBgColor = getRandomColor();
		return ctx;
	};
	window.TestGrid = TestGrid;
})();