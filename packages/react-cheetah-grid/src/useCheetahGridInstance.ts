import { useState, useRef, useEffect } from "react";
import type { MutableRefObject } from "react";
import { ListGrid } from "cheetah-grid";
import { Selection } from "cheetah-grid/ts-types/grid-engine";

export class CheetahGridInstance<T> {
  private _cg: ListGrid<T>;
  constructor(cg: ListGrid<T>) {
    this._cg = cg;
  }

  resetSort() {
    if (this._cg) {
      this._cg.sortState = null;
      this._cg.invalidate();
    }
  }

  invalidate() {
    if (this._cg) {
      this._cg.invalidate();
    }
  }

  get selection(): Selection {
    return this._cg.selection;
  }
}

export function useCheetahGridInstance<T>(): [
  CheetahGridInstance<T> | null,
  MutableRefObject<ListGrid<T> | undefined>
] {
  const ref = useRef<ListGrid<T>>();
  const [cg, setCg] = useState<CheetahGridInstance<T> | null>(null);
  useEffect(
    function initCgInstance() {
      if (ref.current) {
        setCg(new CheetahGridInstance(ref.current));
      }
    },
    [ref.current]
  );
  return [cg, ref];
}
