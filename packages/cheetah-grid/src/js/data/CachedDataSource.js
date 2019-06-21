'use strict';

const DataSource = require('./DataSource');

function _setFieldCache({_fCache}, index, field, value) {
	const recCache = _fCache[index] || (_fCache[index] = new Map());
	recCache.set(field, value);
}
/**
	 * grid data source for caching Promise data
	 *
	 * @classdesc cheetahGrid.data.CachedDataSource
	 * @extends cheetahGrid.data.DataSource
	 * @memberof cheetahGrid.data
	 */
class CachedDataSource extends DataSource {
	static get EVENT_TYPE() {
		return DataSource.EVENT_TYPE;
	}
	static ofArray(array) {
		return new CachedDataSource({
			get: (index) => array[index],
			length: array.length
		});
	}
	constructor(opt = {}) {
		super(opt);
		this._rCache = {};
		this._fCache = {};
	}
	getOriginal(index) {
		if (this._rCache && this._rCache[index]) {
			return this._rCache[index];
		}
		return super.getOriginal(index);
	}
	getOriginalField(index, field) {
		const rowCache = this._fCache && this._fCache[index];
		if (rowCache) {
			const cache = rowCache.get(field);
			if (cache) {
				return cache;
			}
		}
		return super.getOriginalField(index, field);
	}
	setOriginalField(index, field, value) {
		const fCache = this._fCache;
		if (fCache && fCache[index]) {
			delete fCache[index]; // clear row cache
		}
		return super.setOriginalField(index, field, value);
	}
	clearCache() {
		if (this._rCache) {
			this._rCache = {};
		}
		if (this._fCache) {
			this._fCache = {};
		}
	}
	fieldPromiseCallBackInternal(index, field, val) {
		_setFieldCache(this, index, field, val);
	}
	recordPromiseCallBackInternal(index, val) {
		this._rCache[index] = val;
	}
	dispose() {
		super.dispose();
	}
}

module.exports = CachedDataSource;
