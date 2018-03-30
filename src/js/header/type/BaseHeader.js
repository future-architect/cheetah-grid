'use strict';
{
	const styleContents = require('../style');
	const {Style} = styleContents;

	class BaseHeader {
		constructor(headerCell) {
			this._headerCell = headerCell;
			this.onDrawCell = this.onDrawCell.bind(this);//スコープを固定させる
		}
		get StyleClass() {
			return Style;
		}
		onDrawCell(cellValue, info, context, grid) {
			const {style, drawCellBase} = info;
			delete info.getRecord;
			delete info.style;
			const helper = grid.getGridCanvasHelper();
			drawCellBase();
			//文字描画
			this.drawInternal(
					cellValue,
					context,
					styleContents.of(style, this.StyleClass),
					helper,
					grid,
					info
			);
		}
		drawInternal(value, context, style, helper, grid, info) {

		}
		bindGridEvent(grid) {
			return [];
		}
	}
	module.exports = BaseHeader;
}