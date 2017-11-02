'use strict';
{
	const {isPromise} = require('./utils');

	function wait(val) {
		return val.then((v) => {
			if (isPromise(v)) {
				return wait(v);
			} else {
				return v;
			}
		});
	}
	function createArray(get, length) {
		const array = new Array(length);
		for (let i = 0; i < length; i++) {
			array[i] = get(i);
		}
		return array;
	}
	function createArrayPromise(get, getField, length) {
		return new Promise((resolve) => {
			const plist = [];
			const array = new Array(length);
			for (let i = 0; i < length; i++) {
				const data = get(i);
				const record = {
					v: data,
					f: data
				};
				array[i] = record;
				if (isPromise(data)) {
					plist.push(wait(data).then((v) => {
						record.v = v;
						record.f = v;
					}));
				}
			}
			Promise.all(plist).then(
					() => setArrayField(array, getField)
			).then(resolve);
		});
	}
	function setArrayField(array, getField) {
		if (!getField) {
			return Promise.resolve(array);
		}
		return new Promise((resolve) => {
			const length = array.length;
			const plist = [];
			for (let i = 0; i < length; i++) {
				const record = array[i];
				record.f = getField(record.v);
				if (isPromise(record.f)) {
					plist.push(wait(record.f).then((v) => {
						record.f = v;
					}));
				}
			}
			Promise.all(plist).then(() => resolve(array));
		});
	}
	const sort = {
		sort(get, set, length, compare, getField) {
			const old = createArray(get, length);
			if (getField) {
				old.sort((r1, r2) => compare(getField(r1), getField(r2)));
			} else {
				old.sort(compare);
			}
			for (let i = 0; i < length; i++) {
				set(i, old[i]);
			}
		},
		sortArray(array, compare) {
			Array.prototype.sort.call(array, compare);
		},
		sortPromise(get, set, length, compare, getField) {
			if (window.Promise) {
				return createArrayPromise(get, getField, length).then((array) => {
					array.sort((r1, r2) => compare(r1.f, r2.f));
					for (let i = 0; i < length; i++) {
						set(i, array[i].v);
					}
				});
			} else {
				sort.sort(get, set, length, compare, getField);
				const dummyPromise = {
					then(fn) {
						fn();
						return dummyPromise;
					},
					catch() {
						return dummyPromise;
					}
				};
				return dummyPromise;
			}
		}
	};
	module.exports = sort;
}