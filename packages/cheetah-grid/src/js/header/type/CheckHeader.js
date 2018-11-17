'use strict';


const {isDef} = require('../../internal/utils');
const BaseHeader = require('./BaseHeader');
const CheckHeaderStyle = require('../style/CheckHeaderStyle');
const {CHECK_HEADER_STATE_ID} = require('../../internal/symbolManager');

class CheckHeader extends BaseHeader {
	get StyleClass() {
		return CheckHeaderStyle;
	}
	clone() {
		return new CheckHeader(this);
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase}) {
		const {
			textAlign,
			textBaseline,
			borderColor,
			checkBgColor,
			uncheckBgColor,
			bgColor,
			color,
			font,
			textOverflow,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}

		const {col, row} = context;
		const cellKey = `${col}:${row}`;
		const elapsedKey = `${cellKey}::elapsed`;
		const {[elapsedKey]: elapsed} = grid[CHECK_HEADER_STATE_ID] || {};

		const checked = grid.getHeaderValue(col, row);

		const opt = {
			textAlign,
			textBaseline,
			borderColor,
			checkBgColor,
			uncheckBgColor,
		};
		if (isDef(elapsed)) {
			opt.animElapsedTime = elapsed;
		}
		const inlineCheck = 	helper.buildCheckBoxInline(!!checked, context, opt);

		helper.text([inlineCheck, value], context, {
			textAlign,
			textBaseline,
			color,
			font,
			textOverflow,
		});
	}
	bindGridEvent(grid, col, util) {
		return [];
	}
}

module.exports = CheckHeader;
