'use strict';

const Column = require('./Column');
const NumberStyle = require('../style/NumberStyle');
let defaultFotmat;
class NumberColumn extends Column {
	static get defaultFotmat() {
		return defaultFotmat || (defaultFotmat = new Intl.NumberFormat());
	}
	static set defaultFotmat(fmt) {
		defaultFotmat = fmt;
	}
	constructor(option = {}) {
		super(option);
		this._format = option.format;
	}
	get StyleClass() {
		return NumberStyle;
	}
	clone() {
		return new NumberColumn(this);
	}
	get format() {
		return this._format;
	}
	withFormat(format) {
		const c = this.clone();
		c._format = format;
		return c;
	}
	convertInternal(value) {
		if (isNaN(value - 0)) {
			return value;
		}
		const format = this._format || NumberColumn.defaultFotmat;
		return format.format(value - 0);
	}
}

module.exports = NumberColumn;
