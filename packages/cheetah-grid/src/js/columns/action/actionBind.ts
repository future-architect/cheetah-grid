import type {
  CellAddress,
  EventListenerId,
  LayoutObjectId,
  ListGridAPI,
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
  }: {
    action: (cell: CellAddress) => void;
    mouseOver: (cell: CellAddress) => boolean;
    mouseOut: (cell: CellAddress) => void;
  }
): EventListenerId[] {
  function isTarget(col: number, row: number): boolean {
    return grid.getLayoutCellId(col, row) === cellId;
  }
  return [
    // click
    grid.listen(DG_EVENT_TYPE.CLICK_CELL, (e) => {
      if (!isTarget(e.col, e.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(e.row))) {
        return;
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
    }),
    grid.listen(DG_EVENT_TYPE.MOUSEOUT_CELL, (e) => {
      if (!isTarget(e.col, e.row)) {
        return;
      }
      if (mouseOut) {
        mouseOut({
          col: e.col,
          row: e.row,
        });
      }
      grid.getElement().style.cursor = "";
    }),
  ];
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
