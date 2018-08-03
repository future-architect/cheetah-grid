'use strict';

const Style = require('./Style');
let defaultStyle;
const DEFAULT_BAR_COLOR = (num) => {
	if (num > 80) {
		return '#20a8d8';
	}
	if (num > 50) {
		return '#4dbd74';
	}
	if (num > 20) {
		return '#ffc107';
	}
	return '#f86c6b';
};
class PercentCompleteBarStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new PercentCompleteBarStyle());
	}
	constructor(style = {}) {
		super(style);
		this._barColor = style.barColor || DEFAULT_BAR_COLOR;
		this._barBgColor = style.barBgColor || '#f0f3f5';
		this._barHeight = style.barHeight || 3;
	}
	get barColor() {
		return this._barColor;
	}
	set barColor(barColor) {
		this._barColor = barColor;
		this.doChangeStyle();
	}
	get barBgColor() {
		return this._barBgColor;
	}
	set barBgColor(barBgColor) {
		this._barBgColor = barBgColor;
		this.doChangeStyle();
	}
	get barHeight() {
		return this._barHeight;
	}
	set barHeight(barHeight) {
		this._barHeight = barHeight;
		this.doChangeStyle();
	}
	clone() {
		return new PercentCompleteBarStyle(this);
	}
}
module.exports = PercentCompleteBarStyle;
