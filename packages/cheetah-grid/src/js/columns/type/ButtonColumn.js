'use strict';

const Column = require('./Column');
const ButtonStyle = require('../style/ButtonStyle');
const {BUTTON_COLUMN_STATE_ID} = require('../../internal/symbolManager');
const utils = require('./columnUtils');


class ButtonColumn extends Column {
	constructor(option = {}) {
		super(option);
		this._caption = option.caption;
	}
	get StyleClass() {
		return ButtonStyle;
	}
	get caption() {
		return this._caption;
	}
	withCaption(caption) {
		const c = this.clone();
		c._caption = caption;
		return c;
	}
	clone() {
		return new ButtonColumn(this);
	}
	convertInternal(value) {
		return this._caption || value;
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase, getIcon}) {
		const {textAlign, textBaseline, bgColor, color, buttonBgColor, font, padding} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}
		helper.testFontLoad(font, value, context);
		const {col, row} = context;
		let active = false;
		const state = grid[BUTTON_COLUMN_STATE_ID];
		if (state) {
			if (state.mouseActiveCell &&
					state.mouseActiveCell.col === col &&
					state.mouseActiveCell.row === row) {
				active = true;
			} else if (context.getSelectState().selected) {
				active = true;
			}
		}

		utils.loadIcons(getIcon(), context, helper, (icons, context) => {
			helper.button(value, context, {
				textAlign,
				textBaseline,
				bgColor: buttonBgColor,
				color,
				font,
				padding,
				shadow: active ? {
					color: 'rgba(0, 0, 0, 0.48)',
					blur: 6,
					offsetY: 3,
				} : true,
				icons,
			});
		});
	}
}

module.exports = ButtonColumn;
