import { MutableRefObject } from "react";
import type { ReactElement } from "react";
import { ListGrid } from "cheetah-grid";

import type {
  MouseCellEvent,
  MousePointerCellEvent,
  SelectedCellEvent,
  TouchCellEvent,
  KeydownEvent,
  InputCellEvent,
  PasteCellEvent,
  ChangedValueCellEvent,
  ScrollEvent,
  ChangedHeaderValueCellEvent,
  ModifyStatusEditableinputCellEvent,
} from "cheetah-grid/ts-types/events";
import { CellAddress, ThemeDefine } from "cheetah-grid/ts-types";
import { DataSource } from "cheetah-grid/data";
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
  onCellClick?: (e: MouseCellEvent) => void;
  onCellDoubleClick?: (e: MouseCellEvent) => void;
  onCellDoubleTap?: (e: TouchCellEvent) => void;
  onCellMouseDown?: (e: MouseCellEvent) => void;
  onCellMouseUp?: (e: MouseCellEvent) => void;
  onCellSelect?: (e: SelectedCellEvent) => void;
  onKeyDown?: (e: KeydownEvent) => void;
  onCellMouseMove?: (e: MouseCellEvent) => void;
  onCellMouseEnter?: (e: MousePointerCellEvent) => void;
  onCellMouseLeave?: (e: MousePointerCellEvent) => void;
  onCellMouseOver?: (e: MousePointerCellEvent) => void;
  onCellMouseOut?: (e: MousePointerCellEvent) => void;
  onCellInput?: (e: InputCellEvent) => void;
  onCellPaste?: (e: PasteCellEvent) => void;
  onCellContextMenu?: (e: MouseCellEvent) => void;
  onColumnResize?: (e: ColumnResizeEvent) => void;
  onScroll?: (e: ScrollEvent) => void;
  onCellEditableInput?: (e: CellAddress) => boolean | void;
  onModifyStatusEditableInput?: (e: ModifyStatusEditableinputCellEvent) => void;
  onValueChange?: (e: ChangedValueCellEvent<T>) => void;
  onHeaderValueChange?: (e: ChangedHeaderValueCellEvent) => void;
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
  theme?: ThemeDefine | string;
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
  dataSource: DataSource<T>;
};

export function isDataSourceProps<T>(value: {}): value is DataSourceProps<T> {
  return "dataSource" in value;
}

type DataProps<T> = {
  data: T[] | DataSource<T>;
};

export function isDataProps<T>(value: {}): value is DataProps<T> {
  return "data" in value;
}

type SourceProps<T> = DataProps<T> | StaticRecordProps<T> | DataSourceProps<T>;

export type CheetahGridProps<T> = CheetahGridStdProps<T> &
  CheetahGridEventProps<T> &
  SourceProps<T>;
