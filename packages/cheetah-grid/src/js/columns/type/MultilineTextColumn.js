'use strict';

const MultilineTextStyle = require('../style/MultilineTextStyle');
const BaseColumn = require('./BaseColumn');
const utils = require('./columnUtils');
class MultilineTextColumn extends BaseColumn {
	constructor(option = {}) {
		super(option);
	}
	get StyleClass() {
		return MultilineTextStyle;
	}
	clone() {
		return new MultilineTextColumn(this);
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase, getIcon}) {
		const {
			textAlign,
			textBaseline,
			color,
			font,
			bgColor,
			padding,
			lineHeight,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}
		const multilines = value.replace(/\r?\n/g, '\n').replace(/\r/g, '\n').split('\n');
		helper.testFontLoad(font, value, context);
		utils.loadIcons(getIcon(), context, helper, (icons, context) => {
			helper.multilineText(multilines, context, {
				textAlign,
				textBaseline,
				color,
				font,
				icons,
				padding,
				lineHeight,
			});
		});
	}
}

module.exports = MultilineTextColumn;
