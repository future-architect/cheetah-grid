'use strict';

let arrayFind;
let arrayFindIndex;
const array = {
	get find() {
		if (arrayFind) {
			return arrayFind;
		}
		if (Array.prototype.find) {
			arrayFind = (arr, predicate) => Array.prototype.find.call(arr, predicate);
		} else {
			arrayFind = (arr, predicate) => {
				const index = array.findIndex(arr, predicate);
				return index >= 0 ? arr[index] : undefined;
			};
		}
		return arrayFind;
	},
	get findIndex() {
		if (arrayFindIndex) {
			return arrayFindIndex;
		}
		if (Array.prototype.findIndex) {
			arrayFindIndex = (arr, predicate) => Array.prototype.findIndex.call(arr, predicate);
		} else {
			arrayFindIndex = (arr, predicate) => {
				const {length} = arr;
				for (let i = 0; i < length; i++) {
					const value = arr[i];
					if (predicate(value, i, arr)) {
						return i;
					}
				}
				return -1;
			};
		}
		return arrayFindIndex;
	},
};

function isDef(data) {
	return data !== null && typeof data !== 'undefined';
}
const ua = window.navigator.userAgent.toLowerCase();
const IE = (ua.match(/(msie)/) || ua.match(/trident/));
const Chrome = (ua.indexOf('chrome') > -1) && (ua.indexOf('edge') === -1);
const Firefox = (ua.indexOf('firefox') > -1);

function setReadonly(obj, name, value) {
	Object.defineProperty(obj, name, {
		enumerable: false,
		configurable: true,
		value,
	});
}

function each(obj, fn) {
	for (const key in obj) {
		fn(obj[key], key, obj);
	}
}

function isObject(obj) {
	return obj === Object(obj);
}

function extend(...args) {
	const result = {};
	args.forEach((source) => {
		for (const key in source) {
			Object.defineProperty(result, key, {
				get() {
					return source[key];
				},
				set(val) {
					source[key] = val;
				},
				configurable: true,
				enumerable: true,
			});
		}
	});
	return result;
}
function isDescendantElement(root, target) {
	while (target.parentElement) {
		const p = target.parentElement;
		if (root === p) {
			return true;
		}
		target = p;
	}
	return false;
}
function applyChainSafe(obj, fn, ...names) {
	let value = obj;
	for (let i = 0; i < names.length && isDef(value); i++) {
		value = fn(value, names[i]);
	}
	return value;
}
function getChainSafe(obj, ...names) {
	return applyChainSafe(obj, (val, name) => val[name], ...names);
}
function getOrApply(value, ...args) {
	if (typeof value === 'function') {
		return value(...args);
	} else {
		return value;
	}
}
function endsWith(str, searchString, position) {
	const subjectString = str.toString();
	if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
		position = subjectString.length;
	}
	position -= searchString.length;
	const lastIndex = subjectString.lastIndexOf(searchString, position);
	return lastIndex !== -1 && lastIndex === position;
}
const isPromise = (data) => data && typeof data.then === 'function';
const then = (result, callback) => isPromise(result) ? result.then((r) => callback(r)) : callback(result);
function getMouseButtons(e) {
	if (isDef(e.buttons)) {
		return e.buttons;
	}
	/*for legacy*/
	if (isDef(e.which)) {
		if (e.which === 3) { //right?
			return 4;
		}
		if (e.which === 2) { //middle?
			return 4;
		}
		return e.which;//left or no
	}

	if (e.button === 0 || e.button === 1) {
		return 1;//candidate left
	}
	if (e.button === 2) {
		return 2;// right
	}
	return 0;//no or middle?
}
function getKeyCode(e) {
	return e.keyCode || e.which;
}
function isTouchEvent(e) {
	return !!e.changedTouches;
}
function getIgnoreCase(obj, name) {
	if (obj[name]) {
		return obj[name];
	}
	const l = name.toLowerCase();
	if (obj[l]) {
		return obj[l];
	}
	const u = name.toLowerCase();
	if (obj[u]) {
		return obj[u];
	}
	for (const k in obj) {
		if (k.toLowerCase() === l) {
			return obj[k];
		}
	}
	return undefined;
}
function cancel(e) {
	e.preventDefault();
	e.stopPropagation();
}


function toBoxArray(obj) {
	if (!Array.isArray(obj)) {
		return [obj/*top*/, obj/*right*/, obj/*bottom*/, obj/*left*/];
	}
	if (obj.length === 3) {
		return [obj[0]/*top*/, obj[1]/*right*/, obj[2]/*bottom*/, obj[1]/*left*/];
	}
	if (obj.length === 2) {
		return [obj[0]/*top*/, obj[1]/*right*/, obj[0]/*bottom*/, obj[1]/*left*/];
	}
	if (obj.length === 1) {
		return [obj[0]/*top*/, obj[0]/*right*/, obj[0]/*bottom*/, obj[0]/*left*/];
	}
	return obj;
}

// Chrome 33554431
// FireFox 17895588
// IE 10737433
module.exports = {
	isDef,
	browser: {
		IE,
		Chrome,
		Firefox,
		heightLimit: Chrome ? 33554431
		: Firefox ? 17895588
		: 10737433 // default IE limit
	},
	extend,
	isDescendantElement,
	getChainSafe,
	applyChainSafe,
	getOrApply,
	getIgnoreCase,
	isPromise,
	then,
	array,
	obj: {
		setReadonly,
		each,
		isObject,
	},
	str: {
		endsWith
	},
	event: {
		getMouseButtons,
		getKeyCode,
		isTouchEvent,
		cancel,
	},
	style: {
		toBoxArray,
	},
	emptyFn() {},
};
