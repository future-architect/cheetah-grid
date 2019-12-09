import { CellAddress, EventListenerId, ListGridAPI } from "../../ts-types";
import { event, isPromise } from "../../internal/utils";
import { EVENT_TYPE } from "../../core/EVENT_TYPE";

export type ActionBindUtil = {
  isTarget(col: number, row: number): boolean;
};

const KEY_ENTER = 13;
export function bindCellClickAction<T>(
  grid: ListGridAPI<T>,
  _col: number,
  util: ActionBindUtil,
  {
    action,
    mouseOver,
    mouseOut
  }: {
    action: (cell: CellAddress) => void;
    mouseOver: (cell: CellAddress) => boolean;
    mouseOut: (cell: CellAddress) => void;
  }
): EventListenerId[] {
  return [
    // click
    grid.listen(EVENT_TYPE.CLICK_CELL, e => {
      if (!util.isTarget(e.col, e.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(e.row))) {
        return;
      }
      action({
        col: e.col,
        row: e.row
      });
    }),
    // mouse move
    grid.listen(EVENT_TYPE.MOUSEOVER_CELL, e => {
      if (!util.isTarget(e.col, e.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(e.row))) {
        return;
      }
      if (mouseOver) {
        if (
          !mouseOver({
            col: e.col,
            row: e.row
          })
        ) {
          return;
        }
      }
      grid.getElement().style.cursor = "pointer";
    }),
    grid.listen(EVENT_TYPE.MOUSEOUT_CELL, e => {
      if (!util.isTarget(e.col, e.row)) {
        return;
      }
      if (mouseOut) {
        mouseOut({
          col: e.col,
          row: e.row
        });
      }
      grid.getElement().style.cursor = "";
    })
  ];
}
export function bindCellKeyAction<T>(
  grid: ListGridAPI<T>,
  _col: number,
  util: ActionBindUtil,
  {
    action,
    acceptKeys = []
  }: {
    action: (cell: CellAddress) => void;
    acceptKeys?: number[];
  }
): EventListenerId[] {
  acceptKeys = [...acceptKeys, KEY_ENTER];
  return [
    // enter key down
    grid.listen(EVENT_TYPE.KEYDOWN, (keyCode, e) => {
      if (acceptKeys.indexOf(keyCode) === -1) {
        return;
      }
      const sel = grid.selection.select;
      if (!util.isTarget(sel.col, sel.row)) {
        return;
      }
      if (isPromise(grid.getRowRecord(sel.row))) {
        return;
      }
      action({
        col: sel.col,
        row: sel.row
      });
      event.cancel(e);
    })
  ];
}
