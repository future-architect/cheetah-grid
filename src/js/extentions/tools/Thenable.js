'use strict';


const {isPromise} = require('../../internal/utils');
function toArray(arr) {
	return Array.prototype.slice.call(arr);
}

//Promiseを必要な分だけ模倣した簡易版クラス
class Thenable {
	static resolve(arg) {
		if (isPromise(arg)) {
			return arg;
		}
		return new Thenable((resolve) => {
			resolve(arg);
		});
	}
	static all(iterable) {
		return new Thenable((resolve) => {
			const result = [];
			const delays = [];
			let waits;
			toArray(iterable).forEach((e, i) => {
				if (isPromise(e)) {
					delays.push(() => {
						e.then((r) => {
							result[i] = r;
							waits--;
							if (waits === 0) {
								resolve(result);
							}
						});
					});
				} else {
					result[i] = e;
				}
			});
			waits = delays.length;
			if (waits === 0) {
				resolve(result);
			} else {
				delays.forEach((f) => f());
			}
		});
	}
	constructor(executor) {
		this._listeners = [];
		this._execute(executor);
	}
	then(fn) {
		return new Thenable((resolve) => {
			if (this._listeners) {
				this._listeners.push((res) => {
					resolve(fn(res));
				});
			} else {
				resolve(fn(this._res));
			}
		});
	}
	_execute(executor) {
		let resolved = false;
		executor((res) => {
			if (resolved) {
				return false;
			}
			resolved = true;
			this._handle(res);
			return true;
		});
	}
	_handle(res) {
		if (isPromise(res)) {
			this._handlePromise(res);
		} else {
			this._handleResult(res);
		}
	}
	_handlePromise(res) {
		res.then((r) => {
			this._handle(r);
		});
	}
	_handleResult(res) {
		this._res = res;
		const listeners = this._listeners;
		this._listeners = null;
		listeners.forEach((fn) => fn(res));
	}
}

module.exports = Thenable;