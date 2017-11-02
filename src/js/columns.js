'use strict';
{
	const action = require('./columns/action');
	const type = require('./columns/type');
	const style = require('./columns/style');

	/**
	 * columns
	 * @type {Object}
	 * @namespace cheetahGrid.columns
	 * @memberof cheetahGrid
	 */
	module.exports = {
		action,
		type,
		style,
	};
}