import * as headerAction from "../../header/action";
import * as headerType from "../../header/type";
import {
  CellRange,
  ColumnActionOption,
  ColumnIconOption,
  ColumnStyleOption,
  ColumnTypeOption,
  FieldDef,
  HeaderActionOption,
  HeaderStyleOption,
  HeaderTypeOption,
  LayoutObjectId,
  ListGridAPI,
  Message
} from "../../ts-types";
import { BaseAction } from "../../columns/action";
import { BaseColumn } from "../../columns/type/BaseColumn";
import { BaseStyle as HeaderBaseStyle } from "../../header/style";

export type OldSortOption<T> =
  | boolean
  | ((order: "asc" | "desc", col: number, grid: ListGridAPI<T>) => void);

export interface BaseHeaderDefine<T> {
  caption?: string;
  headerField?: string;
  headerStyle?: HeaderStyleOption | HeaderBaseStyle | null;
  headerType?: HeaderTypeOption | headerType.BaseHeader<T> | null;
  headerAction?: HeaderActionOption | headerAction.BaseAction<T> | null;
  sort?: OldSortOption<T>;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HeaderDefine<T> extends BaseHeaderDefine<T> {}
export interface ColumnDefine<T> extends BaseHeaderDefine<T> {
  field?: FieldDef<T>;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  icon?: ColumnIconOption<T> | ColumnIconOption<T>[];
  message?: Message | ((record: T) => Message) | keyof T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnType?: ColumnTypeOption | BaseColumn<T, any> | null;
  action?: ColumnActionOption | BaseAction<T> | null;
  style?: ColumnStyleOption | null;
}

export interface HeaderData<T> {
  id: LayoutObjectId;
  caption?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field?: any;
  style?: HeaderStyleOption | HeaderBaseStyle | null;
  headerType: headerType.BaseHeader<T>;
  action?: headerAction.BaseAction<T>;
  define: HeaderDefine<T>;
}

export interface WidthData {
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
}
export interface ColumnData<T> extends WidthData {
  id: LayoutObjectId;
  field?: FieldDef<T>;
  icon?: ColumnIconOption<T> | ColumnIconOption<T>[];
  message?: Message | ((record: T) => Message) | keyof T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnType: BaseColumn<T, any>;
  action?: BaseAction<T>;
  style: ColumnStyleOption | null | undefined;
  define: ColumnDefine<T>;
}

// Simple header

export interface GroupHeaderDefine<T> extends HeaderDefine<T> {
  columns: HeadersDefine<T>;
}
export type HeadersDefine<T> = (GroupHeaderDefine<T> | ColumnDefine<T>)[];

// Advanced layout

export interface HeaderCellDefine<T> extends HeaderDefine<T> {
  colSpan?: number;
  rowSpan?: number;
}

export interface CellDefine<T> extends ColumnDefine<T> {
  colSpan?: number;
  rowSpan?: number;
}

export type HeaderBodyLayoutDefine<T> = {
  header: HeaderCellDefine<T>[][];
  body: CellDefine<T>[][];
};

export type ArrayLayoutDefine<T> = CellDefine<T>[][];
export type LayoutDefine<T> = HeaderBodyLayoutDefine<T> | ArrayLayoutDefine<T>;

interface LayoutMapAPI<T> {
  readonly headerRowCount: number;
  readonly bodyRowCount: number;
  readonly colCount: number;

  readonly columnWidths: WidthData[];
  readonly headerObjects: HeaderData<T>[];
  readonly columnObjects: ColumnData<T>[];

  getHeader(col: number, row: number): HeaderData<T>;
  getBody(col: number, row: number): ColumnData<T>;
  getCellId(col: number, row: number): LayoutObjectId;
  getCellRange(col: number, row: number): CellRange;
  getBodyLayoutRangeById(id: LayoutObjectId): CellRange;
  getRecordIndexByRow(row: number): number;
  getRecordStartRowByRecordIndex(index: number): number;
}

export { LayoutMapAPI };
