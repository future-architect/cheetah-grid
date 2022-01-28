import * as columns from "../../../columns";
import * as headerAction from "../../../header/action";
import * as headerType from "../../../header/type";
import type {
  CellDefine,
  ColumnData,
  HeaderBodyLayoutDefine,
  HeaderCellDefine,
  HeaderData,
  LayoutDefine,
  LayoutMapAPI,
  WidthData,
} from "../api";
import type { CellRange, LayoutObjectId } from "../../../ts-types";
import { EmptyDataCache } from "./utils";

interface HasSpans {
  colSpan?: number;
  rowSpan?: number;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
}

function normalizeLayout<T>(
  layout: LayoutDefine<T>
): HeaderBodyLayoutDefine<T> {
  if (Array.isArray(layout)) {
    return {
      header: layout,
      body: layout,
    };
  }
  return layout;
}

let seqId = 0;

class LayoutObjectGrid<T, D extends HasSpans> {
  objects: T[] = [];
  objectGrid: T[][] = [];
  objectMap: { [key in LayoutObjectId]: T } = {};
  columnCount = 0;
  columnWidths: WidthData[] = [];
  constructor(layout: D[][], transform: (d: D, id: LayoutObjectId) => T) {
    layout.forEach((rowLayout, row) => {
      let col = 0;
      rowLayout.forEach((cell) => {
        const id = seqId++;
        const obj = transform(cell, id);
        this.objects.push(obj);
        this.objectMap[id] = obj;
        col = this._findStartCell(col, row);
        const rowSpan = Number(cell.rowSpan ?? 1);
        const colSpan = Number(cell.colSpan ?? 1);
        const endRow = row + rowSpan;
        const endCol = col + colSpan;
        for (let rowIndex = row; rowIndex < endRow; rowIndex++) {
          const objectGridRow = this._getObjectGridRow(rowIndex);
          for (let colIndex = col; colIndex < endCol; colIndex++) {
            objectGridRow[colIndex] = obj;
          }
        }
        if (colSpan === 1) {
          this._setWidthDataIfAbsent(col, cell);
        }
        this._useColumnIndex(endCol - 1);
        col = endCol;
      });
    });
  }
  get rowCount(): number {
    return this.objectGrid.length;
  }
  private _findStartCell(col: number, row: number): number {
    const objectGridRow = this._getObjectGridRow(row);
    for (let index = col; index < objectGridRow.length; index++) {
      if (!objectGridRow[index]) {
        return index;
      }
    }
    return objectGridRow.length;
  }
  private _getObjectGridRow(row: number): T[] {
    return this.objectGrid[row] || (this.objectGrid[row] = []);
  }
  private _useColumnIndex(col: number): void {
    if (this.columnCount > col) {
      return;
    }
    this.columnCount = col + 1;
  }
  private _setWidthDataIfAbsent(col: number, cell: HasSpans): void {
    if (!this.columnWidths[col]) {
      if (
        cell.width != null ||
        cell.maxWidth != null ||
        cell.minWidth != null
      ) {
        this.columnWidths[col] = {
          width: cell.width,
          maxWidth: cell.maxWidth,
          minWidth: cell.minWidth,
        };
      }
    }
  }
}

