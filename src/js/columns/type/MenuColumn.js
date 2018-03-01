'use strict';
{
	const {normalize, toObject} = require('../../internal/menu-items');
	const BaseColumn = require('./BaseColumn');
	const Style = require('../style/Style');
	const utils = require('./columnUtils');

	class MenuColumn extends BaseColumn {
		constructor(option = {}) {
			super(option);
			this._options = normalize(option.options);
			this._optionsMap = toObject(this._options);
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
			c._optionsMap = toObject(c._options);
			return c;
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
				const basePadding = helper.toBoxPixelArray(padding || 0, context);
				const textPadding = basePadding.slice(0);
				textPadding[1] += 26;// icon padding
				const iconPadding = basePadding.slice(0);
				iconPadding[1] += 8;
				helper.text(value, context, {
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
			const options = this._optionsMap;
			if (value in options) {
				value = options[value];
			}
			return super.convertInternal(value);
		}
	}

	module.exports = MenuColumn;
}