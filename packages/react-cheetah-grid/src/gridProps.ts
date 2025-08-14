import { MutableRefObject } from "react";
import type { ReactElement } from "react";
import { data, ListGrid, TYPES } from "cheetah-grid";
import { StandardProps } from "./columnProps";
import type { BodyLayoutProps, HeaderLayoutProps, LineProps } from "./Layout";
export type ColumnResizeEvent = {
  col: number;
};

export type Style = {
  width?: string | number;
  height?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number;
};

type CheetahGridEventProps<T> = {
  onCellClick?: (e: TYPES.MouseCellEvent) => void;
  onCellDoubleClick?: (e: TYPES.MouseCellEvent) => void;
  onCellDoubleTap?: (e: TYPES.TouchCellEvent) => void;
  onCellMouseDown?: (e: TYPES.MouseCellEvent) => void;
  onCellMouseUp?: (e: TYPES.MouseCellEvent) => void;
  onCellSelect?: (e: TYPES.SelectedCellEvent) => void;
  onKeyDown?: (e: TYPES.KeydownEvent) => void;
  onCellMouseMove?: (e: TYPES.MouseCellEvent) => void;
  onCellMouseEnter?: (e: TYPES.MousePointerCellEvent) => void;
  onCellMouseLeave?: (e: TYPES.MousePointerCellEvent) => void;
  onCellMouseOver?: (e: TYPES.MousePointerCellEvent) => void;
  onCellMouseOut?: (e: TYPES.MousePointerCellEvent) => void;
  onCellInput?: (e: TYPES.InputCellEvent) => void;
  onCellPaste?: (e: TYPES.PasteCellEvent) => void;
  onCellContextMenu?: (e: TYPES.MouseCellEvent) => void;
  onColumnResize?: (e: ColumnResizeEvent) => void;
  onScroll?: (e: TYPES.ScrollEvent) => void;
  onCellEditableInput?: (e: TYPES.CellAddress) => boolean | void;
  onModifyStatusEditableInput?: (
    e: TYPES.ModifyStatusEditableinputCellEvent
  ) => void;
  onValueChange?: (e: TYPES.ChangedValueCellEvent<T>) => void;
  onHeaderValueChange?: (e: TYPES.ChangedHeaderValueCellEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
};

export type CheetahGridChildren<T> =
  | ReactElement<HeaderLayoutProps<T> | BodyLayoutProps<T>>[]
  | ReactElement<StandardProps<T>>
  | ReactElement<StandardProps<T>>[]
  | ReactElement<LineProps<T>>[];

type CheetahGridStdProps<T> = {
  style: Style;
  children: CheetahGridChildren<T>;
  frozenColCount?: number;
  defaultRowHeight?: number;
  headerRowHeight?: number;
  instance?: MutableRefObject<ListGrid<T> | undefined>;
  theme?: TYPES.ThemeDefine | string;
};

type StaticRecordProps<T> = {
  records: T[];
};

export function isStaticRecordProps<
  T
>(value: {}): value is StaticRecordProps<T> {
  return "records" in value;
}

type DataSourceProps<T> = {
  dataSource: data.DataSource<T>;
};

export function isDataSourceProps<T>(value: {}): value is DataSourceProps<T> {
  return "dataSource" in value;
}

type DataProps<T> = {
  data: T[] | data.DataSource<T>;
};

export function isDataProps<T>(value: {}): value is DataProps<T> {
  return "data" in value;
}

type SourceProps<T> = DataProps<T> | StaticRecordProps<T> | DataSourceProps<T>;

export type CheetahGridProps<T> = CheetahGridStdProps<T> &
  CheetahGridEventProps<T> &
  SourceProps<T>;
