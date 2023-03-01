import type {
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
  SortHeaderActionOption,
  SortOption,
  SortState,
} from "../../ts-types";
import { BaseAction } from "./BaseAction";
import { bindCellClickAction } from "./actionBind";

export class SortHeaderAction<T> extends BaseAction<T> {
  private _sort: SortOption<T>;
  constructor(option: SortHeaderActionOption<T> = {}) {
    super(option);
    this._sort = option.sort ?? true;
  }
  get sort(): SortOption<T> {
    return this._sort;
  }
  set sort(sort: SortOption<T>) {
    this._sort = sort;
    this.onChangeDisabledInternal();
  }
  clone(): SortHeaderAction<T> {
    return new SortHeaderAction(this);
  }
  _executeSort(newState: SortState, grid: ListGridAPI<T>): void {
    if (typeof this._sort === "function") {
      this._sort({
        order: newState.order || "asc",
        col: newState.col,
        row: newState.row,
        grid,
      });
    } else if (
      typeof this._sort === "string" &&
      // v1.6.3 Backward compatibility
      (this._sort !== "true" || hasTrueField(grid))
    ) {
      const field = this._sort;
      grid.dataSource.sort(field, newState.order || "asc");
    } else {
      const fieldRow =
        Math.min(grid.recordRowCount - 1, newState.row) + grid.frozenRowCount;
      const field = grid.getField(newState.col, fieldRow);
      if (field == null) {
        return;
      }
      grid.dataSource.sort(field, newState.order || "asc");
    }
  }
  bindGridEvent(
    grid: ListGridAPI<T>,
    cellId: LayoutObjectId
  ): EventListenerId[] {
    function isTarget(col: number, row: number): boolean {
      return grid.getLayoutCellId(col, row) === cellId;
    }
    const action = (cell: CellAddress): void => {
      if (this.disabled) {
        return;
      }
      const state = grid.sortState as SortState;
      let newState: SortState;
      const range = grid.getCellRange(cell.col, cell.row);
      if (isTarget(state.col, cell.row)) {
        newState = {
          col: range.start.col,
          row: range.start.row,
          order: state.order === "asc" ? "desc" : "asc",
        };
      } else {
        newState = {
          col: range.start.col,
          row: range.start.row,
          order: "asc",
        };
      }
      grid.sortState = newState;
      this._executeSort(newState, grid);
      grid.invalidateGridRect(0, 0, grid.colCount - 1, grid.rowCount - 1);
    };

    return [
      ...bindCellClickAction(grid, cellId, {
        action,
        mouseOver: (_e) => {
          if (this.disabled) {
            return false;
          }
          return true;
        },
      }),
    ];
  }
}

function hasTrueField<T>(grid: ListGridAPI<T>) {
  if (grid.dataSource.length > 0) {
    const record = grid.dataSource.get(0);
    return record != null && "true" in (record as never);
  }
  return false;
}
