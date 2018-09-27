'use strict';

const Style = require('./Style');

let defaultStyle;
class MenuStyle extends Style {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new MenuStyle());
	}
	constructor(style = {}) {
		super(style);
		const {
			appearance,
		} = style;
		this._appearance = appearance;
	}
	get appearance() {
		return this._appearance || 'menulist-button';
	}
	set appearance(appearance) {
		this._appearance = appearance;
		this.doChangeStyle();
	}
	clone() {
		return new MenuStyle(this);
	}
}


module.exports = MenuStyle;
