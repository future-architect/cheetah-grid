'use strict';

const styleContents = require('../style');
const {isDef} = require('../../internal/utils');
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
				this.convertInternal(cellValue),
				context,
				styleContents.of(style, this.StyleClass),
				helper,
				grid,
				info
		);
	}
	convertInternal(value) {
		return isDef(value) ? value : '';
	}
	drawInternal(value, context, style, helper, grid, info) {

	}
	bindGridEvent(grid) {
		return [];
	}
}
module.exports = BaseHeader;
