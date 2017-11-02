'use strict';
{
	const {isDef, obj: {each}} = require('../internal/utils');
	//private symbol
	const {_} = require('../internal/symbolManager').get();

	let nextId = 1;
	/**
	 * event target.
	 */
	class EventTarget {
		constructor() {
			this[_] = {};
			this[_].listeners = {};
			this[_].listenerData = {};
		}
		/**
		 * Adds an event listener.
		 * @param  {string} type The event type id.
		 * @param  {function} listener Callback method.
		 * @return {number} unique id for the listener.
		 */
		listen(type, listener) {
			const list = this[_].listeners[type] || (this[_].listeners[type] = []);
			list.push(listener);

			const id = nextId++;
			this[_].listenerData[id] = {
				type,
				listener,
				remove: () => {
					delete this[_].listenerData[id];
					const index = list.indexOf(listener);
					list.splice(index, 1);
					if (!this[_].listeners[type].length) {
						delete this[_].listeners[type];
					}
				},
			};
			return id;

		}
		/**
		 * Removes an event listener which was added with listen() by the id returned by listen().
		 * @param  {number} id the id returned by listen().
		 * @return {void}
		 */
		unlisten(id) {
			this[_].listenerData[id].remove();
		}
		addEventListener(type, listener) {
			this.listen(type, listener);
		}
		removeEventListener(type, listener) {
			each(this[_].listenerData, (obj, id) => {
				if (obj.type === type && obj.listener === listener) {
					this.unlisten(id);
				}
			});
		}
		hasListeners(type) {
			return !!this[_].listeners[type];
		}
		/**
		 * Fires all registered listeners
		 * @param  {string}    type The type of the listeners to fire.
		 * @param  {...*} args fire arguments
		 * @return {*} the result of the last listener
		 */
		fireListeners(type, ...args) {
			const list = this[_].listeners[type];
			if (!list) {
				return [];
			}
			return list.
				map((listener) => listener.call(this, ...args)).
				filter(isDef);
		}
		dispose() {
			delete this[_];
		}
	}

	module.exports = EventTarget;
}