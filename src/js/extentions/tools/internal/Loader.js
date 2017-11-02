'use strict';

const Thenable = require('../Thenable');

class Loader extends Thenable {
	static thenableOf(thenable) {
		return new Loader((resolve) => {
			thenable.then(resolve);
		});
	}
	get() {
		if (this._loaded) {
			return this._result;
		}
		this.then((res) => {
			this._result = res;
			this._loaded = true;
		});
		if (!this._loaded) {
			return undefined;
		}
		return this._result;
	}
}

module.exports = Loader;