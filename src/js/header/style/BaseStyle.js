'use strict';
{
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
					textAlign = 'left',
					textBaseline = 'middle',
					bgColor
				} = {}) {
			super();
			this._textAlign = textAlign;
			this._textBaseline = textBaseline;
			this._bgColor = bgColor;
		}
		get textAlign() {
			return this._textAlign;
		}
		set textAlign(textAlign) {
			this._textAlign = textAlign;
			this.doChangeStyle();
		}
		get textBaseline() {
			return this._textBaseline;
		}
		set textBaseline(textBaseline) {
			this._textBaseline = textBaseline;
			this.doChangeStyle();
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
}