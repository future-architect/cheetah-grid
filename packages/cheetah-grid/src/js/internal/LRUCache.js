'use strict';

class LRUCache {
	constructor(cacheSize) {
		this._list = [];
		this._map = {};
		this._cacheSize = cacheSize || 50;
	}
	get(key) {
		const val = this._map[key];
		if (val) {
			const idx = this._list.indexOf(key);
			this._list.splice(idx, 1);
			this._list.push(key);
		}
		return val;
	}
	put(key, value) {
		if (this._map[key]) {
			const idx = this._list.indexOf(key);
			this._list.splice(idx, 1);
		}
		this._map[key] = value;
		this._list.push(key);
		if (this._list.length > this._cacheSize) {
			const remKey = this._list.shift();
			delete this._map[remKey];
		}
	}
}
module.exports = LRUCache;