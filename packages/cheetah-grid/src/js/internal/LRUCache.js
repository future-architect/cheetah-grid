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
			const list = this._list;
			const idx = list.indexOf(key);
			list.splice(idx, 1);
			list.push(key);
		}
		return val;
	}
	put(key, value) {
		const list = this._list;
		const map = this._map;
		if (map[key]) {
			const idx = list.indexOf(key);
			list.splice(idx, 1);
		}
		map[key] = value;
		list.push(key);
		if (list.length > this._cacheSize) {
			const remKey = list.shift();
			delete map[remKey];
		}
	}
}
module.exports = LRUCache;