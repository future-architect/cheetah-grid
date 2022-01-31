import * as columns from "../../../columns";
import * as headerAction from "../../../header/action";
import * as headerType from "../../../header/type";
import type { CellRange, LayoutObjectId } from "../../../ts-types";
import type {
  ColumnData,
  ColumnDefine,
  GroupHeaderDefine,
  HeaderData,
  HeadersDefine,
  LayoutMapAPI,
} from "../api";
import { EmptyDataCache } from "./utils";

let seqId = 0;
export class SimpleHeaderLayoutMap<T> implements LayoutMapAPI<T> {
  private _headerObjects: HeaderData<T>[];
  private _headerObjectMap: { [key in LayoutObjectId]: HeaderData<T> };
  private _headerCellIds: number[][];
  private _columns: ColumnData<T>[];
  readonly bodyRowCount: number = 1;
  private _emptyDataCache = new EmptyDataCache();
  constructor(header: HeadersDefine<T>) {
    this._columns = [];
    this._headerCellIds = [];

    this._headerObjects = this._addHeaders(0, header, []);
    this._headerObjectMap = this._headerObjects.reduce((o, e) => {
      o[e.id as number] = e;
      return o;
    }, {} as { [key in LayoutObjectId]: HeaderData<T> });
  }
  get columnWidths(): ColumnData<T>[] {
    return this._columns;
  }
  get headerRowCount(): number {
    return this._headerCellIds.length;
  }
  get colCount(): number {
    return this._columns.length;
  }
  get headerObjects(): HeaderData<T>[] {
    return this._headerObjects;
  }
  get columnObjects(): ColumnData<T>[] {
    return this._columns;
  }
  getCellId(col: number, row: number): LayoutObjectId {
    if (this.headerRowCount <= row) {
      return this._columns[col].id;
    }
    //in header
    return this._headerCellIds[row][col];
  }
  getHeader(col: number, row: number): HeaderData<T> {
    const id = this.getCellId(col, row);
    return (
      this._headerObjectMap[id as number] ||
      this._emptyDataCache.getHeader(col, row)
    );
  }
  getBody(col: number, _row: number): ColumnData<T> {
    return this._columns[col] || this._emptyDataCache.getBody(col, 0);
  }
  getBodyLayoutRangeById(id: LayoutObjectId): CellRange {
    for (let col = 0; col < this.colCount; col++) {
      if (id === this._columns[col].id) {
        return {
          start: { col, row: 0 },
          end: { col, row: 0 },
        };
      }
    }
    throw new Error(`can not found body layout @id=${id as number}`);
  }
  getCellRange(col: number, row: number): CellRange {
    const result: CellRange = { start: { col, row }, end: { col, row } };
    if (this.headerRowCount <= row) {
      return result;
    }
    //in header
    const id = this.getCellId(col, row);
    for (let c = col - 1; c >= 0; c--) {
      if (id !== this.getCellId(c, row)) {
        break;
      }
      result.start.col = c;
    }
    for (let c = col + 1; c < this.colCount; c++) {
      if (id !== this.getCellId(c, row)) {
        break;
      }
      result.end.col = c;
    }
    for (let r = row - 1; r >= 0; r--) {
      if (id !== this.getCellId(col, r)) {
        break;
      }
      result.start.row = r;
    }
    for (let r = row + 1; r < this.headerRowCount; r++) {
      if (id !== this.getCellId(col, r)) {
        break;
      }
      result.end.row = r;
    }
    return result;
  }
  getRecordIndexByRow(row: number): number {
    if (row < this.headerRowCount) {
      return -1;
    } else {
      return row - this.headerRowCount;
    }
  }
  getRecordStartRowByRecordIndex(index: number): number {
    return this.headerRowCount + index;
  }
  private _addHeaders(
    row: number,
    header: HeadersDefine<T>,
    roots: number[]
  ): HeaderData<T>[] {
    const results: HeaderData<T>[] = [];
    const rowCells = this._headerCellIds[row] || this._newRow(row);
    header.forEach((hd) => {
      const col = this._columns.length;
      const id = seqId++;
      const cell: HeaderData<T> = {
        id,
        caption: hd.caption,
        field: hd.headerField || (hd as ColumnDefine<T>).field,
        headerIcon: hd.headerIcon,
        style: hd.headerStyle,
        headerType: headerType.ofCell(hd),
        action: headerAction.ofCell(hd),
        define: hd,
      };
      results[id] = cell;
      rowCells[col] = id;
      for (let r = row - 1; r >= 0; r--) {
        this._headerCellIds[r][col] = roots[r];
      }
      if ((hd as GroupHeaderDefine<T>).columns) {
        this._addHeaders(row + 1, (hd as GroupHeaderDefine<T>).columns, [
          ...roots,
          id,
        ]).forEach((c) => results.push(c));
      } else {
        const colDef = hd as ColumnDefine<T>;
        this._columns.push({
          id: seqId++,
          field: colDef.field,
          width: colDef.width,
          minWidth: colDef.minWidth,
          maxWidth: colDef.maxWidth,
          icon: colDef.icon,
          message: colDef.message,
          columnType: columns.type.of(colDef.columnType),
          action: columns.action.of(colDef.action),
          style: colDef.style,
          define: colDef,
        });
        for (let r = row + 1; r < this._headerCellIds.length; r++) {
          this._headerCellIds[r][col] = id;
        }
      }
    });
    return results;
  }
  private _newRow(row: number): number[] {
    const newRow: number[] = (this._headerCellIds[row] = []);
    if (!this._columns.length) {
      return newRow;
    }
    const prev = this._headerCellIds[row - 1];
    for (let col = 0; col < prev.length; col++) {
      newRow[col] = prev[col];
    }
    return newRow;
  }
}
