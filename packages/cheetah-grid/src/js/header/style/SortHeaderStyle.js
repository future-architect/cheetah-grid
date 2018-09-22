'use strict';

const Style = require('./Style');

let defaultStyle;
class SortHeaderStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new SortHeaderStyle());
	}
	constructor(style = {}) {
		super(style);
		this._sortArrowColor = style.sortArrowColor;
	}
	get sortArrowColor() {
		return this._sortArrowColor;
	}
	set sortArrowColor(sortArrowColor) {
		this._sortArrowColor = sortArrowColor;
		this.doChangeStyle();
	}
	clone() {
		return new SortHeaderStyle(this);
	}
}


module.exports = SortHeaderStyle;
