import * as sort from "../internal/sort";
import type {
  DataSourceAPI,
  FieldAssessor,
  FieldData,
  FieldDef,
  MaybePromise,
  MaybePromiseOrCall,
  MaybePromiseOrCallOrUndef,
  MaybePromiseOrUndef,
} from "../ts-types";
import {
  applyChainSafe,
  array,
  emptyFn,
  getOrApply,
  isPromise,
  obj,
} from "../internal/utils";
import { EventTarget } from "../core/EventTarget";
import type { PromiseCacheValue } from "./internal/types";

/** @private */
function isFieldAssessor<T>(field: FieldDef<T>): field is FieldAssessor<T> {
  if (obj.isObject(field)) {
    if ((field as FieldAssessor<T>).get && (field as FieldAssessor<T>).set) {
      return true;
    }
  }
  return false;
}

/** @private */
const EVENT_TYPE = {
  UPDATE_LENGTH: "update_length",
  UPDATED_LENGTH: "updated_length",
  UPDATED_ORDER: "updated_order",
} as const;

/** @private */
type PromiseBack<V> = (value: PromiseCacheValue<V>) => void;

/** @private */
type CompareResult = -1 | 0 | 1;

/** @private */
function ascOrderFn<T>(v1: T, v2: T): CompareResult {
  if (v1 === v2) {
    return 0;
  }
  if (v1 == null) {
    return v2 == null
      ? // If both are nullish, consider a match.
        0
      : // Nulls first
        -1;
  }
  if (v2 == null) {
    // Nulls first
    return 1;
  }
  return v1 > v2 ? 1 : -1;
}
function descOrderFn<T>(v1: T, v2: T): CompareResult {
  return (ascOrderFn(v1, v2) * -1) as CompareResult;
}

/** @private */
function getValue<V>(
  value: MaybePromiseOrCallOrUndef<V, []>,
  setPromiseBack: PromiseBack<V>
): MaybePromiseOrUndef<V> {
  const maybePromiseValue = getOrApply(value);
  if (isPromise(maybePromiseValue)) {
    const promiseValue = maybePromiseValue.then((r: V | undefined) => {
      setPromiseBack(r);
      return r;
    });
    //一時的にキャッシュ
    setPromiseBack(promiseValue);
    return promiseValue;
  } else {
    return maybePromiseValue;
  }
}

