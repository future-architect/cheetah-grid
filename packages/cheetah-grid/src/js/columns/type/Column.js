'use strict';

const Style = require('../style/Style');
const BaseColumn = require('./BaseColumn');
const utils = require('./columnUtils');

class Column extends BaseColumn {
	get StyleClass() {
		return Style;
	}
	clone() {
		return new Column(this);
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase, getIcon}) {
		const {
			textAlign,
			textBaseline,
			color,
			font,
			bgColor,
			padding,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}
		helper.testFontLoad(font, value, context);
		utils.loadIcons(getIcon(), context, helper, (icons, context) => {
			helper.text(value, context, {
				textAlign,
				textBaseline,
				color,
				font,
				icons,
				padding,
			});
		});
	}
}
module.exports = Column;
