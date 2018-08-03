'use strict';

const EventTarget = require('../../core/EventTarget');

const EVENT_TYPE = {
	CHANGE_STYLE: 'change_style',
};

let defaultStyle;
class BaseStyle extends EventTarget {
	static get EVENT_TYPE() {
		return EVENT_TYPE;
	}
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new BaseStyle());
	}
	constructor(
			{
				bgColor
			} = {}) {
		super();
		this._bgColor = bgColor;
	}
	get bgColor() {
		return this._bgColor;
	}
	set bgColor(bgColor) {
		this._bgColor = bgColor;
		this.doChangeStyle();
	}
	doChangeStyle() {
		this.fireListeners(EVENT_TYPE.CHANGE_STYLE);
	}
	clone() {
		return new BaseStyle(this);
	}
}
module.exports = BaseStyle;
