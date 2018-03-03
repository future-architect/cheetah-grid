'use strict';
{
	const {obj: {each}} = require('./utils');
	let nextId = 1;

	class EventHandler {
		constructor() {
			this._listeners = {};
		}
		on(target, type, listener, ...options) {
			if (target.addEventListener) {
				target.addEventListener(type, listener, ...options);
			}
			const obj = {
				target, type, listener, options
			};
			const id = nextId++;
			this._listeners[id] = obj;
			return id;
		}
		tryWithOffEvents(target, type, call) {
			const list = [];
			try {
				each(this._listeners, (obj) => {
					if (obj.target === target && obj.type === type) {
						if (obj.target.removeEventListener) {
							obj.target.removeEventListener(obj.type, obj.listener, ...obj.options);
						}
						list.push(obj);
					}
				});
				call();
			} finally {
				list.forEach((obj) => {
					if (obj.target.addEventListener) {
						obj.target.addEventListener(obj.type, obj.listener, ...obj.options);
					}
				});
			}
		}
		off(id) {
			if (!id) {
				return;
			}
			const obj = this._listeners[id];
			if (!obj) {
				return;
			}
			delete this._listeners[id];
			if (obj.target.removeEventListener) {
				obj.target.removeEventListener(obj.type, obj.listener, ...obj.options);
			}
		}
		fire(target, type, ...args) {
			each(this._listeners, (obj) => {
				if (obj.target === target && obj.type === type) {
					obj.listener.call(obj.target, ...args);
				}
			});
		}
		hasListener(target, type) {
			let result = false;
			each(this._listeners, (obj) => {
				if (obj.target === target && obj.type === type) {
					result = true;
				}
			});
			return result;
		}
		clear() {
			each(this._listeners, (obj) => {
				if (obj.target.removeEventListener) {
					obj.target.removeEventListener(obj.type, obj.listener, ...obj.options);
				}
			});
			this._listeners = {};
		}
		dispose() {
			this.clear();
			this._listeners = null;
		}
	}

	module.exports = EventHandler;
}