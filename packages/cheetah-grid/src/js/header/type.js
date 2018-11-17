'use strict';

const BaseHeader = require('./type/BaseHeader');
const Header = require('./type/Header');
const SortHeader = require('./type/SortHeader');
const CheckHeader = require('./type/CheckHeader');

const type = {
	TYPES: {
		DEFAULT: new Header(),
		SORT: new SortHeader(),
		CHECK: new CheckHeader(),
	},
	get BaseHeader() {
		return BaseHeader;
	},
	get Header() {
		return Header;
	},
	get SortHeader() {
		return Header;
	},
	get CheckHeader() {
		return CheckHeader;
	},
	of(headerType) {
		if (!headerType) {
			return type.TYPES.DEFAULT;
		} else if (typeof headerType === 'string') {
			return type.TYPES[headerType.toUpperCase()] || type.of(null);
		} else {
			return headerType;
		}
	},
	ofCell(headerCell) {
		if (headerCell.sort) {
			return type.TYPES.SORT;
		}

		return type.of(headerCell.headerType);
	}
};
module.exports = type;
