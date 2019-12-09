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

export type HeaderData<T> = {
  id: number;
  caption?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field?: any;
  style?: HeaderStyleOption | HeaderBaseStyle | null;
  headerType: headerType.BaseHeader<T>;
  action?: headerAction.BaseAction<T>;
  range: CellRange;
  define: HeaderDefine<T>;
};

export type ColumnData<T> = {
  field?: FieldDef<T>;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  icon?: ColumnIconOption<T> | ColumnIconOption<T>[];
  message?: Message | ((record: T) => Message) | keyof T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnType: BaseColumn<T, any>;
  action?: BaseAction<T>;
  style: ColumnStyleOption | null | undefined;
  define: ColumnDefine<T>;
};

export interface LayoutMapAPI<T> {
  readonly columns: ColumnData<T>[];
  readonly rowCount: number;
  readonly headerObjects: HeaderData<T>[];
  getCell(col: number, row: number): HeaderData<T>;
  getCellId(col: number, row: number): number;
  getCellRange(col: number, row: number): CellRange;
}
