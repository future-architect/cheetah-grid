import type { FieldDef, MaybePromise, MaybePromiseOrUndef } from "../ts-types";
import { each, isPromise } from "../internal/utils";
import { DataSource } from "./DataSource";
import { EventHandler } from "../internal/EventHandler";

/** @private */
type Filter<T> = (record: T | undefined) => boolean;

/** @private */
class DataSourceIterator<T> {
  _dataSource: DataSource<T>;
  _curIndex: number;
  _data: MaybePromiseOrUndef<T>[];
  constructor(dataSource: DataSource<T>) {
    this._dataSource = dataSource;
    this._curIndex = -1;
    this._data = [];
  }
  hasNext(): boolean {
    const next = this._curIndex + 1;
    return this._dataSource.length > next;
  }
  next(): MaybePromiseOrUndef<T> {
    const next = this._curIndex + 1;
    const data = this._getIndexData(next);
    this._curIndex = next;
    return data;
  }
  movePrev(): void {
    this._curIndex--;
  }
  _getIndexData(index: number, nest?: boolean): MaybePromiseOrUndef<T> {
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
/** @private */
class FilterData<T> {
  _owner: FilterDataSource<T>;
  _dataSourceItr: DataSourceIterator<T>;
  _filter: Filter<T>;
  _filteredList: (T | undefined)[];
  _queues: (Promise<T | undefined> | null)[];
  _cancel = false;
  constructor(
    dc: FilterDataSource<T>,
    original: DataSource<T>,
    filter: Filter<T>
  ) {
    this._owner = dc;
    this._dataSourceItr = new DataSourceIterator(original);
    this._filter = filter;
    this._filteredList = [];
    this._queues = [];
  }
  get(index: number): MaybePromiseOrUndef<T> {
    if (this._cancel) {
      return undefined;
    }
    const filteredList = this._filteredList;
    if (index < filteredList.length) {
      return filteredList[index];
    }
    const queues = this._queues;
    const indexQueue = queues[index];
    if (indexQueue) {
      return indexQueue;
    }
    return queues[index] || this._findIndex(index);
  }
  cancel(): void {
    this._cancel = true;
  }
  _findIndex(index: number): MaybePromiseOrUndef<T> {
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
  _findIndexWithTimeout(
    index: number,
    testTimeout: () => boolean
  ): MaybePromiseOrUndef<T> {
    const filteredList = this._filteredList;
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
        const queue = record.then((_value) => {
          queues[index] = null;
          return this.get(index);
        });
        queues[index] = queue;
        return queue;
      }
      if (filter(record)) {
        filteredList.push(record);
        if (index < filteredList.length) {
          return filteredList[index];
        }
      }
      if (testTimeout()) {
        const promise = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
        const queue = promise.then(() => {
          queues[index] = null;
          return this.get(index);
        });
        queues[index] = queue;
        return queue;
      }
    }
    const dc = this._owner;
    dc.length = filteredList.length;
    return undefined;
  }
}

/**
 * grid data source for filter
 *
 * @classdesc cheetahGrid.data.FilterDataSource
 * @memberof cheetahGrid.data
 */
export class FilterDataSource<T> extends DataSource<T> {
  private _dataSource: DataSource<T>;
  private _handler: EventHandler;
  private _filterData: FilterData<T> | null = null;
  static get EVENT_TYPE(): typeof DataSource.EVENT_TYPE {
    return DataSource.EVENT_TYPE;
  }
  constructor(dataSource: DataSource<T>, filter: Filter<T>) {
    super(dataSource);
    this._dataSource = dataSource;
    this.filter = filter;
    const handler = (this._handler = new EventHandler());
    handler.on(dataSource, DataSource.EVENT_TYPE.UPDATED_ORDER, () => {
      // reset
      // eslint-disable-next-line no-self-assign
      this.filter = this.filter;
    });
    each(DataSource.EVENT_TYPE, (type) => {
      handler.on(dataSource, type, (...args) =>
        this.fireListeners(type, ...args)
      );
    });
  }
  get filter(): Filter<T> | null {
    return this._filterData?._filter || null;
  }
  set filter(filter: Filter<T> | null) {
    if (this._filterData) {
      this._filterData.cancel();
    }
    this._filterData = filter
      ? new FilterData(this, this._dataSource, filter)
      : null;
    this.length = this._dataSource.length;
  }
  protected getOriginal(index: number): MaybePromiseOrUndef<T> {
    if (!this._filterData) {
      return super.getOriginal(index);
    }
    return this._filterData.get(index);
  }
  sort(field: FieldDef<T>, order: "desc" | "asc"): MaybePromise<void> {
    return this._dataSource.sort(field, order);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get source(): any {
    return this._dataSource.source;
  }
  get dataSource(): DataSource<T> {
    return this._dataSource;
  }
  dispose(): void {
    this._handler.dispose();
    super.dispose();
  }
}
