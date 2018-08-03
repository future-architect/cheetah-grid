'use strict';

const IconStyle = require('../style/IconStyle');
const Column = require('./Column');
const icons = require('../../internal/icons');

function repeatArray(val, count) {
	if (count === Infinity) {
		count = 0;
	}
	const a = [];
	for (let i = 0; i < count; i++) {
		a.push(val);
	}
	return a;
}

class IconColumn extends Column {
	constructor(option = {}) {
		super(option);
		this._tagName = option.tagName || 'i';
		this._className = option.className;
		this._content = option.content;
		this._name = option.name;
		this._iconWidth = option.iconWidth;
	}
	get StyleClass() {
		return IconStyle;
	}
	clone() {
		return new IconColumn(this);
	}
	drawInternal(value, context, style, helper, grid, info) {
		const num = value - 0;
		if (!isNaN(num)) {
			const icon = {};
			icons.iconPropKeys.forEach((k) => {
				icon[k] = style[k];
			});
			icon.className = this._className;
			icon.tagName = this._tagName;
			icon.content = this._content;
			icon.name = this._name;
			if (this._iconWidth) {
				icon.width = this._iconWidth;
			}

			info.getIcon = () => repeatArray(icon, num);
		} else {
			info.getIcon = () => null;
		}
		super.drawInternal('', context, style, helper, grid, info);
	}
}
module.exports = IconColumn;
