export class LRUCache<T> {
  private _list: string[];
  private _map: { [key: string]: T };
  private _cacheSize: number;
  constructor(cacheSize: number) {
    this._list = [];
    this._map = Object.create(null) as { [key: string]: T };
    this._cacheSize = cacheSize || 50;
  }
  private _has(key: string): boolean {
    return key in this._map;
  }
  get(key: string): T {
    const val = this._map[key];
    if (this._has(key)) {
      const list = this._list;
      const idx = list.indexOf(key);
      list.splice(idx, 1);
      list.push(key);
    }
    return val;
  }
  put(key: string, value: T): void {
    const list = this._list;
    const map = this._map;
    if (this._has(key)) {
      const idx = list.indexOf(key);
      list.splice(idx, 1);
    }
    map[key] = value;
    list.push(key);
    if (list.length > this._cacheSize) {
      const remKey = list.shift() || "";
      delete map[remKey];
    }
  }
}
