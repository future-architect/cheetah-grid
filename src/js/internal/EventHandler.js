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