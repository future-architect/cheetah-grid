'use strict';

const indexFirst = (ary, elm) => {
	let low = 0;
	let high = ary.length - 1;
	while (low <= high) {
		const i = Math.floor((low + high) / 2);
		if (ary[i] === elm) {
			return i;
		} else if (ary[i] > elm) {
			high = i - 1;
		} else {
			low = i + 1;
		}
	}
	return high < 0 ? 0 : high;
};


class NumberMap {
	constructor() {
		this._keys = [];
		this._vals = {};
		this._sorted = false;
	}
	put(key, value) {
		if (!(key in this._vals)) {
			this._keys.push(key);
			this._sorted = false;
		}
		this._vals[key] = value;
	}
	get(key) {
		return this._vals[key];
	}
	each(keyFrom, keyTo, fn) {
		const {_keys: keys} = this;
		const {length} = keys;
		if (!this._sorted) {
			keys.sort((a, b) => {
				if (a < b) { return -1; }
				if (a > b) { return 1; }
				return 0;
			});
			this._sorted = true;
		}

		for (let i = indexFirst(keys, keyFrom); i < length; i++) {
			const key = keys[i];
			if (keyFrom <= key && key <= keyTo) {
				fn(this.get(key), key);
			} else if (keyTo < key) {
				return;
			}
		}
	}
}

module.exports = NumberMap;
