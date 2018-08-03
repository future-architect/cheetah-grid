'use strict';

const DataSource = require('./data/DataSource');
const CachedDataSource = require('./data/CachedDataSource');
const FilterDataSource = require('./data/FilterDataSource');


/**
 * data modules
 * @type {Object}
 * @namespace cheetahGrid.data
 * @memberof cheetahGrid
 */
module.exports = {
	DataSource,
	CachedDataSource,
	FilterDataSource
};
