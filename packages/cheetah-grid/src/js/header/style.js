'use strict';

const BaseStyle = require('./style/BaseStyle');
const Style = require('./style/Style');
const SortHeaderStyle = require('./style/SortHeaderStyle');

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
	of(columnStyle, StyleClass) {
		if (columnStyle) {
			if (columnStyle instanceof Style) {
				return columnStyle;
			} else if (typeof columnStyle === 'function') {
				return style.of(columnStyle(), StyleClass);
			}
			return new StyleClass(columnStyle);
		} else {
			return StyleClass.DEFAULT;
		}
	}
};
module.exports = style;
