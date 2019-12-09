import { DataSource, DataSourceParam, PromiseCacheValue } from "./DataSource";
import {
  FieldData,
  FieldDef,
  MaybePromise,
  MaybePromiseOrUndef
} from "../ts-types";

function _setFieldCache<T, F extends FieldDef<T>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { _fCache }: CachedDataSource<T>,
  index: number,
  field: F,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: PromiseCacheValue<any>
): void {
  const recCache = _fCache[index] || (_fCache[index] = new Map());
  recCache.set(field, value);
}
/**
 * grid data source for caching Promise data
 *
 * @classdesc cheetahGrid.data.CachedDataSource
 * @extends cheetahGrid.data.DataSource
 * @memberof cheetahGrid.data
 */
export class CachedDataSource<T> extends DataSource<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _rCache: { [index: number]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _fCache: { [index: number]: Map<FieldDef<T>, any> };
  static get EVENT_TYPE(): typeof DataSource.EVENT_TYPE {
    return DataSource.EVENT_TYPE;
  }
  static ofArray<T>(array: T[]): CachedDataSource<T> {
    return new CachedDataSource({
      get: (index: number): T => array[index],
      length: array.length
    });
  }
  constructor(opt?: DataSourceParam<T>) {
    super(opt);
    this._rCache = {};
    this._fCache = {};
  }
  getOriginal(index: number): MaybePromiseOrUndef<T> {
    if (this._rCache && this._rCache[index]) {
      return this._rCache[index];
    }
    return super.getOriginal(index);
  }
  getOriginalField<F extends FieldDef<T>>(index: number, field: F): FieldData {
    const rowCache = this._fCache && this._fCache[index];
    if (rowCache) {
      const cache = rowCache.get(field);
      if (cache) {
        return cache;
      }
    }
    return super.getOriginalField(index, field);
  }
  setOriginalField<F extends FieldDef<T>>(
    index: number,
    field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): MaybePromise<boolean> {
    const fCache = this._fCache;
    if (fCache && fCache[index]) {
      delete fCache[index]; // clear row cache
    }
    return super.setOriginalField(index, field, value);
  }
  clearCache(): void {
    if (this._rCache) {
      this._rCache = {};
    }
    if (this._fCache) {
      this._fCache = {};
    }
  }
  fieldPromiseCallBackInternal<F extends FieldDef<T>>(
    index: number,
    field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: PromiseCacheValue<any>
  ): void {
    _setFieldCache(this, index, field, value);
  }
  recordPromiseCallBackInternal(
    index: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    record: PromiseCacheValue<T>
  ): void {
    this._rCache[index] = record;
  }
  dispose(): void {
    super.dispose();
  }
}