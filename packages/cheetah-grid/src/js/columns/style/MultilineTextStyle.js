'use strict';
const Style = require('./Style');

function adj(style) {
	const {textBaseline = 'top'} = style;
	style.textBaseline = textBaseline;
	return style;
}
let defaultStyle;
class MultilineTextStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new MultilineTextStyle());
	}
	constructor(style = {}) {
		super(adj(style));
		this._lineHeight = style.lineHeight || '1em';
		this._autoWrapText = style.autoWrapText || false;
		this._lineClamp = style.lineClamp;
	}
	clone() {
		return new MultilineTextStyle(this);
	}
	get lineHeight() {
		return this._lineHeight;
	}
	set lineHeight(lineHeight) {
		this._lineHeight = lineHeight;
		this.doChangeStyle();
	}
	get lineClamp() {
		return this._lineClamp;
	}
	set lineClamp(lineClamp) {
		this._lineClamp = lineClamp;
		this.doChangeStyle();
	}
	get autoWrapText() {
		return this._autoWrapText;
	}
	set autoWrapText(autoWrapText) {
		this._autoWrapText = autoWrapText;
		this.doChangeStyle();
	}
}
module.exports = MultilineTextStyle;