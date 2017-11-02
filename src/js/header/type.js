'use strict';
{
	const Header = require('./type/Header');
	const SortHeader = require('./type/SortHeader');

	const type = {
		create(headerCell) {
			if (headerCell.sort) {
				return new SortHeader(headerCell);
			}
			return new Header(headerCell);
		}
	};
	module.exports = type;
}