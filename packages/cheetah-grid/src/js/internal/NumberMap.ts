const indexFirst = (arr: number[], elm: number): number => {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const i = Math.floor((low + high) / 2);
    if (arr[i] === elm) {
      return i;
    } else if (arr[i] > elm) {
      high = i - 1;
    } else {
      low = i + 1;
    }
  }
  return high < 0 ? 0 : high;
};

export class NumberMap<T> {
  private _keys: number[] = [];
  private _vals: { [key: number]: T } = {};
  private _sorted = false;
  put(key: number, value: T): void {
    if (!(key in this._vals)) {
      this._keys.push(key);
      this._sorted = false;
    }
    this._vals[key] = value;
  }
  get(key: number): T | undefined {
    return this._vals[key];
  }
  has(key: number): boolean {
    return this._vals[key] != null;
  }
  each(keyFrom: number, keyTo: number, fn: (t: T, k: number) => void): void {
    const { _keys: keys } = this;
    const { length } = keys;
    if (!this._sorted) {
      keys.sort((a, b) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
      this._sorted = true;
    }

    for (let i = indexFirst(keys, keyFrom); i < length; i++) {
      const key = keys[i];
      if (keyFrom <= key && key <= keyTo) {
        fn(this.get(key) as T, key);
      } else if (keyTo < key) {
        return;
      }
    }
  }
}
