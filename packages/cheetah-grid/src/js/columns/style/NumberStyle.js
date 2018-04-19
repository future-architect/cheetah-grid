'use strict';
{
	const Style = require('./Style');

	function adj(style) {
		const {textAlign = 'right'} = style;
		style.textAlign = textAlign;
		return style;
	}
	let defaultStyle;
	class NumberStyle extends Style {
		static get DEFAULT() {
			return defaultStyle ? defaultStyle : (defaultStyle = new NumberStyle());
		}
		constructor(style = {}) {
			super(adj(style));
		}
		clone() {
			return new NumberStyle(this);
		}
	}


	module.exports = NumberStyle;
}