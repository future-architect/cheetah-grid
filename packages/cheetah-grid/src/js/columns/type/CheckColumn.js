'use strict';

const {isDef} = require('../../internal/utils');
const BaseColumn = require('./BaseColumn');
const CheckStyle = require('../style/CheckStyle');
const {CHECK_COLUMN_STATE_ID} = require('../../internal/symbolManager');


function toBoolean(val) {
	if (typeof val === 'string') {
		if (val === 'false') {
			return false;
		} else if (val === 'off') {
			return false;
		} else if (val.match(/^0+$/)) {
			return false;
		}
	}
	return val;
}

class CheckColumn extends BaseColumn {
	get StyleClass() {
		return CheckStyle;
	}
	clone() {
		return new CheckColumn(this);
	}
	convertInternal(value) {
		return toBoolean(value);
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase}) {
		const {
			textAlign,
			textBaseline,
			borderColor,
			checkBgColor,
			uncheckBgColor,
			bgColor,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}

		const {col, row} = context;
		const cellKey = `${col}:${row}`;
		const elapsedKey = `${cellKey}::elapsed`;
		const elapsed = grid[CHECK_COLUMN_STATE_ID] && grid[CHECK_COLUMN_STATE_ID][elapsedKey];

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
		helper.checkbox(value, context, opt);
	}
	bindGridEvent(grid, col, util) {
		return [];
	}
}

module.exports = CheckColumn;