export class MultiLayoutMap<T> implements LayoutMapAPI<T> {
  private _header: LayoutObjectGrid<HeaderData<T>, HeaderCellDefine<T>>;
  private _body: LayoutObjectGrid<ColumnData<T>, CellDefine<T>>;
  private _columnWidths: WidthData[] = [];
  private _columnCount: number;
  private _emptyDataCache = new EmptyDataCache();
  constructor(layout: LayoutDefine<T>) {
    const hbLayouut = normalizeLayout(layout);
    const header = (this._header = new LayoutObjectGrid(
      hbLayouut.header,
      (hd: HeaderCellDefine<T>, id: LayoutObjectId): HeaderData<T> => {
        return {
          id,
          caption: hd.caption,
          field: hd.headerField || (hd as CellDefine<T>).field,
          headerIcon: hd.headerIcon,
          style: hd.headerStyle,
          headerType: headerType.ofCell(hd),
          action: headerAction.ofCell(hd),
          define: hd,
        };
      }
    ));
    const body = (this._body = new LayoutObjectGrid(
      hbLayouut.body,
      (colDef: CellDefine<T>, id: LayoutObjectId): ColumnData<T> => {
        return {
          id,
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
        };
      }
    ));
    const columnCount = (this._columnCount = Math.max(
      header.columnCount,
      body.columnCount
    ));
    for (let col = 0; col < columnCount; col++) {
      const widthDef = header.columnWidths[col] || body.columnWidths[col] || {};
      this._columnWidths[col] = widthDef;
    }
  }
  get columnWidths(): WidthData[] {
    return this._columnWidths;
  }
  get headerRowCount(): number {
    return this._header.rowCount;
  }
  get bodyRowCount(): number {
    return this._body.rowCount;
  }
  get colCount(): number {
    return this._columnCount;
  }
  get headerObjects(): HeaderData<T>[] {
    return this._header.objects;
  }
  get columnObjects(): ColumnData<T>[] {
    return this._body.objects;
  }
  getCellId(col: number, row: number): LayoutObjectId {
    if (this.headerRowCount <= row) {
      const bodyRow = row - this.headerRowCount;
      const bodyLayoutRow = bodyRow % this.bodyRowCount;
      return this._body.objectGrid[bodyLayoutRow]?.[col]?.id;
    }
    //in header
    return this._header.objectGrid[row]?.[col]?.id;
  }
  getHeader(col: number, row: number): HeaderData<T> {
    const id = this.getCellId(col, row);
    return (
      this._header.objectMap[id as number] ||
      this._emptyDataCache.getHeader(col, row)
    );
  }
  getBody(col: number, row: number): ColumnData<T> {
    const id = this.getCellId(col, row);
    return (
      this._body.objectMap[id as number] ||
      this._emptyDataCache.getBody(col, row)
    );
  }
  getBodyLayoutRangeById(id: LayoutObjectId): CellRange {
    for (let row = 0; row < this.bodyRowCount; row++) {
      const objectGridRow = this._body.objectGrid[row];
      if (!objectGridRow) {
        continue;
      }
      for (let col = 0; col < this.colCount; col++) {
        if (id === objectGridRow[col]?.id) {
          return this._getCellRange(this._body, col, row, 0);
        }
      }
    }
    throw new Error(`can not found body layout @id=${id as number}`);
  }
  getCellRange(col: number, row: number): CellRange {
    if (this.headerRowCount <= row) {
      const recordIndex = this.getRecordIndexByRow(row);
      const startRow = this.getRecordStartRowByRecordIndex(recordIndex);
      const bodyRow = row - this.headerRowCount;
      const bodyLayoutRow = bodyRow % this.bodyRowCount;
      return this._getCellRange(this._body, col, bodyLayoutRow, startRow);
    }
    //in header
    return this._getCellRange(this._header, col, row, 0);
  }
  getRecordIndexByRow(row: number): number {
    if (row < this.headerRowCount) {
      return -1;
    } else {
      const bodyRow = row - this.headerRowCount;
      return Math.floor(bodyRow / this.bodyRowCount);
    }
  }
  getRecordStartRowByRecordIndex(index: number): number {
    return this.headerRowCount + index * this.bodyRowCount;
  }
  private _getCellRange(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layout: LayoutObjectGrid<HeaderData<T> | ColumnData<T>, any>,
    col: number,
    layoutRow: number,
    offsetRow: number
  ): CellRange {
    const result: CellRange = {
      start: { col, row: layoutRow + offsetRow },
      end: { col, row: layoutRow + offsetRow },
    };
    const { objectGrid } = layout;
    const id = objectGrid[layoutRow]?.[col]?.id;
    if (id == null) {
      return result;
    }
    for (let c = col - 1; c >= 0; c--) {
      if (id !== objectGrid[layoutRow]?.[c]?.id) {
        break;
      }
      result.start.col = c;
    }
    for (let c = col + 1; c < layout.columnCount; c++) {
      if (id !== objectGrid[layoutRow]?.[c]?.id) {
        break;
      }
      result.end.col = c;
    }
    for (let r = layoutRow - 1; r >= 0; r--) {
      if (id !== objectGrid[r]?.[col]?.id) {
        break;
      }
      result.start.row = r + offsetRow;
    }
    for (let r = layoutRow + 1; r < layout.rowCount; r++) {
      if (id !== objectGrid[r]?.[col]?.id) {
        break;
      }
      result.end.row = r + offsetRow;
    }
    return result;
  }
}
