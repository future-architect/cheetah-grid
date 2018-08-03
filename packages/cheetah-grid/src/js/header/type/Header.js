'use strict';

const styleContents = require('../style');
const {Style} = styleContents;
const BaseHeader = require('./BaseHeader');

class Header extends BaseHeader {
	get StyleClass() {
		return Style;
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase}) {
		const {
			textAlign,
			textBaseline,
			color,
			font,
			bgColor,
		} = style;

		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}

		helper.text(value, context, {
			textAlign,
			textBaseline,
			color,
			font,
		});
	}
	bindGridEvent(grid) {
		return [];
	}
}
module.exports = Header;
