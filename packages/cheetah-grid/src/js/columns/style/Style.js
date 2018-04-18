'use strict';
{
	const StdBaseStyle = require('./StdBaseStyle');
	let defaultStyle;
	class Style extends StdBaseStyle {
		static get DEFAULT() {
			return defaultStyle ? defaultStyle : (defaultStyle = new Style());
		}
		constructor(style = {}) {
			super(style);
			this._color = style.color;
			this._font = style.font;
			this._padding = style.padding;
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
		get padding() {
			return this._padding;
		}
		set padding(padding) {
			this._padding = padding;
			this.doChangeStyle();
		}
		clone() {
			return new Style(this);
		}
	}
	module.exports = Style;
}