/** @private */
function getField<T, F extends FieldDef<T>>(
  record: MaybePromiseOrUndef<T>,
  field: F,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPromiseBack: PromiseBack<any>
): FieldData {
  if (record == null) {
    return undefined;
  }
  if (isPromise(record)) {
    return record.then((r: T | undefined) =>
      getField(r, field, setPromiseBack)
    );
  }
  const fieldGet = isFieldAssessor<T>(field) ? field.get : field;
  if ((fieldGet as never) in (record as never)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldResult = (record as any)[fieldGet];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getValue(fieldResult, setPromiseBack);
  }
  if (typeof fieldGet === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldResult = (fieldGet as any)(record);
    return getValue(fieldResult, setPromiseBack);
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const ss = String(fieldGet).split(".");
  if (ss.length <= 1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldResult = (record as any)[fieldGet];
    return getValue(fieldResult, setPromiseBack);
  }
  const fieldResult = applyChainSafe(
    record,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (val, name) => getField(val, name, emptyFn as any),
    ...ss
  );
  return getValue(fieldResult, setPromiseBack);
}

/** @private */
function setField<T, F extends FieldDef<T>>(
  record: T | undefined,
  field: F,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): boolean {
  if (record == null) {
    return false;
  }

  const fieldSet = isFieldAssessor<T>(field) ? field.set : field;
  if ((fieldSet as never) in (record as never)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (record as any)[fieldSet] = value;
  } else if (typeof fieldSet === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (fieldSet as any)(record, value);
  } else if (typeof fieldSet === "string") {
    const ss = `${fieldSet}`.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = record;
    const { length } = ss;
    for (let i = 0; i < length; i++) {
      const f = ss[i];
      if (i === length - 1) {
        obj[f] = value;
      } else {
        obj = obj[f] || (obj[f] = {});
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (record as any)[fieldSet] = value;
  }
  return true;
}
/** @private */
function _getIndex(sortedIndexMap: null | number[], index: number): number {
  if (!sortedIndexMap) {
    return index;
  }
  const mapIndex = sortedIndexMap[index];
  return mapIndex != null ? mapIndex : index;
}

export interface DataSourceParam<T> {
  get: (index: number) => T;
  length: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source?: any;
}

/**
 * grid data source
 *
 * @classdesc cheetahGrid.data.DataSource
 * @memberof cheetahGrid.data
 */
export class DataSource<T> extends EventTarget implements DataSourceAPI<T> {
  private _get: (index: number) => MaybePromiseOrCall<T, []>;
  private _length: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _source: any;
  protected _sortedIndexMap: null | number[] = null;
  static get EVENT_TYPE(): typeof EVENT_TYPE {
    return EVENT_TYPE;
  }
  static ofArray<T>(array: T[]): DataSource<T> {
    return new DataSource<T>({
      get: (index: number): T => array[index],
      length: array.length,
      source: array,
    });
  }
  constructor(obj?: DataSourceParam<T> | DataSource<T>) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._get = obj?.get.bind(obj) || (undefined as any);
    this._length = obj?.length || 0;
    this._source = obj?.source ?? obj;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get source(): any {
    return this._source;
  }
  get(index: number): MaybePromiseOrUndef<T> {
    return this.getOriginal(_getIndex(this._sortedIndexMap, index));
  }
  getField<F extends FieldDef<T>>(index: number, field: F): FieldData {
    return this.getOriginalField(_getIndex(this._sortedIndexMap, index), field);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasField(index: number, field: FieldDef<T>): boolean {
    return this.hasOriginalField(_getIndex(this._sortedIndexMap, index), field);
  }
  setField<F extends FieldDef<T>>(
    index: number,
    field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): MaybePromise<boolean> {
    return this.setOriginalField(
      _getIndex(this._sortedIndexMap, index),
      field,
      value
    );
  }
  sort(field: FieldDef<T>, order: "desc" | "asc"): MaybePromise<void> {
    const sortedIndexMap = new Array<number>(this._length);

    const orderFn = order !== "desc" ? ascOrderFn : descOrderFn;

    return sort
      .sortPromise(
        (index) =>
          sortedIndexMap[index] != null
            ? sortedIndexMap[index]
            : (sortedIndexMap[index] = index),
        (index, rel) => {
          sortedIndexMap[index] = rel;
        },
        this._length,
        orderFn,
        (index) => this.getOriginalField(index, field)
      )
      .then(() => {
        this._sortedIndexMap = sortedIndexMap;
        this.fireListeners(EVENT_TYPE.UPDATED_ORDER);
      });
  }
  get length(): number {
    return this._length;
  }
  set length(length: number) {
    if (this._length === length) {
      return;
    }

    const results = this.fireListeners(EVENT_TYPE.UPDATE_LENGTH, length);
    if (array.findIndex(results, (v) => !v) >= 0) {
      return;
    }
    this._length = length;
    this.fireListeners(EVENT_TYPE.UPDATED_LENGTH, this._length);
  }
  get dataSource(): DataSource<T> {
    return this;
  }
  dispose(): void {
    super.dispose();
  }
  protected getOriginal(index: number): MaybePromiseOrUndef<T> {
    return getValue(this._get(index), (val: PromiseCacheValue<T>) => {
      this.recordPromiseCallBackInternal(index, val);
    });
  }
  protected getOriginalField<F extends FieldDef<T>>(
    index: number,
    field: F
  ): FieldData {
    if (field == null) {
      return undefined;
    }
    const record = this.getOriginal(index);
    return getField(record, field, (val) => {
      this.fieldPromiseCallBackInternal(index, field, val);
    });
  }
  protected hasOriginalField(index: number, field: FieldDef<T>): boolean {
    if (field == null) {
      return false;
    }
    if (typeof field === "function") {
      return true;
    }
    const record = this.getOriginal(index);
    return Boolean(record && (field as never) in (record as never));
  }
  protected setOriginalField<F extends FieldDef<T>>(
    index: number,
    field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): MaybePromise<boolean> {
    if (field == null) {
      return false;
    }
    const record = this.getOriginal(index);
    if (isPromise(record)) {
      return record.then((r) => setField(r, field, value));
    }
    return setField(record, field, value);
  }
  protected fieldPromiseCallBackInternal<F extends FieldDef<T>>(
    _index: number,
    _field: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _value: PromiseCacheValue<any>
  ): void {
    //
  }
  protected recordPromiseCallBackInternal(
    _index: number,
    _record: PromiseCacheValue<T>
  ): void {
    //
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static EMPTY = new DataSource<any>({
    get(): void {
      /*noop */
    },
    length: 0,
  });
}
