'use strict';
{
	const BaseStyle = require('./style/BaseStyle');
	const Style = require('./style/Style');
	const NumberStyle = require('./style/NumberStyle');
	const CheckStyle = require('./style/CheckStyle');
	const ButtonStyle = require('./style/ButtonStyle');
	const ImageStyle = require('./style/ImageStyle');
	const IconStyle = require('./style/IconStyle');
	const PercentCompleteBarStyle = require('./style/PercentCompleteBarStyle');

	/**
	 * column styles
	 * @type {Object}
	 * @namespace cheetahGrid.columns.style
	 * @memberof cheetahGrid.columns
	 */
	const style = {
		get EVENT_TYPE() {
			return BaseStyle.EVENT_TYPE;
		},
		get BaseStyle() {
			return BaseStyle;
		},
		get Style() {
			return Style;
		},
		get NumberStyle() {
			return NumberStyle;
		},
		get CheckStyle() {
			return CheckStyle;
		},
		get ButtonStyle() {
			return ButtonStyle;
		},
		get ImageStyle() {
			return ImageStyle;
		},
		get IconStyle() {
			return IconStyle;
		},
		get PercentCompleteBarStyle() {
			return PercentCompleteBarStyle;
		},
		of(columnStyle, record, StyleClass) {
			if (columnStyle) {
				if (columnStyle instanceof Style) {
					return columnStyle;
				} else if (typeof columnStyle === 'function') {
					return style.of(columnStyle(record), record, StyleClass);
				} else if (record && columnStyle in record) {
					return style.of(record[columnStyle], record, StyleClass);
				}
				return new StyleClass(columnStyle);
			} else {
				return StyleClass.DEFAULT;
			}
		}
	};
	module.exports = style;
}