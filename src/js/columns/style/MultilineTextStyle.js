'use strict';
{
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
	}


	module.exports = MultilineTextStyle;
}