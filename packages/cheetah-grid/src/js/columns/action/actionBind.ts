import type {
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
  MouseCellEvent,
  MousePointerCellEvent,
} from "../../ts-types";
import { event, isPromise } from "../../internal/utils";
import { DG_EVENT_TYPE } from "../../core/DG_EVENT_TYPE";

const KEY_ENTER = 13;
const KEY_SPACE = 32;
export function bindCellClickAction<T>(
  grid: ListGridAPI<T>,
  cellId: LayoutObjectId,
  {
    action,
    mouseOver,
    mouseOut,
    area,
  }: {
    action: (cell: CellAddress) => void;
    mouseOver?: (cell: CellAddress) => boolean;
    mouseOut?: (cell: CellAddress) => void;
    area?: (event: MouseCellEvent | MousePointerCellEvent) => boolean;
  }
): EventListenerId[] {
  function isTarget(col: number, row: number): boolean {
    return grid.getLayoutCellId(col, row) === cellId;
  }
  let mouseIsInCell: CellAddress | null = null;
  let mouseOvered: CellAddress | null = null;

  function processMouseOver(e: MousePointerCellEvent) {
    mouseOvered = e;
    if (mouseOver) {
      if (
        !mouseOver({
          col: e.col,
          row: e.row,
        })
      ) {
        return;
      }
    }
    grid.getElement().style.cursor = "pointer";
  }
  function processMouseOut(e: MousePointerCellEvent) {
    if (mouseOut) {
      mouseOut({
        col: e.col,
        row: e.row,
      });
    }
    mouseOvered = null;
    grid.getElement().style.cursor = "";
  }

  const disposables = [
    // click
    grid.listen(DG_EVENT_TYPE.CLICK_CELL, (e) => {
      if (!isTarget(e.col, e.row)) {
        return;
      }
      const sel = grid.selection.select;
      if (sel.col !== e.col || sel.row !== e.row) {
        // If the user drags from another element in the grid and then clicks,
        // this can lead to unexpected behavior because there is no selection event.
        // A guard avoids this issue.
        return;
      }
      if (isPromise(grid.getRowRecord(e.row))) {
        return;
      }
      if (area) {
        if (!area(e)) return;
      }
      action({
        col: e.col,
        row: e.row,
      });
    }),
    // mouse move
    grid.listen(DG_EVENT_TYPE.MOUSEOVER_CELL, (e) => {
      if (!isTarget(e.col, e.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(e.row))) {
        return;
      }
      mouseIsInCell = e;
      if (area) {
        if (!area(e)) return;
      }
      processMouseOver(e);
    }),
    grid.listen(DG_EVENT_TYPE.MOUSEOUT_CELL, (e) => {
      if (
        !mouseIsInCell ||
        mouseIsInCell.col !== e.col ||
        mouseIsInCell.row !== e.row
      ) {
        return;
      }
      if (!mouseOvered) {
        processMouseOut(e);
      }
    }),
  ];
  if (area) {
    disposables.push(
      grid.listen(DG_EVENT_TYPE.MOUSEMOVE_CELL, (e) => {
        if (
          !mouseIsInCell ||
          mouseIsInCell.col !== e.col ||
          mouseIsInCell.row !== e.row
        ) {
          return;
        }
        const isInArea = area(e);
        if (!mouseOvered) {
          if (!isInArea) return;
          // mouse over
          processMouseOver(e);
        } else {
          if (isInArea) return;
          // mouse out
          processMouseOut(e);
        }
      })
    );
  }

  return disposables;
}
export function bindCellKeyAction<T>(
  grid: ListGridAPI<T>,
  cellId: LayoutObjectId,
  {
    action,
    acceptKeys = [],
  }: {
    action: (cell: CellAddress) => void;
    acceptKeys?: number[];
  }
): EventListenerId[] {
  function isTarget(col: number, row: number): boolean {
    return grid.getLayoutCellId(col, row) === cellId;
  }
  acceptKeys = [...acceptKeys, KEY_ENTER, KEY_SPACE];
  return [
    // enter key down
    grid.listen(DG_EVENT_TYPE.KEYDOWN, (e) => {
      if (acceptKeys.indexOf(e.keyCode) === -1) {
        return;
      }
      if (grid.keyboardOptions?.moveCellOnEnter && e.keyCode === KEY_ENTER) {
        // When moving with the enter key, no action is taken with the enter key.
        return;
      }
      const sel = grid.selection.select;
      if (!isTarget(sel.col, sel.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(sel.row))) {
        return;
      }
      action({
        col: sel.col,
        row: sel.row,
      });
      event.cancel(e.event);
    }),
  ];
}
