'use strict';

const Style = require('./Style');

function adj(style) {
	const {textAlign = 'center'} = style;
	style.textAlign = textAlign;
	return style;
}
let defaultStyle;
class ButtonStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new ButtonStyle());
	}
	constructor(style = {}) {
		super(adj(style));
		const {
			buttonBgColor,
		} = style;
		this._buttonBgColor = buttonBgColor;
	}
	get buttonBgColor() {
		return this._buttonBgColor;
	}
	set buttonBgColor(buttonBgColor) {
		this._buttonBgColor = buttonBgColor;
		this.doChangeStyle();
	}
	clone() {
		return new ButtonStyle(this);
	}
}


module.exports = ButtonStyle;
