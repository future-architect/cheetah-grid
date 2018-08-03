'use strict';

const Column = require('./type/Column');
const NumberColumn = require('./type/NumberColumn');
const CheckColumn = require('./type/CheckColumn');
const ButtonColumn = require('./type/ButtonColumn');
const ImageColumn = require('./type/ImageColumn');
const PercentCompleteBarColumn = require('./type/PercentCompleteBarColumn');
const IconColumn = require('./type/IconColumn');
const BranchGraphColumn = require('./type/BranchGraphColumn');
const MenuColumn = require('./type/MenuColumn');
const MultilineTextColumn = require('./type/MultilineTextColumn');

/**
 * column types
 * @type {Object}
 * @namespace cheetahGrid.columns.type
 * @memberof cheetahGrid.columns
 */
const type = {
	TYPES: {
		DEFAULT: new Column(),
		NUMBER: new NumberColumn(),
		CHECK: new CheckColumn(),
		BUTTON: new ButtonColumn(),
		IMAGE: new ImageColumn(),
		MULTILINETEXT: new MultilineTextColumn(),
	},
	get Column() {
		return Column;
	},
	get NumberColumn() {
		return NumberColumn;
	},
	get CheckColumn() {
		return CheckColumn;
	},
	get ButtonColumn() {
		return ButtonColumn;
	},
	get ImageColumn() {
		return ImageColumn;
	},
	get PercentCompleteBarColumn() {
		return PercentCompleteBarColumn;
	},
	get IconColumn() {
		return IconColumn;
	},
	get BranchGraphColumn() {
		return BranchGraphColumn;
	},
	get MenuColumn() {
		return MenuColumn;
	},
	get MultilineTextColumn() {
		return MultilineTextColumn;
	},
	of(columnType) {
		if (!columnType) {
			return type.TYPES.DEFAULT;
		} else if (typeof columnType === 'string') {
			return type.TYPES[columnType.toUpperCase()] || type.of(null);
		} else {
			return columnType;
		}
	}
};
module.exports = type;
