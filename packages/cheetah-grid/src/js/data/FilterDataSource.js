'use strict';
const {isPromise} = require('../internal/utils');
const DataSource = require('./DataSource');
const EventHandler = require('../internal/EventHandler');

const {EVENT_TYPE} = DataSource;

class DataSourceIterator {
	constructor(dataSource) {
		this._dataSource = dataSource;
		this._curIndex = -1;
		this._data = [];
	}
	hasNext() {
		const next = this._curIndex + 1;
		return this._dataSource.length > next;
	}
	next() {
		const next = this._curIndex + 1;
		const data = this._getIndexData(next);
		this._curIndex = next;
		return data;
	}
	movePrev() {
		this._curIndex--;
	}
	_getIndexData(index, nest) {
		const dataSource = this._dataSource;
		const data = this._data;
		if (index < data.length) {
			return data[index];
		}

		if (dataSource.length <= index) {
			return undefined;
		}
		const record = this._dataSource.get(index);
		data[index] = record;
		if (isPromise(record)) {
			record.then((val) => {
				data[index] = val;
			});
			if (!nest) {
				for (let i = 1; i <= 100; i++) {
					this._getIndexData(index + i, true);
				}
			}
		}
		return record;
	}

}
class FilterData {
	constructor(dc, original, filter) {
		this._owner = dc;
		this._dataSourceItr = new DataSourceIterator(original);
		this._filter = filter;
		this._filterdList = [];
		this._queues = [];
	}
	get(index) {
		if (this._cancel) {
			return undefined;
		}
		const filterdList = this._filterdList;
		if (index < filterdList.length) {
			return filterdList[index];
		}
		const queues = this._queues;
		if (queues[index]) {
			return queues[index];
		}
		return queues[index] || this._findIndex(index);
	}
	cancel() {
		this._cancel = true;
	}
	_findIndex(index) {
		if (window.Promise) {
			const timeout = Date.now() + 100;
			let count = 0;
			return this._findIndexWithTimeout(index, () => {
				count++;
				if (count >= 100) {
					count = 0;
					return timeout < Date.now();
				}
				return false;
			});
		}
		return this._findIndexWithTimeout(index, () => false);
	}
	_findIndexWithTimeout(index, testTimeout) {
		const filterdList = this._filterdList;
		const filter = this._filter;
		const dataSourceItr = this._dataSourceItr;

		const queues = this._queues;


		while (dataSourceItr.hasNext()) {
			if (this._cancel) {
				return undefined;
			}
			const record = dataSourceItr.next();
			if (isPromise(record)) {
				dataSourceItr.movePrev();
				return (queues[index] = record.then((value) => {
					queues[index] = null;
					return this.get(index);
				}));
			}
			if (filter(record)) {
				filterdList.push(record);
				if (index < filterdList.length) {
					return filterdList[index];
				}
			}
			if (testTimeout()) {
				const promise = new Promise((resolve) => {
					setTimeout(() => {
						resolve();
					}, 300);
				});
				queues[index] = promise.then(() => {
					queues[index] = null;
					return this.get(index);
				});
				return queues[index];
			}
		}
		const dc = this._owner;
		dc.length = filterdList.length;
		return undefined;
	}
}

/**
 * grid data source for filter
 *
 * @classdesc cheetahGrid.data.FilterDataSource
 * @extends cheetahGrid.data.DataSource
 * @memberof cheetahGrid.data
 */
class FilterDataSource extends DataSource {
	static get EVENT_TYPE() {
		return EVENT_TYPE;
	}
	constructor(dataSource, filter) {
		super(dataSource);
		this._dataSource = dataSource;
		this.filter = filter;
		const handler =	this._handler = new EventHandler();
		handler.on(dataSource, EVENT_TYPE.UPDATED_ORDER, () => {
			// reset
			// eslint-disable-next-line no-self-assign
			this.filter = this.filter;
		});
		for (const k in EVENT_TYPE) {
			const type = EVENT_TYPE[k];
			handler.on(dataSource, type, (...args) => this.fireListeners(type, ...args));
		}
	}
	get filter() {
		return this._filterData && this._filterData._filter || undefined;
	}
	set filter(filter) {
		if (this._filterData) {
			this._filterData.cancel();
		}
		this._filterData = filter ? new FilterData(this, this._dataSource, filter) : undefined;
		this.length = this._dataSource.length;
	}
	getOriginal(index) {
		if (!this._filterData) {
			return super.getOriginal(index);
		}
		return this._filterData.get(index);
	}
	sort(...args) {
		return this._dataSource.sort(...args);
	}
	dispose() {
		this._handler.dispose();
		super.dispose();
	}
}

module.exports = FilterDataSource;