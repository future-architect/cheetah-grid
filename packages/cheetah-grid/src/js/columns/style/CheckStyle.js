'use strict';

const StdBaseStyle = require('./StdBaseStyle');

function adj(style) {
	const {textAlign = 'center'} = style;
	style.textAlign = textAlign;
	return style;
}
let defaultStyle;
class CheckStyle extends StdBaseStyle {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new CheckStyle());
	}
	constructor(style = {}) {
		super(adj(style));
		const {
			uncheckBgColor,
			checkBgColor,
			borderColor,
		} = style;
		this._uncheckBgColor = uncheckBgColor;
		this._checkBgColor = checkBgColor;
		this._borderColor = borderColor;
	}
	get uncheckBgColor() {
		return this._uncheckBgColor;
	}
	set uncheckBgColor(uncheckBgColor) {
		this._uncheckBgColor = uncheckBgColor;
		this.doChangeStyle();
	}
	get checkBgColor() {
		return this._checkBgColor;
	}
	set checkBgColor(checkBgColor) {
		this._checkBgColor = checkBgColor;
		this.doChangeStyle();
	}
	get borderColor() {
		return this._borderColor;
	}
	set borderColor(borderColor) {
		this._borderColor = borderColor;
		this.doChangeStyle();
	}
	clone() {
		return new CheckStyle(this);
	}
}


module.exports = CheckStyle;
