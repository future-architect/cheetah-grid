'use strict';

const {isPromise} = require('../../internal/utils');

function isDisabledRecord(option, grid, row) {
	if (typeof option === 'function') {
		const record = grid.getRowRecord(row);
		if (isPromise(record)) {
			return true;
		}
		return !!option(record);
	}
	return !!option;
}
function isReadOnlyRecord(option, grid, row) {
	return isDisabledRecord(option, grid, row);
}
module.exports = {
	isDisabledRecord,
	isReadOnlyRecord
};
