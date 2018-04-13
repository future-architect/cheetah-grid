'use strict';
{
	const DataSource = require('./data/DataSource');
	const CachedDataSource = require('./data/CachedDataSource');


	/**
	 * data modules
	 * @type {Object}
	 * @namespace cheetahGrid.data
	 * @memberof cheetahGrid
	 */
	module.exports = {
		DataSource,
		CachedDataSource
	};
}