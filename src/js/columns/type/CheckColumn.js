'use strict';
{
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
			const key = `${col}:${row}`;
			const state = grid[CHECK_COLUMN_STATE_ID] && grid[CHECK_COLUMN_STATE_ID][key];

			const opt = {
				textAlign,
				textBaseline,
				borderColor,
				checkBgColor,
				uncheckBgColor,
			};
			if (state) {
				opt.animElapsedTime = state.elapsed;
			}
			helper.checkbox(value, context, opt);
		}
		bindGridEvent(grid, col, util) {
			return [];
		}
	}

	module.exports = CheckColumn;
}