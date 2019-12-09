import * as columns from "../../columns";
import * as headerAction from "../../header/action";
import * as headerType from "../../header/type";
import {
  CellRange,
  HeaderActionOption,
  HeaderStyleOption,
  HeaderTypeOption
} from "../../ts-types";
import {
  ColumnData,
  ColumnDefine,
  HeaderData,
  HeaderDefine,
  LayoutMapAPI,
  OldSortOption
} from "./api";
import { BaseStyle as HeaderBaseStyle } from "../../header/style";

export interface GroupHeaderDefine<T> extends HeaderDefine<T> {
  columns: HeadersDefine<T>;
}
export type HeadersDefine<T> = (GroupHeaderDefine<T> | ColumnDefine<T>)[];

type HeaderWorkData<T> = {
  id: number;
  caption?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field?: any;
  style?: HeaderStyleOption | HeaderBaseStyle | null;
  headerType?: HeaderTypeOption | headerType.BaseHeader<T> | null;
  action?: HeaderActionOption | headerAction.BaseAction<T> | null;
  sort?: OldSortOption<T>;
  define: HeaderDefine<T>;
};

let headerId = 0;
export class SimpleHeaderMap<T> implements LayoutMapAPI<T> {
  private _headerObjects: HeaderData<T>[];
  private _headerCellIds: number[][];
  private _columns: ColumnData<T>[];
  constructor(header: HeadersDefine<T>) {
    this._columns = [];
    this._headerCellIds = [];

    const allHeaders = this._addHeaders(0, header, []);
    this._headerObjects = this._setupHeaderControllers(allHeaders);
  }
  get columns(): ColumnData<T>[] {
    return this._columns;
  }
  get rowCount(): number {
    return this._headerCellIds.length;
  }
  get headerObjects(): HeaderData<T>[] {
    return this._headerObjects;
  }
  getCellId(col: number, row: number): number {
    return this._headerCellIds[row][col];
  }
  getCell(col: number, row: number): HeaderData<T> {
    const id = this.getCellId(col, row);
    return this._headerObjects[id];
  }
  getHeaderCellRangeById(id: number): CellRange {
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columns.length; c++) {
        if (id === this.getCellId(c, r)) {
          return this.getCellRange(c, r);
        }
      }
    }
    throw new Error(`can not found header @id=${id}`);
  }
  getCellRange(col: number, row: number): CellRange {
    if (this.rowCount <= row) {
      return {
        start: { col, row },
        end: { col, row },
        inCell(col, row): boolean {
          return (
            this.start.col <= col &&
            col <= this.end.col &&
            this.start.row <= row &&
            row <= this.end.row
          );
        }
      };
    }
    //in header
    const result: CellRange = {
      start: { col, row },
      end: { col, row },
      inCell(col, row) {
        return (
          this.start.col <= col &&
          col <= this.end.col &&
          this.start.row <= row &&
          row <= this.end.row
        );
      }
    };
    const id = this.getCellId(col, row);
    for (let c = col - 1; c >= 0; c--) {
      if (id !== this.getCellId(c, row)) {
        break;
      }
      result.start.col = c;
    }
    for (let c = col + 1; c < this.columns.length; c++) {
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
    for (let r = row + 1; r < this.rowCount; r++) {
      if (id !== this.getCellId(col, r)) {
        break;
      }
      result.end.row = r;
    }
    return result;
  }
  _addHeaders(
    row: number,
    header: HeadersDefine<T>,
    roots: number[]
  ): HeaderWorkData<T>[] {
    const results: HeaderWorkData<T>[] = [];
    const rowCells = this._headerCellIds[row] || this._newRow(row);
    header.forEach(hd => {
      const col = this._columns.length;
      const id = headerId++;
      const cell: HeaderWorkData<T> = {
        id,
        caption: hd.caption,
        field: hd.headerField || (hd as ColumnDefine<T>).field,
        style: hd.headerStyle,
        headerType: hd.headerType,
        action: hd.headerAction,
        sort: hd.sort,
        define: hd
      };
      results[id] = cell;
      rowCells[col] = id;
      for (let r = row - 1; r >= 0; r--) {
        this._headerCellIds[r][col] = roots[r];
      }
      if ((hd as GroupHeaderDefine<T>).columns) {
        this._addHeaders(row + 1, (hd as GroupHeaderDefine<T>).columns, [
          ...roots,
          id
        ]).forEach(c => (results[c.id] = c));
      } else {
        const colDef = hd as ColumnDefine<T>;
        this._columns.push({
          field: colDef.field,
          width: colDef.width,
          minWidth: colDef.minWidth,
          maxWidth: colDef.maxWidth,
          icon: colDef.icon,
          message: colDef.message,
          columnType: columns.type.of(colDef.columnType),
          action: columns.action.of(colDef.action),
          style: colDef.style,
          define: colDef
        });
        for (let r = row + 1; r < this._headerCellIds.length; r++) {
          this._headerCellIds[r][col] = id;
        }
      }
    });
    return results;
  }
  _setupHeaderControllers(allHeaders: HeaderWorkData<T>[]): HeaderData<T>[] {
    return allHeaders.map(cell => {
      return {
        id: cell.id,
        caption: cell.caption,
        field: cell.field,
        style: cell.style,
        headerType: headerType.ofCell(cell),
        action: headerAction.ofCell(cell),
        range: this.getHeaderCellRangeById(cell.id),
        define: cell.define
      };
    });
  }
  _newRow(row: number): number[] {
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
