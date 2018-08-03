'use strict';

const {normalize} = require('../../internal/menu-items');
const {isDef} = require('../../internal/utils');
const BaseColumn = require('./BaseColumn');
const Style = require('../style/Style');
const utils = require('./columnUtils');

class MenuColumn extends BaseColumn {
	constructor(option = {}) {
		super(option);
		this._options = normalize(option.options);
	}
	get StyleClass() {
		return Style;
	}
	clone() {
		return new MenuColumn(this);
	}
	get options() {
		return this._options;
	}
	withOptions(options) {
		const c = this.clone();
		c._options = normalize(options);
		return c;
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase, getIcon}) {
		const {
			textAlign,
			textBaseline,
			font,
			bgColor,
			padding,
		} = style;
		let {
			color,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}
		const text = this._convertInternal(value);
		helper.testFontLoad(font, text, context);
		utils.loadIcons(getIcon(), context, helper, (icons, context) => {
			const basePadding = helper.toBoxPixelArray(padding || 0, context, font);
			const textPadding = basePadding.slice(0);
			textPadding[1] += 26;// icon padding
			const iconPadding = basePadding.slice(0);
			iconPadding[1] += 8;
			if (!isDef(color) && (!isDef(value) || value === '')) {
				color = 'rgba(0, 0, 0, .38)';
			}
			helper.text(text, context, {
				textAlign,
				textBaseline,
				color,
				font,
				icons,
				padding: textPadding,
			});
			// draw icon
			helper.text('', context, {
				textAlign: 'right',
				textBaseline,
				color,
				font,
				icons: [{
					path: 'M0 2 5 7 10 2z',
					width: 10,
					color: 'rgba(0, 0, 0, .54)',
				}],
				padding: iconPadding,
			});

		});
	}
	convertInternal(value) {
		return value;
	}
	_convertInternal(value) {
		const options = this._options;
		for (let i = 0; i < options.length; i++) {
			const option = options[i];
			if (option.value === value) {
				value = option.caption;
				break;
			}
		}
		return super.convertInternal(value);
	}
}

module.exports = MenuColumn;
