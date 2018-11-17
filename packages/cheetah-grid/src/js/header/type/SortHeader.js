'use strict';

const styleContents = require('../style');
const {SortHeaderStyle} = styleContents;
const BaseHeader = require('./BaseHeader');
const {isDef} = require('../../internal/utils');
const {getFontSize} = require('../../internal/canvases');

class SortHeader extends BaseHeader {
	get StyleClass() {
		return SortHeaderStyle;
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase}) {
		const {
			textAlign,
			textBaseline = 'middle',
			color,
			bgColor,
			font,
			textOverflow,
			sortArrowColor,
		} = style;

		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}

		const state = grid.sortState;
		let order = undefined;
		const {col, row} = context;
		const range = grid.getHeaderCellRange(col, row);
		if (range.isCellInRange(state.col, range.startRow)) {
			({order} = state);
		}

		const ctx = context.getContext();
		const arrowSize = getFontSize(ctx, font).width * 1.2;

		helper.text(value, context, {
			textAlign,
			textBaseline,
			color,
			font,
			textOverflow,
			icons: [{
				name: isDef(order) ? (order === 'asc' ? 'arrow_downward' : 'arrow_upward') : null,
				width: arrowSize,
				color: helper.getColor(sortArrowColor || helper.theme.header.sortArrowColor, col, row, ctx) || 'rgba(0, 0, 0, 0.38)',
			}],
		});
	}
}
module.exports = SortHeader;
