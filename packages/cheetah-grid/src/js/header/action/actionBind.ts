import {
  CellAddress,
  CellRange,
  DrawGridAPI,
  EventListenerId
} from "../../ts-types";
import { cellInRange, event } from "../../internal/utils";
import { EVENT_TYPE } from "../../core/EVENT_TYPE";
const KEY_ENTER = 13;
export function bindCellClickAction(
  grid: DrawGridAPI,
  range: CellRange,
  {
    action,
    mouseOver,
    mouseOut
  }: {
    action: (cell: CellAddress) => void;
    mouseOver?: (cell: CellAddress) => boolean;
    mouseOut?: (cell: CellAddress) => void;
  }
): EventListenerId[] {
  let inMouse: boolean;
  return [
    // click
    grid.listen(EVENT_TYPE.CLICK_CELL, e => {
      if (!cellInRange(range, e.col, e.row)) {
        return;
      }
      action({
        col: e.col,
        row: e.row
      });
    }),
    // mouse move
    grid.listen(EVENT_TYPE.MOUSEOVER_CELL, e => {
      if (!cellInRange(range, e.col, e.row)) {
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
      inMouse = true;
    }),
    //横からMOUSEENTERした場合、'col-resize'の処理と競合するのでmoveを監視して処理する
    grid.listen(EVENT_TYPE.MOUSEMOVE_CELL, e => {
      if (!cellInRange(range, e.col, e.row)) {
        return;
      }
      if (inMouse && !grid.getElement().style.cursor) {
        grid.getElement().style.cursor = "pointer";
      }
    }),
    grid.listen(EVENT_TYPE.MOUSEOUT_CELL, e => {
      if (!cellInRange(range, e.col, e.row)) {
        return;
      }
      if (mouseOut) {
        mouseOut({
          col: e.col,
          row: e.row
        });
      }
      grid.getElement().style.cursor = "";
      inMouse = false;
    })
  ];
}
export function bindCellKeyAction(
  grid: DrawGridAPI,
  range: CellRange,
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
      if (!cellInRange(range, sel.col, sel.row)) {
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
