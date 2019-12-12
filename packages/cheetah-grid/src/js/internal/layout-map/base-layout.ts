import { CellRange, LayoutObjectId } from "../../ts-types";
import { ColumnData, HeaderData, LayoutMapAPI, WidthData } from "./api";

export abstract class BaseLayoutMap<T> implements LayoutMapAPI<T> {
  abstract readonly columnWidths: WidthData[];
  abstract readonly headerRowCount: number;
  abstract readonly bodyRowCount: number;
  abstract readonly colCount: number;
  abstract readonly headerObjects: HeaderData<T>[];
  abstract readonly columnObjects: ColumnData<T>[];
  abstract getHeader(col: number, row: number): HeaderData<T>;
  abstract getBody(col: number, row: number): ColumnData<T>;
  abstract getCellId(col: number, row: number): LayoutObjectId;
  abstract getCellRange(col: number, row: number): CellRange;
  abstract getBodyLayoutRangeById(id: LayoutObjectId): CellRange;
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
}
