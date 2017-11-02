'use strict';
{
	const BaseStyle = require('./BaseStyle');
	let defaultStyle;
	class Style extends BaseStyle {
		static get DEFAULT() {
			return defaultStyle ? defaultStyle : (defaultStyle = new Style());
		}
		constructor(style = {}) {
			super(style);
			this._color = style.color;
			this._font = style.font;
		}
		get color() {
			return this._color;
		}
		set color(color) {
			this._color = color;
			this.doChangeStyle();
		}
		get font() {
			return this._font;
		}
		set font(font) {
			this._font = font;
			this.doChangeStyle();
		}
		clone() {
			return new Style(this);
		}
	}
	module.exports = Style;
}