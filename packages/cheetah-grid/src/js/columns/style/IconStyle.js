'use strict';

const Style = require('./Style');

function adj(style) {
	const {textAlign = 'center'} = style;
	style.textAlign = textAlign;
	return style;
}
let defaultStyle;
class IconStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new IconStyle());
	}
	constructor(style = {}) {
		super(adj(style));
	}
	clone() {
		return new IconStyle(this);
	}
}


module.exports = IconStyle;
