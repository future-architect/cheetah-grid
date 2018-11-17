'use strict';

const BaseStyle = require('./style/BaseStyle');
const Style = require('./style/Style');
const SortHeaderStyle = require('./style/SortHeaderStyle');
const CheckHeaderStyle = require('./style/CheckHeaderStyle');

const style = {
	get BaseStyle() {
		return BaseStyle;
	},
	get Style() {
		return Style;
	},
	get SortHeaderStyle() {
		return SortHeaderStyle;
	},
	get CheckHeaderStyle() {
		return CheckHeaderStyle;
	},
	of(headerStyle, StyleClass) {
		if (headerStyle) {
			if (headerStyle instanceof Style) {
				return headerStyle;
			} else if (typeof headerStyle === 'function') {
				return style.of(headerStyle(), StyleClass);
			}
			return new StyleClass(headerStyle);
		} else {
			return StyleClass.DEFAULT;
		}
	}
};
module.exports = style;
