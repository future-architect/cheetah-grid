'use strict';

const StdBaseStyle = require('./StdBaseStyle');
let defaultStyle;
function adj(style) {
	const {textAlign = 'center'} = style;
	style.textAlign = textAlign;
	return style;
}
class ImageStyle extends StdBaseStyle {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new ImageStyle());
	}
	constructor(style = {}) {
		super(adj(style));
		this._imageSizing = style.imageSizing;
		this._margin = style.margin || 4;
	}
	get imageSizing() {
		return this._imageSizing;
	}
	set imageSizing(imageSizing) {
		this._imageSizing = imageSizing;
		this.doChangeStyle();
	}
	get margin() {
		return this._margin;
	}
	set margin(margin) {
		this._margin = margin;
		this.doChangeStyle();
	}
	clone() {
		return new ImageStyle(this);
	}
}
module.exports = ImageStyle;
