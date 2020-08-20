import * as columns from "../../../columns";
import * as headerType from "../../../header/type";
import type { ColumnData, HeaderData } from "../api";

let seqId = -1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newEmptyHeaderData(): HeaderData<any> {
  return {
    id: seqId--,
    define: {},
    headerType: headerType.of(null), // default
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newEmptyColumnData(): ColumnData<any> {
  return {
    id: seqId--,
    define: {},
    columnType: columns.type.of(null), // default
    style: null,
  };
}

export class EmptyDataCache<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private headers: HeaderData<T>[][] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private columns: ColumnData<T>[][] = [];
  getHeader(col: number, row: number): HeaderData<T> {
    const rows = this.headers[row] || (this.headers[row] = []);
    return rows[col] || (rows[col] = newEmptyHeaderData());
  }
  getBody(col: number, row: number): ColumnData<T> {
    const rows = this.columns[row] || (this.columns[row] = []);
    return rows[col] || (rows[col] = newEmptyColumnData());
  }
}
