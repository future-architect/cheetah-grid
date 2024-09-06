import * as calc from "../internal/calc";
import * as hiDPI from "../internal/hiDPI";
import * as style from "../internal/style";
import type {
  AfterSelectedCellEvent,
  AnyFunction,
  BeforeSelectedCellEvent,
  CellAddress,
  CellContext,
  CellRange,
  DrawGridAPI,
  DrawGridEventHandlersEventMap,
  DrawGridEventHandlersReturnMap,
  DrawGridKeyboardOptions,
  EventListenerId,
  KeyboardEventListener,
  KeydownEvent,
  MousePointerCellEvent,
  PasteCellEvent,
  PasteRangeBoxValues,
} from "../ts-types";
import {
  array,
  browser,
  event,
  isDescendantElement,
  isPromise,
} from "../internal/utils";

import {
  normalizePasteValue,
  parsePasteRangeBoxValues,
} from "../internal/paste-utils";
import { DG_EVENT_TYPE } from "./DG_EVENT_TYPE";
import { EventHandler } from "../internal/EventHandler";
import { EventTarget } from "./EventTarget";
import { NumberMap } from "../internal/NumberMap";
import { Rect } from "../internal/Rect";
import { Scrollable } from "../internal/Scrollable";
import { getFontSize } from "../internal/canvases";
//protected symbol
import { getProtectedSymbol } from "../internal/symbolManager";

const {
  /** @private */
  isTouchEvent,
  /** @private */
  getMouseButtons,
  /** @private */
  getKeyCode,
  /** @private */
  cancel: cancelEvent,
} = event;
/** @private */
const _ = getProtectedSymbol();

/** @private */
function createRootElement(): HTMLElement {
  const element = document.createElement("div");
  element.classList.add("cheetah-grid");
  return element;
}

/** @private */
const KEY_BS = 8;
/** @private */
const KEY_TAB = 9;
/** @private */
const KEY_ENTER = 13;
/** @private */
const KEY_END = 35;
/** @private */
const KEY_HOME = 36;
/** @private */
const KEY_LEFT = 37;
/** @private */
const KEY_UP = 38;
/** @private */
const KEY_RIGHT = 39;
/** @private */
const KEY_DOWN = 40;
/** @private */
const KEY_DEL = 46;
/** @private */
const KEY_ALPHA_A = 65;
/** @private */
const KEY_ALPHA_C = 67;
/** @private */
const KEY_ALPHA_V = 86;

//private methods
/** @private */
function _vibrate(e: TouchEvent | MouseEvent): void {
  if (navigator.vibrate && isTouchEvent(e)) {
    navigator.vibrate(50);
  }
}
/** @private */
function _getTargetRowAt(
  this: DrawGrid,
  absoluteY: number
): { row: number; top: number } | null {
  const internal = this.getTargetRowAtInternal(absoluteY);
  if (internal != null) {
    return internal;
  }
  const findBefore = (
    startRow: number,
    startBottom: number
  ): {
    top: number;
    row: number;
  } | null => {
    let bottom = startBottom;
    for (let row = startRow; row >= 0; row--) {
      const height = _getRowHeight.call(this, row);
      const top = bottom - height;
      if (top <= absoluteY && absoluteY < bottom) {
        return {
          top,
          row,
        };
      }
      bottom = top;
    }
    return null;
  };
  const findAfter = (
    startRow: number,
    startBottom: number
  ): {
    top: number;
    row: number;
  } | null => {
    let top = startBottom - _getRowHeight.call(this, startRow);
    const { rowCount } = this[_];
    for (let row = startRow; row < rowCount; row++) {
      const height = _getRowHeight.call(this, row);
      const bottom = top + height;
      if (top <= absoluteY && absoluteY < bottom) {
        return {
          top,
          row,
        };
      }
      top = bottom;
    }
    return null;
  };
  const candidateRow = Math.min(
    Math.ceil(absoluteY / this[_].defaultRowHeight),
    this.rowCount - 1
  );
  const bottom = _getRowsHeight.call(this, 0, candidateRow);
  if (absoluteY >= bottom) {
    return findAfter(candidateRow, bottom);
  } else {
    return findBefore(candidateRow, bottom);
  }
}
/** @private */
function _getTargetColAt(
  grid: DrawGrid,
  absoluteX: number
): {
  left: number;
  col: number;
} | null {
  let left = 0;
  const { colCount } = grid[_];
  for (let col = 0; col < colCount; col++) {
    const width = _getColWidth(grid, col);
    const right = left + width;
    if (right > absoluteX) {
      return {
        left,
        col,
      };
    }
    left = right;
  }
  return null;
}
/** @private */
function _getTargetFrozenRowAt(
  grid: DrawGrid,
  absoluteY: number
): {
  top: number;
  row: number;
} | null {
  if (!grid[_].frozenRowCount) {
    return null;
  }
  let { top } = grid[_].scroll;
  const rowCount = grid[_].frozenRowCount;
  for (let row = 0; row < rowCount; row++) {
    const height = _getRowHeight.call(grid, row);
    const bottom = top + height;
    if (bottom > absoluteY) {
      return {
        top,
        row,
      };
    }
    top = bottom;
  }
  return null;
}
/** @private */
function _getTargetFrozenColAt(
  grid: DrawGrid,
  absoluteX: number
): {
  left: number;
  col: number;
} | null {
  if (!grid[_].frozenColCount) {
    return null;
  }
  let { left } = grid[_].scroll;
  const colCount = grid[_].frozenColCount;
  for (let col = 0; col < colCount; col++) {
    const width = _getColWidth(grid, col);
    const right = left + width;
    if (right > absoluteX) {
      return {
        left,
        col,
      };
    }
    left = right;
  }
  return null;
}
/** @private */
function _getFrozenRowsRect(grid: DrawGrid): Rect | null {
  if (!grid[_].frozenRowCount) {
    return null;
  }
  const { top } = grid[_].scroll;
  let height = 0;
  const rowCount = grid[_].frozenRowCount;
  for (let row = 0; row < rowCount; row++) {
    height += _getRowHeight.call(grid, row);
  }
  return new Rect(grid[_].scroll.left, top, grid[_].canvas.width, height);
}
/** @private */
function _getFrozenColsRect(grid: DrawGrid): Rect | null {
  if (!grid[_].frozenColCount) {
    return null;
  }
  const { left } = grid[_].scroll;
  let width = 0;
  const colCount = grid[_].frozenColCount;
  for (let col = 0; col < colCount; col++) {
    width += _getColWidth(grid, col);
  }
  return new Rect(left, grid[_].scroll.top, width, grid[_].canvas.height);
}
/** @private */
function _getCellDrawing(
  grid: DrawGrid,
  col: number,
  row: number
): DrawCellContext | null {
  if (!grid[_].drawCells[row]) {
    return null;
  }
  return grid[_].drawCells[row][col];
}
/** @private */
function _putCellDrawing(
  grid: DrawGrid,
  col: number,
  row: number,
  context: DrawCellContext
): void {
  if (!grid[_].drawCells[row]) {
    grid[_].drawCells[row] = {};
  }
  grid[_].drawCells[row][col] = context;
}
/** @private */
function _removeCellDrawing(grid: DrawGrid, col: number, row: number): void {
  if (!grid[_].drawCells[row]) {
    return;
  }
  delete grid[_].drawCells[row][col];
  if (Object.keys(grid[_].drawCells[row]).length === 0) {
    delete grid[_].drawCells[row];
  }
}
/** @private */
function _drawCell(
  this: DrawGrid,
  ctx: CanvasRenderingContext2D,
  col: number,
  absoluteLeft: number,
  width: number,
  row: number,
  absoluteTop: number,
  height: number,
  visibleRect: Rect,
  skipAbsoluteTop: number,
  skipAbsoluteLeft: number,
  drawLayers: DrawLayers
): void {
  const rect = new Rect(
    absoluteLeft - visibleRect.left,
    absoluteTop - visibleRect.top,
    width,
    height
  );

  const drawRect = Rect.bounds(
    Math.max(absoluteLeft, skipAbsoluteLeft) - visibleRect.left,
    Math.max(absoluteTop, skipAbsoluteTop) - visibleRect.top,
    rect.right,
    rect.bottom
  );

  if (drawRect.height > 0 && drawRect.width > 0) {
    ctx.save();
    try {
      const cellDrawing = _getCellDrawing(this, col, row);
      if (cellDrawing) {
        cellDrawing.cancel();
      }
      const dcContext = new DrawCellContext(
        col,
        row,
        ctx,
        rect,
        drawRect,
        !!cellDrawing,
        this[_].selection,
        drawLayers
      );
      const p = this.onDrawCell(col, row, dcContext);
      if (isPromise(p)) {
        //遅延描画
        _putCellDrawing(this, col, row, dcContext);

        const pCol = col;
        dcContext._delayMode(this, () => {
          _removeCellDrawing(this, pCol, row);
        });
        p.then(() => {
          dcContext.terminate();
        });
      }
    } finally {
      ctx.restore();
    }
  }
}

/** @private */
function _drawRow(
  grid: DrawGrid,
  ctx: CanvasRenderingContext2D,
  initFrozenCol: { left: number; col: number } | null,
  initCol: { left: number; col: number },
  drawRight: number,
  row: number,
  absoluteTop: number,
  height: number,
  visibleRect: Rect,
  skipAbsoluteTop: number,
  drawLayers: DrawLayers
): void {
  const { colCount } = grid[_];
  const drawOuter = (col: number, absoluteLeft: number): void => {
    //データ範囲外の描画
    if (
      col >= colCount - 1 &&
      grid[_].canvas.width > absoluteLeft - visibleRect.left
    ) {
      const outerLeft = absoluteLeft - visibleRect.left;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = grid.underlayBackgroundColor || "#F6F6F6";
      ctx.rect(
        outerLeft,
        absoluteTop - visibleRect.top,
        grid[_].canvas.width - outerLeft,
        height
      );
      ctx.fill();
      ctx.restore();
    }
  };

  let skipAbsoluteLeft = 0;
  if (initFrozenCol) {
    let absoluteLeft = initFrozenCol.left;
    const count = grid[_].frozenColCount;
    for (let { col } = initFrozenCol; col < count; col++) {
      const width = _getColWidth(grid, col);

      _drawCell.call(
        grid,
        ctx,
        col,
        absoluteLeft,
        width,
        row,
        absoluteTop,
        height,
        visibleRect,
        skipAbsoluteTop,
        0,
        drawLayers
      );

      absoluteLeft += width;
      if (drawRight <= absoluteLeft) {
        //描画範囲外（終了）
        drawOuter(col, absoluteLeft);
        return;
      }
    }
    skipAbsoluteLeft = absoluteLeft;
  }

  let absoluteLeft = initCol.left;
  for (let { col } = initCol; col < colCount; col++) {
    const width = _getColWidth(grid, col);
    _drawCell.call(
      grid,
      ctx,
      col,
      absoluteLeft,
      width,
      row,
      absoluteTop,
      height,
      visibleRect,
      skipAbsoluteTop,
      skipAbsoluteLeft,
      drawLayers
    );

    absoluteLeft += width;
    if (drawRight <= absoluteLeft) {
      //描画範囲外（終了）
      drawOuter(col, absoluteLeft);
      return;
    }
  }
  drawOuter(colCount - 1, absoluteLeft);
}
/** @private */
function _getInitContext(this: DrawGrid): CanvasRenderingContext2D {
  return this._getInitContext();
}
/** @private */
function _invalidateRect(grid: DrawGrid, drawRect: Rect): void {
  const visibleRect = _getVisibleRect(grid);
  const { rowCount } = grid[_];
  const ctx = _getInitContext.call(grid);

  const initRow = _getTargetRowAt.call(
    grid,
    Math.max(visibleRect.top, drawRect.top)
  ) || {
    top: _getRowsHeight.call(grid, 0, rowCount - 1),
    row: rowCount,
  };
  const initCol = _getTargetColAt(
    grid,
    Math.max(visibleRect.left, drawRect.left)
  ) || {
    left: _getColsWidth(grid, 0, grid[_].colCount - 1),
    col: grid[_].colCount,
  };
  const drawBottom = Math.min(visibleRect.bottom, drawRect.bottom);
  const drawRight = Math.min(visibleRect.right, drawRect.right);

  const initFrozenRow = _getTargetFrozenRowAt(
    grid,
    Math.max(visibleRect.top, drawRect.top)
  );
  const initFrozenCol = _getTargetFrozenColAt(
    grid,
    Math.max(visibleRect.left, drawRect.left)
  );

  const drawLayers = new DrawLayers();

  const drawOuter = (row: number, absoluteTop: number): void => {
    //データ範囲外の描画
    if (
      row >= rowCount - 1 &&
      grid[_].canvas.height > absoluteTop - visibleRect.top
    ) {
      const outerTop = absoluteTop - visibleRect.top;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = grid.underlayBackgroundColor || "#F6F6F6";
      ctx.rect(
        0,
        outerTop,
        grid[_].canvas.width,
        grid[_].canvas.height - outerTop
      );
      ctx.fill();
      ctx.restore();
    }
  };

  let skipAbsoluteTop = 0;
  if (initFrozenRow) {
    let absoluteTop = initFrozenRow.top;
    const count = grid[_].frozenRowCount;
    for (let { row } = initFrozenRow; row < count; row++) {
      const height = _getRowHeight.call(grid, row);
      _drawRow(
        grid,
        ctx,
        initFrozenCol,
        initCol,
        drawRight,
        row,
        absoluteTop,
        height,
        visibleRect,
        0,
        drawLayers
      );
      absoluteTop += height;
      if (drawBottom <= absoluteTop) {
        //描画範囲外（終了）
        drawOuter(row, absoluteTop);
        drawLayers.draw(ctx);
        return;
      }
    }
    skipAbsoluteTop = absoluteTop;
  }

  let absoluteTop = initRow.top;
  for (let { row } = initRow; row < rowCount; row++) {
    const height = _getRowHeight.call(grid, row);

    //行の描画
    _drawRow(
      grid,
      ctx,
      initFrozenCol,
      initCol,
      drawRight,
      row,
      absoluteTop,
      height,
      visibleRect,
      skipAbsoluteTop,
      drawLayers
    );

    absoluteTop += height;
    if (drawBottom <= absoluteTop) {
      //描画範囲外（終了）
      drawOuter(row, absoluteTop);
      drawLayers.draw(ctx);
      return;
    }
  }
  drawOuter(rowCount - 1, absoluteTop);

  drawLayers.draw(ctx);
}
/** @private */
function _toPxWidth(grid: DrawGrid, width: string | number): number {
  return Math.round(calc.toPx(width, grid[_].calcWidthContext));
}
/** @private */
function _adjustColWidth(
  grid: DrawGrid,
  col: number,
  orgWidth: number
): number {
  const limits = _getColWidthLimits(grid, col);
  return Math.max(_applyColWidthLimits(limits, orgWidth), 0);
}
/** @private */
function _applyColWidthLimits(
  limits: { min?: number; max?: number } | void | null,
  orgWidth: number
): number {
  if (!limits) {
    return orgWidth;
  }

  if (limits.min) {
    if (limits.min > orgWidth) {
      return limits.min;
    }
  }
  if (limits.max) {
    if (limits.max < orgWidth) {
      return limits.max;
    }
  }
  return orgWidth;
}

/**
 * Gets the definition of the column width.
 * @param {DrawGrid} grid grid instance
 * @param {number} col number of column
 * @returns {string|number} width definition
 * @private
 */
function _getColWidthDefine(grid: DrawGrid, col: number): string | number {
  const width = grid[_].colWidthsMap.get(col);
  if (width) {
    return width;
  }
  return grid.defaultColWidth;
}

/**
 * Gets the column width limits.
 * @param {DrawGrid} grid grid instance
 * @param {number} col number of column
 * @returns {object|null} the column width limits
 * @private
 */
function _getColWidthLimits(
  grid: DrawGrid,
  col: number
):
  | {
      min?: undefined;
      minDef?: undefined;
      max?: undefined;
      maxDef?: undefined;
    }
  | {
      min: number;
      minDef: string | number;
      max?: undefined;
      maxDef?: undefined;
    }
  | {
      min?: undefined;
      minDef?: undefined;
      max: number;
      maxDef: string | number;
    }
  | null {
  const limit = grid[_].colWidthsLimit[col];
  if (!limit) {
    return null;
  }

  const result: {
    min?: number;
    max?: number;
    minDef?: string | number;
    maxDef?: string | number;
  } = {};

  if (limit.min) {
    result.min = _toPxWidth(grid, limit.min);
    result.minDef = limit.min;
  }
  if (limit.max) {
    result.max = _toPxWidth(grid, limit.max);
    result.maxDef = limit.max;
  }
  return result as never;
}

/**
 * Checks if the given width definition is `auto`.
 * @param {string|number} width width definition to check
 * @returns {boolean} `true ` if the given width definition is `auto`
 * @private
 */
function isAutoDefine(width: string | number): width is "auto" {
  return Boolean(
    width && typeof width === "string" && width.toLowerCase() === "auto"
  );
}

/**
 * Creates a formula to calculate the auto width.
 * @param {DrawGrid} grid grid instance
 * @returns {string} formula
 * @private
 */
function _calcAutoColWidthExpr(grid: DrawGrid, shortCircuit = true): string {
  const fullWidth = grid[_].calcWidthContext.full;
  let sumMin = 0;
  const others: (string | number)[] = [];
  let autoCount = 0;
  const hasLimitsOnAuto = [];
  for (let col = 0; col < grid[_].colCount; col++) {
    const def = _getColWidthDefine(grid, col);
    const limits = _getColWidthLimits(grid, col);

    if (isAutoDefine(def)) {
      if (limits) {
        hasLimitsOnAuto.push(limits);
        if (limits.min) {
          sumMin += limits.min;
        }
      }
      autoCount++;
    } else {
      let expr = def;
      if (limits) {
        const orgWidth = _toPxWidth(grid, expr);
        const newWidth = _applyColWidthLimits(limits, orgWidth);
        if (orgWidth !== newWidth) {
          expr = `${newWidth}px`;
        }
        sumMin += newWidth;
      }
      others.push(expr);
    }
    if (shortCircuit && sumMin > fullWidth) {
      // Returns 0px because it has consumed the full width.
      return "0px";
    }
  }
  if (hasLimitsOnAuto.length && others.length) {
    const autoPx =
      (fullWidth -
        _toPxWidth(
          grid,
          `calc(${others
            .map((c) => (typeof c === "number" ? `${c}px` : c))
            .join(" + ")})`
        )) /
      autoCount;
    hasLimitsOnAuto.forEach((limits) => {
      if (limits.min && autoPx < limits.min) {
        others.push(limits.minDef);
        autoCount--;
      } else if (limits.max && limits.max < autoPx) {
        others.push(limits.maxDef);
        autoCount--;
      }
    });
    if (shortCircuit && autoCount <= 0) {
      return `${autoPx}px`;
    }
  }
  if (others.length) {
    const strDefs: string[] = [];
    let num = 0;
    others.forEach((c) => {
      if (typeof c === "number") {
        num += c;
      } else {
        strDefs.push(c);
      }
    });
    strDefs.push(`${num}px`);
    return `calc((100% - (${strDefs.join(" + ")})) / ${autoCount})`;
  } else {
    return `${100 / autoCount}%`;
  }
}

/**
 * Calculate the pixels of width from the definition of width.
 * @param {DrawGrid} grid grid instance
 * @param {string|number} width width definition
 * @returns {number} the pixels of width
 * @private
 */
function _colWidthDefineToPxWidth(
  grid: DrawGrid,
  width: string | number
): number {
  if (isAutoDefine(width)) {
    return _toPxWidth(grid, _calcAutoColWidthExpr(grid));
  }
  return _toPxWidth(grid, width);
}

/** @private */
function _getColWidth(grid: DrawGrid, col: number): number {
  const width = _getColWidthDefine(grid, col);
  return _adjustColWidth(grid, col, _colWidthDefineToPxWidth(grid, width));
}
/** @private */
function _setColWidth(
  grid: DrawGrid,
  col: number,
  width: string | number | null
): void {
  if (width != null) {
    grid[_].colWidthsMap.put(col, width);
  } else {
    grid[_].colWidthsMap.remove(col);
  }
}

/**
 * Overwrites the definition of a column whose width is set to `auto` with the current auto width formula.
 * @param {DrawGrid} grid grid instance
 * @returns {void}
 * @private
 */
function _storeAutoColWidthExprs(grid: DrawGrid): void {
  let expr: string | null = null;
  for (let col = 0; col < grid[_].colCount; col++) {
    const def = _getColWidthDefine(grid, col);
    if (isAutoDefine(def)) {
      _setColWidth(
        grid,
        col,
        expr || (expr = _calcAutoColWidthExpr(grid, false))
      );
    }
  }
}
/** @private */
function _getColsWidth(
  grid: DrawGrid,
  startCol: number,
  endCol: number
): number {
  const defaultColPxWidth = _colWidthDefineToPxWidth(
    grid,
    grid.defaultColWidth
  );
  const colCount = endCol - startCol + 1;
  let w = defaultColPxWidth * colCount;
  grid[_].colWidthsMap.each(startCol, endCol, (width, col) => {
    w +=
      _adjustColWidth(grid, col, _colWidthDefineToPxWidth(grid, width)) -
      defaultColPxWidth;
  });
  for (let col = startCol; col <= endCol; col++) {
    if (grid[_].colWidthsMap.has(col)) {
      continue;
    }
    const adj = _adjustColWidth(grid, col, defaultColPxWidth);
    if (adj !== defaultColPxWidth) {
      w += adj - defaultColPxWidth;
    }
  }
  return w;
}

/** @private */
function _getRowHeight(this: DrawGrid, row: number): number {
  const internal = this.getRowHeightInternal(row);
  if (internal != null) {
    return internal;
  }
  const height = this[_].rowHeightsMap.get(row);
  if (height) {
    return height;
  }
  return this[_].defaultRowHeight;
}
/** @private */
function _setRowHeight(
  grid: DrawGrid,
  row: number,
  height: number | null
): void {
  if (height != null) {
    grid[_].rowHeightsMap.put(row, height);
  } else {
    grid[_].rowHeightsMap.remove(row);
  }
}
/** @private */
function _getRowsHeight(
  this: DrawGrid,
  startRow: number,
  endRow: number
): number {
  const internal = this.getRowsHeightInternal(startRow, endRow);
  if (internal != null) {
    return internal;
  }
  const rowCount = endRow - startRow + 1;
  let h = this[_].defaultRowHeight * rowCount;
  this[_].rowHeightsMap.each(startRow, endRow, (height: number): void => {
    h += height - this[_].defaultRowHeight;
  });
  return h;
}

/** @private */
function _getScrollWidth(grid: DrawGrid): number {
  return _getColsWidth(grid, 0, grid[_].colCount - 1);
}
/** @private */
function _getScrollHeight(this: DrawGrid, row?: number): number {
  const internal = this.getScrollHeightInternal(row);
  if (internal != null) {
    return internal;
  }
  let h = this[_].defaultRowHeight * this[_].rowCount;
  this[_].rowHeightsMap.each(0, this[_].rowCount - 1, (height) => {
    h += height - this[_].defaultRowHeight;
  });
  return h;
}
/** @private */
function _onScroll(grid: DrawGrid, _e: Event): void {
  const lastLeft = grid[_].scroll.left;
  const lastTop = grid[_].scroll.top;
  const moveX = grid[_].scrollable.scrollLeft - lastLeft;
  const moveY = grid[_].scrollable.scrollTop - lastTop;

  //次回計算用情報を保持
  grid[_].scroll = {
    left: grid[_].scrollable.scrollLeft,
    top: grid[_].scrollable.scrollTop,
  };

  // If the focus is on the header, recalculate and move the focus position.
  const { focus } = grid[_].selection;
  const isFrozenCell = grid.isFrozenCell(focus.col, focus.row);
  if (
    isFrozenCell &&
    ((isFrozenCell?.col && moveX) || (isFrozenCell?.row && moveY))
  ) {
    grid.setFocusCursor(focus.col, focus.row);
  }

  const visibleRect = _getVisibleRect(grid);
  if (
    Math.abs(moveX) >= visibleRect.width ||
    Math.abs(moveY) >= visibleRect.height
  ) {
    //全再描画
    _invalidateRect(grid, visibleRect);
  } else {
    //差分再描画
    grid[_].context.drawImage(grid[_].canvas, -moveX, -moveY);

    if (moveX !== 0) {
      //横移動の再描画範囲を計算
      const redrawRect = visibleRect.copy();
      if (moveX < 0) {
        redrawRect.width = -moveX;
        if (grid[_].frozenColCount > 0) {
          //固定列がある場合固定列分描画
          const frozenRect = _getFrozenColsRect(grid)!;
          redrawRect.width += frozenRect.width;
        }
      } else if (moveX > 0) {
        redrawRect.left = redrawRect.right - moveX;
      }

      //再描画
      _invalidateRect(grid, redrawRect);

      if (moveX > 0) {
        if (grid[_].frozenColCount > 0) {
          //固定列がある場合固定列描画
          _invalidateRect(grid, _getFrozenColsRect(grid)!);
        }
      }
    }
    if (moveY !== 0) {
      //縦移動の再描画範囲を計算
      const redrawRect = visibleRect.copy();
      if (moveY < 0) {
        redrawRect.height = -moveY;
        if (grid[_].frozenRowCount > 0) {
          //固定行がある場合固定行分描画
          const frozenRect = _getFrozenRowsRect(grid)!;
          redrawRect.height += frozenRect.height;
        }
      } else if (moveY > 0) {
        redrawRect.top = redrawRect.bottom - moveY;
      }

      //再描画
      _invalidateRect(grid, redrawRect);

      if (moveY > 0) {
        if (grid[_].frozenRowCount > 0) {
          //固定行がある場合固定行描画
          _invalidateRect(grid, _getFrozenRowsRect(grid)!);
        }
      }
    }
  }
}
/** @private */
// eslint-disable-next-line complexity
function _onKeyDownMove(this: DrawGrid, e: KeyboardEvent): void {
  const keyCode = getKeyCode(e);
  const focusCell = e.shiftKey ? this.selection.focus : this.selection.select;
  const ctrlOrMeta = e.ctrlKey || e.metaKey;
  if (keyCode === KEY_LEFT) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, null, "W", e.shiftKey);
    } else {
      if (!hMove.call(this, "W", e.shiftKey)) {
        return;
      }
    }
    cancelEvent(e);
  } else if (keyCode === KEY_UP) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, "N", null, e.shiftKey);
    } else {
      if (!vMove.call(this, "N", e.shiftKey)) {
        return;
      }
    }
    cancelEvent(e);
  } else if (keyCode === KEY_RIGHT) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, null, "E", e.shiftKey);
    } else {
      if (!hMove.call(this, "E", e.shiftKey)) {
        return;
      }
    }
    cancelEvent(e);
  } else if (keyCode === KEY_DOWN) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, "S", null, e.shiftKey);
    } else {
      if (!vMove.call(this, "S", e.shiftKey)) {
        return;
      }
    }
    cancelEvent(e);
  } else if (keyCode === KEY_HOME) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, "N", "W", e.shiftKey);
    } else {
      move(this, null, "W", e.shiftKey);
    }
    cancelEvent(e);
  } else if (keyCode === KEY_END) {
    if (e.altKey) return; // unknown modifier key
    if (ctrlOrMeta) {
      move(this, "S", "E", e.shiftKey);
    } else {
      move(this, null, "E", e.shiftKey);
    }
    cancelEvent(e);
  } else if (this.keyboardOptions?.moveCellOnTab && keyCode === KEY_TAB) {
    if (e.altKey || ctrlOrMeta) return; // unknown modifier key
    let newCell: CellAddress | null = null;
    if (typeof this.keyboardOptions.moveCellOnTab === "function") {
      newCell = this.keyboardOptions.moveCellOnTab({
        cell: focusCell,
        grid: this,
        event: e,
      });
    }
    if (newCell) {
      _moveFocusCell.call(this, newCell.col, newCell.row, false);
    } else if (e.shiftKey) {
      if (!hMove.call(this, "W", false)) {
        const row = this.getMoveUpRowByKeyDownInternal(focusCell);
        if (0 > row) {
          return;
        }
        _moveFocusCell.call(this, this.colCount - 1, row, false);
      }
    } else {
      if (!hMove.call(this, "E", false)) {
        const row = this.getMoveDownRowByKeyDownInternal(focusCell);
        if (this.rowCount <= row) {
          return;
        }
        _moveFocusCell.call(this, 0, row, false);
      }
    }
    cancelEvent(e);
  } else if (this.keyboardOptions?.moveCellOnEnter && keyCode === KEY_ENTER) {
    if (e.altKey || ctrlOrMeta) return; // unknown modifier key
    let newCell: CellAddress | null = null;
    if (typeof this.keyboardOptions.moveCellOnEnter === "function") {
      newCell = this.keyboardOptions.moveCellOnEnter({
        cell: focusCell,
        grid: this,
        event: e,
      });
    }
    if (newCell) {
      _moveFocusCell.call(this, newCell.col, newCell.row, false);
    } else if (e.shiftKey) {
      if (!vMove.call(this, "N", false)) {
        const col = this.getMoveLeftColByKeyDownInternal(focusCell);
        if (0 > col) {
          return;
        }
        _moveFocusCell.call(this, col, this.rowCount - 1, false);
      }
    } else {
      if (!vMove.call(this, "S", false)) {
        const col = this.getMoveRightColByKeyDownInternal(focusCell);
        if (this.colCount <= col) {
          return;
        }
        _moveFocusCell.call(
          this,
          col,
          Math.min(this.frozenRowCount, this.rowCount - 1),
          false
        );
      }
    }
    cancelEvent(e);
  } else if (
    this.keyboardOptions?.selectAllOnCtrlA &&
    keyCode === KEY_ALPHA_A
  ) {
    if (e.altKey || e.shiftKey) return; // unknown modifier key
    if (!ctrlOrMeta) return;
    this.selection.range = {
      start: { col: 0, row: 0 },
      end: { col: this.colCount - 1, row: this.rowCount - 1 },
    };
    this.invalidate();
    cancelEvent(e);
  }

  function move(
    grid: DrawGrid,
    vDir: "N" | "S" | null,
    hDir: "W" | "E" | null,
    shiftKeyFlg: boolean
  ): void {
    const row =
      vDir === "S" ? grid.rowCount - 1 : vDir === "N" ? 0 : focusCell.row;
    const col =
      hDir === "E" ? grid.colCount - 1 : hDir === "W" ? 0 : focusCell.col;
    _moveFocusCell.call(grid, col, row, shiftKeyFlg);
  }

  function vMove(
    this: DrawGrid,
    vDir: "N" | "S",
    shiftKeyFlg: boolean
  ): boolean {
    const { col } = focusCell;
    let row: number;
    if (vDir === "S") {
      row = this.getMoveDownRowByKeyDownInternal(focusCell);
      if (this.rowCount <= row) {
        // Avoids the problem of the scroll position breaking due to a delayed scrolling event if user hold down the arrow keys.
        this.makeVisibleCell(col, this.rowCount - 1);
        return false;
      }
    } else {
      row = this.getMoveUpRowByKeyDownInternal(focusCell);
      if (row < 0) {
        // Avoids the problem of the scroll position breaking due to a delayed scrolling event if user hold down the arrow keys.
        this.makeVisibleCell(col, 0);
        return false;
      }
    }
    _moveFocusCell.call(this, col, row, shiftKeyFlg);
    return true;
  }
  function hMove(
    this: DrawGrid,
    hDir: "W" | "E",
    shiftKeyFlg: boolean
  ): boolean {
    const { row } = focusCell;
    let col: number;
    if (hDir === "E") {
      col = this.getMoveRightColByKeyDownInternal(focusCell);
      if (this.colCount <= col) {
        // Avoids the problem of the scroll position breaking due to a delayed scrolling event if user hold down the arrow keys.
        this.makeVisibleCell(this.colCount - 1, row);
        return false;
      }
    } else {
      col = this.getMoveLeftColByKeyDownInternal(focusCell);
      if (col < 0) {
        // Avoids the problem of the scroll position breaking due to a delayed scrolling event if user hold down the arrow keys.
        this.makeVisibleCell(0, row);
        return false;
      }
    }
    _moveFocusCell.call(this, col, row, shiftKeyFlg);
    return true;
  }
}
/** @private */
function _moveFocusCell(
  this: DrawGrid,
  col: number,
  row: number,
  shiftKey: boolean
): void {
  const offset = this.getOffsetInvalidateCells();

  function extendRange(range: CellRange): CellRange {
    if (offset > 0) {
      range.start.col -= offset;
      range.start.row -= offset;
      range.end.col += offset;
      range.end.row += offset;
    }
    return range;
  }

  const beforeRange = extendRange(this.selection.range);
  const beforeRect = this.getCellRangeRect(beforeRange);

  this.selection._setFocusCell(col, row, shiftKey);
  this.makeVisibleCell(col, row);
  this.focusCell(col, row);

  const afterRange = extendRange(this.selection.range);
  const afterRect = this.getCellRangeRect(afterRange);

  if (afterRect.intersection(beforeRect)) {
    const invalidateRect = Rect.max(afterRect, beforeRect);
    _invalidateRect(this, invalidateRect);
  } else {
    _invalidateRect(this, beforeRect);
    _invalidateRect(this, afterRect);
  }
}
/** @private */
function _updatedSelection(this: DrawGrid): void {
  const { focusControl } = this[_];
  const { col: selCol, row: selRow } = this[_].selection.select;
  const results = this.fireListeners(DG_EVENT_TYPE.EDITABLEINPUT_CELL, {
    col: selCol,
    row: selRow,
  });

  const editMode = array.findIndex(results, (v) => !!v) >= 0;
  focusControl.editMode = editMode;

  if (editMode) {
    focusControl.storeInputStatus();
    focusControl.setDefaultInputStatus();
    this.fireListeners(DG_EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL, {
      col: selCol,
      row: selRow,
      input: focusControl.input,
    });
  }
}

/** @private */
function _getMouseAbstractPoint(
  grid: DrawGrid,
  evt: TouchEvent | MouseEvent
): { x: number; y: number } | null {
  let e: MouseEvent | Touch;
  if (isTouchEvent(evt)) {
    e = evt.changedTouches[0];
  } else {
    e = evt;
  }
  const clientX = e.clientX || e.pageX + window.scrollX;
  const clientY = e.clientY || e.pageY + window.scrollY;
  const rect = grid[_].canvas.getBoundingClientRect();
  if (rect.right <= clientX) {
    return null;
  }
  if (rect.bottom <= clientY) {
    return null;
  }
  const x = clientX - rect.left + grid[_].scroll.left;
  const y = clientY - rect.top + grid[_].scroll.top;
  return { x, y };
}

/** @private */
function _bindEvents(this: DrawGrid): void {
  // eslint-disable-next-line consistent-this, @typescript-eslint/no-this-alias
  const grid = this;
  const { handler, element, scrollable } = grid[_];
  const getCellEventArgsSet = <EVT extends TouchEvent | MouseEvent>(
    e: EVT
  ): {
    abstractPos?: { x: number; y: number };
    cell?: CellAddress;
    eventArgs?: CellAddress & { event: EVT };
  } => {
    const abstractPos = _getMouseAbstractPoint(grid, e);
    if (!abstractPos) {
      return {};
    }
    const cell = grid.getCellAt(abstractPos.x, abstractPos.y);
    if (cell.col < 0 || cell.row < 0) {
      return {
        abstractPos,
        cell,
      };
    }
    const eventArgs = {
      col: cell.col,
      row: cell.row,
      event: e,
    };
    return {
      abstractPos,
      cell,
      eventArgs,
    };
  };
  const canResizeColumn = (col: number): boolean => {
    if (grid[_].disableColumnResize) {
      return false;
    }
    const limit = grid[_].colWidthsLimit[col];
    if (!limit || !limit.min || !limit.max) {
      return true;
    }
    return limit.max !== limit.min;
  };
  handler.on(element, "mousedown", (e) => {
    const eventArgsSet = getCellEventArgsSet(e);
    const { abstractPos, eventArgs } = eventArgsSet;
    if (!abstractPos) {
      return;
    }
    if (eventArgs) {
      const results = grid.fireListeners(
        DG_EVENT_TYPE.MOUSEDOWN_CELL,
        eventArgs
      );
      if (array.findIndex(results, (v) => !v) >= 0) {
        return;
      }
    }
    if (
      getMouseButtons(e) !== 1 &&
      // For mobile safari. If we do not post-process here, the keyboard will not start in Mobile Safari.
      e.buttons !== 0
    ) {
      return;
    }
    const resizeCol = _getResizeColAt(grid, abstractPos.x, abstractPos.y);
    if (resizeCol >= 0 && canResizeColumn(resizeCol)) {
      //幅変更
      grid[_].columnResizer.start(resizeCol, e);
    } else {
      //選択
      grid[_].cellSelector.start(e);
    }
  });
  handler.on(element, "mouseup", (e) => {
    if (!grid.hasListeners(DG_EVENT_TYPE.MOUSEUP_CELL)) {
      return;
    }
    const { eventArgs } = getCellEventArgsSet(e);
    if (eventArgs) {
      grid.fireListeners(DG_EVENT_TYPE.MOUSEUP_CELL, eventArgs);
    }
  });
  let doubleTapBefore:
    | (CellAddress & { event: TouchEvent | MouseEvent })
    | null
    | undefined = null;
  let longTouchId: NodeJS.Timeout | null = null;
  let useTouch: { timeoutId?: NodeJS.Timeout } | null = null;
  function useTouchStart() {
    if (useTouch?.timeoutId != null) clearTimeout(useTouch.timeoutId);
    useTouch = {};
  }
  function useTouchEnd() {
    if (useTouch) {
      if (useTouch.timeoutId != null) clearTimeout(useTouch.timeoutId);
      useTouch.timeoutId = setTimeout(() => {
        useTouch = null;
      }, 350);
    }
  }
  handler.on(element, "touchstart", (e) => {
    // Since it is an environment where touch start can be used, it blocks mousemove that occurs after this.
    useTouchStart();

    const { eventArgs } = getCellEventArgsSet(e);
    if (eventArgs) {
      grid.fireListeners(DG_EVENT_TYPE.TOUCHSTART_CELL, eventArgs);
    }
    if (!doubleTapBefore) {
      doubleTapBefore = eventArgs;
      setTimeout(() => {
        doubleTapBefore = null;
      }, 350);
    } else {
      if (
        eventArgs &&
        eventArgs.col === doubleTapBefore.col &&
        eventArgs.row === doubleTapBefore.row
      ) {
        grid.fireListeners(DG_EVENT_TYPE.DBLTAP_CELL, eventArgs);
      }

      doubleTapBefore = null;

      if (e.defaultPrevented) {
        return;
      }
    }

    if (e.targetTouches.length > 1) {
      // If touchstart with multiple fingers,
      // it is not considered as an operation event.
      return;
    }

    longTouchId = setTimeout(() => {
      //長押しした場合選択モード
      longTouchId = null;
      const abstractPos = _getMouseAbstractPoint(grid, e);
      if (!abstractPos) {
        return;
      }

      const resizeCol = _getResizeColAt(grid, abstractPos.x, abstractPos.y, 15);
      if (resizeCol >= 0 && canResizeColumn(resizeCol)) {
        //幅変更
        grid[_].columnResizer.start(resizeCol, e);
      } else {
        //選択
        grid[_].cellSelector.start(e);
      }
    }, 500);
  });

  function cancel(_e: Event): void {
    if (longTouchId) {
      clearTimeout(longTouchId);
      longTouchId = null;
    }
  }
  handler.on(element, "touchcancel", (e) => {
    cancel(e);
    useTouchEnd();
  });
  handler.on(element, "touchmove", cancel);
  handler.on(element, "touchend", (e) => {
    useTouchEnd();
    if (longTouchId) {
      clearTimeout(longTouchId);
      grid[_].cellSelector.select(e);
      longTouchId = null;
    }
  });

  let isMouseover = false;
  let mouseEnterCell: CellAddress | null = null;
  let mouseOverCell: CellAddress | null = null;
  type MousePointerCellEventInfoProps = Pick<
    MousePointerCellEvent,
    "related" | "event"
  >;
  function onMouseenterCell(
    cell: CellAddress,
    props: MousePointerCellEventInfoProps
  ): void {
    grid.fireListeners(DG_EVENT_TYPE.MOUSEENTER_CELL, {
      ...props,
      col: cell.col,
      row: cell.row,
    });
    mouseEnterCell = cell;
  }
  function onMouseleaveCell(
    props: MousePointerCellEventInfoProps
  ): CellAddress | undefined {
    const beforeMouseCell = mouseEnterCell;
    mouseEnterCell = null;
    if (beforeMouseCell) {
      grid.fireListeners(DG_EVENT_TYPE.MOUSELEAVE_CELL, {
        ...props,
        col: beforeMouseCell.col,
        row: beforeMouseCell.row,
      });
    }
    return beforeMouseCell || undefined;
  }
  function onMouseoverCell(
    cell: CellAddress,
    props: MousePointerCellEventInfoProps
  ): void {
    grid.fireListeners(DG_EVENT_TYPE.MOUSEOVER_CELL, {
      ...props,
      col: cell.col,
      row: cell.row,
    });
    mouseOverCell = cell;
  }
  function onMouseoutCell(
    props: MousePointerCellEventInfoProps
  ): CellAddress | undefined {
    const beforeMouseCell = mouseOverCell;
    mouseOverCell = null;
    if (beforeMouseCell) {
      grid.fireListeners(DG_EVENT_TYPE.MOUSEOUT_CELL, {
        ...props,
        col: beforeMouseCell.col,
        row: beforeMouseCell.row,
      });
    }
    return beforeMouseCell || undefined;
  }
  const scrollElement = scrollable.getElement();
  handler.on(scrollElement, "mouseover", (_e: MouseEvent): void => {
    isMouseover = true;
  });
  handler.on(scrollElement, "mouseout", (event: MouseEvent): void => {
    isMouseover = false;
    onMouseoutCell({ event });
  });

  handler.on(element, "mouseleave", (event: MouseEvent): void => {
    onMouseleaveCell({ event });
  });

  handler.on(element, "mousemove", (e) => {
    if (useTouch) {
      // Probably a mousemove event triggered by a touchstart. Therefore, this event is blocked.
      return;
    }

    const eventArgsSet = getCellEventArgsSet(e);
    const { abstractPos, eventArgs } = eventArgsSet;
    if (eventArgs) {
      const beforeMouseCell = mouseEnterCell;
      if (beforeMouseCell) {
        grid.fireListeners(DG_EVENT_TYPE.MOUSEMOVE_CELL, eventArgs);
        if (
          beforeMouseCell.col !== eventArgs.col ||
          beforeMouseCell.row !== eventArgs.row
        ) {
          const enterCell = {
            col: eventArgs.col,
            row: eventArgs.row,
          };
          const outCell = onMouseoutCell({ related: enterCell, event: e });
          const leaveCell = onMouseleaveCell({ related: enterCell, event: e });
          onMouseenterCell(enterCell, { related: leaveCell, event: e });
          if (isMouseover) {
            onMouseoverCell(enterCell, { related: outCell, event: e });
          }
        } else if (isMouseover && !mouseOverCell) {
          onMouseoverCell(
            {
              col: eventArgs.col,
              row: eventArgs.row,
            },
            {
              event: e,
            }
          );
        }
      } else {
        const enterCell = {
          col: eventArgs.col,
          row: eventArgs.row,
        };
        onMouseenterCell(enterCell, {
          event: e,
        });
        if (isMouseover) {
          onMouseoverCell(enterCell, {
            event: e,
          });
        }
        grid.fireListeners(DG_EVENT_TYPE.MOUSEMOVE_CELL, eventArgs);
      }
    } else {
      onMouseoutCell({
        event: e,
      });
      onMouseleaveCell({
        event: e,
      });
    }
    if (grid[_].columnResizer.moving(e) || grid[_].cellSelector.moving(e)) {
      return;
    }
    const { style } = element;
    if (!abstractPos) {
      if (style.cursor === "col-resize") {
        style.cursor = "";
      }
      return;
    }
    const resizeCol = _getResizeColAt(grid, abstractPos.x, abstractPos.y);
    if (resizeCol >= 0 && canResizeColumn(resizeCol)) {
      style.cursor = "col-resize";
    } else {
      if (style.cursor === "col-resize") {
        style.cursor = "";
      }
    }
  });
  handler.on(element, "click", (e) => {
    if (
      grid[_].columnResizer.lastMoving(e) ||
      grid[_].cellSelector.lastMoving(e)
    ) {
      return;
    }
    if (!grid.hasListeners(DG_EVENT_TYPE.CLICK_CELL)) {
      return;
    }
    const { eventArgs } = getCellEventArgsSet(e);
    if (!eventArgs) {
      return;
    }
    grid.fireListeners(DG_EVENT_TYPE.CLICK_CELL, eventArgs);
  });
  handler.on(element, "contextmenu", (e) => {
    if (!grid.hasListeners(DG_EVENT_TYPE.CONTEXTMENU_CELL)) {
      return;
    }
    const { eventArgs } = getCellEventArgsSet(e);
    if (!eventArgs) {
      return;
    }
    grid.fireListeners(DG_EVENT_TYPE.CONTEXTMENU_CELL, eventArgs);
  });
  handler.on(element, "dblclick", (e) => {
    if (!grid.hasListeners(DG_EVENT_TYPE.DBLCLICK_CELL)) {
      return;
    }
    const { eventArgs } = getCellEventArgsSet(e);
    if (!eventArgs) {
      return;
    }
    grid.fireListeners(DG_EVENT_TYPE.DBLCLICK_CELL, eventArgs);
  });
  grid[_].focusControl.onKeyDown((evt: KeydownEvent) => {
    grid.fireListeners(DG_EVENT_TYPE.KEYDOWN, evt);
  });
  grid[_].selection.listen(DG_EVENT_TYPE.SELECTED_CELL, (data) => {
    grid.fireListeners(DG_EVENT_TYPE.SELECTED_CELL, data, data.selected);
  });

  scrollable.onScroll((e) => {
    _onScroll(grid, e);
    grid.fireListeners(DG_EVENT_TYPE.SCROLL, { event: e });
  });
  grid[_].focusControl.onKeyDownMove((e) => {
    _onKeyDownMove.call(grid, e);
  });
  grid.listen("copydata", (range) => {
    const copyRange = grid.getCopyRangeInternal(range);
    const copyLines: string[] = [];
    for (let { row } = copyRange.start; row <= copyRange.end.row; row++) {
      let copyLine = "";
      for (let { col } = copyRange.start; col <= copyRange.end.col; col++) {
        const copyCellValue = grid.getCopyCellValue(col, row, copyRange);

        let strCellValue: string;
        if (typeof copyCellValue === "string") {
          strCellValue = copyCellValue;
        } else if (
          copyCellValue == null ||
          // Asynchronous data is treated as empty.
          (typeof Promise !== "undefined" && copyCellValue instanceof Promise)
        ) {
          strCellValue = "";
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          strCellValue = `${copyCellValue}`;
          if (/^\[object .*\]$/.exec(strCellValue)) {
            // Ignore maybe object
            strCellValue = "";
          }
        }

        copyLine += /[\t\n]/.test(strCellValue)
          ? // Need quote
            `"${strCellValue.replace(/"/g, '""')}"`
          : strCellValue;

        if (col < copyRange.end.col) {
          copyLine += "\t";
        }
      }
      copyLines.push(copyLine);
    }
    return copyLines.join("\n");
  });
  grid[_].focusControl.onCopy((_e: ClipboardEvent): string | void =>
    array.find(
      grid.fireListeners("copydata", grid[_].selection.range),
      (r) => r != null
    )
  );
  grid[_].focusControl.onPaste(
    ({ value, event }: { value: string; event: ClipboardEvent }) => {
      const { trimOnPaste } = grid;
      const normalizedValue = normalizePasteValue(value);
      const { col, row } = grid[_].selection.select;
      const multi = /[\r\n\u2028\u2029\t]/.test(normalizedValue); // is multi cell values
      let rangeBoxValues: PasteRangeBoxValues | null = null;
      const pasteCellEvent: PasteCellEvent = {
        col,
        row,
        value,
        normalizeValue: trimOnPaste ? normalizedValue.trim() : normalizedValue,
        multi,
        get rangeBoxValues(): PasteRangeBoxValues {
          return (
            rangeBoxValues ??
            (rangeBoxValues = parsePasteRangeBoxValues(normalizedValue, {
              trimOnPaste,
            }))
          );
        },
        event,
      };
      grid.fireListeners(DG_EVENT_TYPE.PASTE_CELL, pasteCellEvent);
    }
  );
  grid[_].focusControl.onInput((value) => {
    const { col, row } = grid[_].selection.select;
    grid.fireListeners(DG_EVENT_TYPE.INPUT_CELL, { col, row, value });
  });
  grid[_].focusControl.onDelete((event) => {
    const { col, row } = grid[_].selection.select;
    grid.fireListeners(DG_EVENT_TYPE.DELETE_CELL, { col, row, event });
  });
  grid[_].focusControl.onFocus((e: FocusEvent) => {
    grid.fireListeners(DG_EVENT_TYPE.FOCUS_GRID, e);
    grid[_].focusedGrid = true;

    const { col, row } = grid[_].selection.select;
    grid.invalidateCell(col, row);
  });
  grid[_].focusControl.onBlur((e) => {
    grid.fireListeners(DG_EVENT_TYPE.BLUR_GRID, e);
    grid[_].focusedGrid = false;

    const { col, row } = grid[_].selection.select;
    grid.invalidateCell(col, row);
  });
}

/** @private */
function _getResizeColAt(
  grid: DrawGrid,
  abstractX: number,
  abstractY: number,
  offset = 5
): number {
  if (grid[_].frozenRowCount <= 0) {
    return -1;
  }
  const frozenRect = _getFrozenRowsRect(grid)!;
  if (!frozenRect.inPoint(abstractX, abstractY)) {
    return -1;
  }
  const cell = grid.getCellAt(abstractX, abstractY);
  const cellRect = grid.getCellRect(cell.col, cell.row);
  if (abstractX < cellRect.left + offset) {
    return cell.col - 1;
  }
  if (cellRect.right - offset < abstractX) {
    return cell.col;
  }
  return -1;
}
/** @private */
function _getVisibleRect(grid: DrawGrid): Rect {
  const {
    scroll: { left, top },
    canvas: { width, height },
  } = grid[_];
  return new Rect(left, top, width, height);
}
/** @private */
function _getScrollableVisibleRect(grid: DrawGrid): Rect {
  let frozenColsWidth = 0;
  if (grid[_].frozenColCount > 0) {
    //固定列がある場合固定列分描画
    const frozenRect = _getFrozenColsRect(grid)!;
    frozenColsWidth = frozenRect.width;
  }
  let frozenRowsHeight = 0;
  if (grid[_].frozenRowCount > 0) {
    //固定列がある場合固定列分描画
    const frozenRect = _getFrozenRowsRect(grid)!;
    frozenRowsHeight = frozenRect.height;
  }
  return new Rect(
    grid[_].scrollable.scrollLeft + frozenColsWidth,
    grid[_].scrollable.scrollTop + frozenRowsHeight,
    grid[_].canvas.width - frozenColsWidth,
    grid[_].canvas.height - frozenRowsHeight
  );
}

/** @private */
function _toRelativeRect(grid: DrawGrid, absoluteRect: Rect): Rect {
  const rect = absoluteRect.copy();
  const visibleRect = _getVisibleRect(grid);
  rect.offsetLeft(-visibleRect.left);
  rect.offsetTop(-visibleRect.top);

  return rect;
}
//end private methods
//
//
//
//

/**
 * managing mouse down moving
 * @private
 */
class BaseMouseDownMover {
  protected _grid: DrawGrid;
  private _handler: EventHandler;
  private _events: {
    mousemove?: EventListenerId;
    mouseup?: EventListenerId;
    touchmove?: EventListenerId;
    touchend?: EventListenerId;
    touchcancel?: EventListenerId;
  };
  private _started: boolean;
  private _moved: boolean;
  private _mouseEndPoint?: { x: number; y: number } | null;
  constructor(grid: DrawGrid) {
    this._grid = grid;
    this._handler = new EventHandler();
    this._events = {};
    this._started = false;
    this._moved = false;
  }
  moving(_e: MouseEvent | TouchEvent): boolean {
    return !!this._started;
  }
  lastMoving(e: MouseEvent | TouchEvent): boolean {
    // mouseup後すぐに、clickイベントを反応しないようにする制御要
    if (this.moving(e)) {
      return true;
    }
    const last = this._mouseEndPoint;
    if (!last) {
      return false;
    }
    const pt = _getMouseAbstractPoint(this._grid, e);
    return pt != null && pt.x === last.x && pt.y === last.y;
  }
  protected _bindMoveAndUp(e: MouseEvent | TouchEvent): void {
    const events = this._events;
    const handler = this._handler;
    if (!isTouchEvent(e)) {
      events.mousemove = handler.on(document.body, "mousemove", (e) =>
        this._mouseMove(e)
      );
      events.mouseup = handler.on(document.body, "mouseup", (e) =>
        this._mouseUp(e)
      );
    } else {
      events.touchmove = handler.on(
        document.body,
        "touchmove",
        (e) => this._mouseMove(e),
        { passive: false }
      );
      events.touchend = handler.on(document.body, "touchend", (e) =>
        this._mouseUp(e)
      );
      events.touchcancel = handler.on(document.body, "touchcancel", (e) =>
        this._mouseUp(e)
      );
    }
    this._started = true;
    this._moved = false;
  }
  private _mouseMove(e: MouseEvent | TouchEvent): void {
    if (!isTouchEvent(e)) {
      if (getMouseButtons(e) !== 1) {
        this._mouseUp(e);
        return;
      }
    }
    this._moved = this._moveInternal(e) || this._moved /*calculation on after*/;

    cancelEvent(e);
  }
  protected _moveInternal(_e: MouseEvent | TouchEvent): boolean {
    //protected
    return false;
  }
  private _mouseUp(e: MouseEvent | TouchEvent): void {
    const events = this._events;
    const handler = this._handler;
    handler.off(events.mousemove);
    handler.off(events.touchmove);
    handler.off(events.mouseup);
    handler.off(events.touchend);
    // handler.off(this._events.mouseleave);
    handler.off(events.touchcancel);

    this._started = false;

    this._upInternal(e);

    // mouseup後すぐに、clickイベントを反応しないようにする制御要
    if (this._moved) {
      //移動が発生していたら
      this._mouseEndPoint = _getMouseAbstractPoint(this._grid, e);
      setTimeout(() => {
        this._mouseEndPoint = null;
      }, 10);
    }
  }
  protected _upInternal(_e: MouseEvent | TouchEvent): void {
    //protected
  }
  dispose(): void {
    this._handler.dispose();
  }
}

/**
 * managing cell selection operation with mouse
 * @private
 */
class CellSelector extends BaseMouseDownMover {
  private _cell?: CellAddress;
  start(e: MouseEvent | TouchEvent): void {
    const cell = this._getTargetCell(e);
    if (!cell) {
      return;
    }
    _moveFocusCell.call(this._grid, cell.col, cell.row, e.shiftKey);

    this._bindMoveAndUp(e);

    this._cell = cell;

    cancelEvent(e);
    _vibrate(e);
  }
  select(e: MouseEvent | TouchEvent): void {
    const cell = this._getTargetCell(e);
    if (!cell) {
      return;
    }
    _moveFocusCell.call(this._grid, cell.col, cell.row, e.shiftKey);
    this._cell = cell;
  }
  protected _moveInternal(e: MouseEvent | TouchEvent): boolean {
    const cell = this._getTargetCell(e);
    if (!cell) {
      return false;
    }
    const { col: oldCol, row: oldRow } = this._cell!;
    const { col: newCol, row: newRow } = cell;
    if (oldCol === newCol && oldRow === newRow) {
      return false;
    }
    const grid = this._grid;
    _moveFocusCell.call(grid, newCol, newRow, true);

    //make visible
    const makeVisibleCol = ((): number => {
      if (newCol < oldCol && 0 < newCol) {
        // move left
        return newCol - 1;
      } else if (oldCol < newCol && newCol + 1 < grid.colCount) {
        // move right
        return newCol + 1;
      }
      return newCol;
    })();
    const makeVisibleRow = ((): number => {
      if (newRow < oldRow && 0 < newRow) {
        // move up
        return newRow - 1;
      } else if (oldRow < newRow && newRow + 1 < grid.rowCount) {
        // move down
        return newRow + 1;
      }
      return newRow;
    })();
    if (makeVisibleCol !== newCol || makeVisibleRow !== newRow) {
      grid.makeVisibleCell(makeVisibleCol, makeVisibleRow);
    }
    this._cell = cell;
    return true;
  }
  private _getTargetCell(e: MouseEvent | TouchEvent): CellAddress | null {
    const grid = this._grid;
    const abstractPos = _getMouseAbstractPoint(grid, e);
    if (!abstractPos) {
      return null;
    }
    const cell = grid.getCellAt(abstractPos.x, abstractPos.y);
    if (cell.col < 0 || cell.row < 0) {
      return null;
    }
    return cell;
  }
}
/**
 * managing row width changing operation with mouse
 * @private
 */
class ColumnResizer extends BaseMouseDownMover {
  private _targetCol: number;
  private _x = -1;
  private _preX = -1;
  private _invalidateAbsoluteLeft = -1;
  constructor(grid: DrawGrid) {
    super(grid);
    this._targetCol = -1;
  }
  start(col: number, e: MouseEvent | TouchEvent): void {
    let pageX;
    if (!isTouchEvent(e)) {
      ({ pageX } = e);
    } else {
      ({ pageX } = e.changedTouches[0]);
    }

    this._x = pageX;
    this._preX = 0;

    this._bindMoveAndUp(e);

    this._targetCol = col;
    this._invalidateAbsoluteLeft = _getColsWidth(this._grid, 0, col - 1);

    cancelEvent(e);
    _vibrate(e);
  }
  protected _moveInternal(e: MouseEvent | TouchEvent): boolean {
    const pageX = isTouchEvent(e) ? e.changedTouches[0].pageX : e.pageX;

    const x = pageX - this._x;
    const moveX = x - this._preX;
    this._preX = x;
    const pre = this._grid.getColWidth(this._targetCol);
    let afterSize = _adjustColWidth(this._grid, this._targetCol, pre + moveX);
    if (afterSize < 10 && moveX < 0) {
      afterSize = 10;
    }
    _storeAutoColWidthExprs(this._grid);
    _setColWidth(this._grid, this._targetCol, afterSize);

    const rect = _getVisibleRect(this._grid);
    rect.left = this._invalidateAbsoluteLeft;
    _invalidateRect(this._grid, rect);

    this._grid.fireListeners(DG_EVENT_TYPE.RESIZE_COLUMN, {
      col: this._targetCol,
    });

    return true;
  }
  protected _upInternal(_e: MouseEvent | TouchEvent): void {
    const grid = this._grid;
    if (grid.updateScroll()) {
      grid.invalidate();
    }
  }
}

/** @private */
function setSafeInputValue(input: HTMLInputElement, value: string): void {
  const { type } = input;
  input.type = "";
  input.value = value;
  if (type) {
    input.type = type;
  }
}

const IGNORE_STORE_ATTRS = ["style", "readonly"];

/**
 * Manage focus
 * @private
 */
class FocusControl extends EventTarget {
  private _grid: DrawGrid;
  private _scrollable: Scrollable;
  private _handler: EventHandler;
  private _input: HTMLInputElement;
  private _isComposition?: boolean;
  private _compositionEnd?: NodeJS.Timeout;
  private _inputStatus?: { [key: string]: string };
  private _keyDownMoveCallback?: KeyboardEventListener;
  constructor(
    grid: DrawGrid,
    parentElement: HTMLElement,
    scrollable: Scrollable,
    selection: Selection
  ) {
    super();
    this._grid = grid;
    this._scrollable = scrollable;
    const handler = (this._handler = new EventHandler());
    const input = (this._input = document.createElement("input"));
    input.classList.add("grid-focus-control");
    input.readOnly = true;
    parentElement.appendChild(input);

    handler.on(input, "compositionstart", (_e: Event): void => {
      input.classList.add("composition");
      input.style.font = grid.font || "16px sans-serif";
      this._isComposition = true;
      if (this._compositionEnd) {
        clearTimeout(this._compositionEnd);
        delete this._compositionEnd;
      }
      grid.focus();
    });
    let lastInputValue: string | undefined;
    const inputClear = (storeLastInputValue: boolean): void => {
      lastInputValue = input.value;
      if (this._isComposition) {
        return;
      }

      if (lastInputValue !== "") {
        setSafeInputValue(input, "");
      }
      if (!storeLastInputValue) {
        lastInputValue = "";
      }
    };

    const handleCompositionEnd = (): void => {
      this._isComposition = false;
      input.classList.remove("composition");
      input.style.font = "";
      const { value } = input;

      inputClear(false);

      if (!input.readOnly) {
        this.fireListeners("input", value);
      }

      if (this._compositionEnd) {
        clearTimeout(this._compositionEnd);
        delete this._compositionEnd;
      }
    };
    handler.on(input, "compositionend", (_e: Event): void => {
      this._compositionEnd = setTimeout(handleCompositionEnd, 1);
    });
    selection.listen("before_hook", () => {
      if (this._compositionEnd) {
        handleCompositionEnd();
      }
    });

    handler.on(input, "keypress", (e) => {
      if (this._isComposition) {
        return;
      }
      if (!input.readOnly && e.key && e.key.length === 1) {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === "c") {
            //copy! for Firefox & Safari
          } else if (e.key === "v") {
            //paste! for Firefox & Safari
          }
        } else {
          if (e.key === " ") {
            // Since the full-width space cannot be determined, it is processed by "input".
            return;
          }
          this.fireListeners("input", e.key);
          cancelEvent(e);
        }
      }
      inputClear(true);
    });
    handler.on(input, "keydown", (e) => {
      if (this._isComposition) {
        if (this._compositionEnd) {
          handleCompositionEnd();
          cancelEvent(e);
        }
        return;
      }
      const keyCode = getKeyCode(e);
      let stopCellMove = false;
      const evt: KeydownEvent = {
        keyCode,
        event: e,
        stopCellMoving() {
          stopCellMove = true;
        },
      };
      this.fireListeners("keydown", evt);

      if (!input.readOnly && lastInputValue) {
        // for Safari
        this.fireListeners("input", lastInputValue);
      }
      if (!stopCellMove) this.fireKeyDownMove(keyCode, e);
      if (
        this._grid.keyboardOptions?.deleteCellValueOnDel &&
        (keyCode === KEY_DEL || keyCode === KEY_BS)
      ) {
        this.fireListeners("delete", e);
      }

      inputClear(true);
    });
    handler.on(input, "keyup", (_e) => {
      if (this._isComposition) {
        if (this._compositionEnd) {
          handleCompositionEnd();
        }
      }
      inputClear(true);
    });

    handler.on(input, "input", (e: InputEvent) => {
      if (e.data === " " || e.data === "　") {
        // Since the full-width space cannot be determined on "keypress", it is processed by "input".
        this.fireListeners("input", e.data);
      }
      inputClear(true);
    });
    if (browser.IE) {
      handler.on(document, "keydown", (e) => {
        if (e.target !== input) {
          return;
        }
        const keyCode = getKeyCode(e);
        if (keyCode === KEY_ALPHA_C && e.ctrlKey) {
          // When text is not selected copy-event is not emit, on IE.
          setSafeInputValue(input, "dummy");
          input.select();
          setTimeout(() => {
            setSafeInputValue(input, "");
          }, 100);
        } else if (keyCode === KEY_ALPHA_V && e.ctrlKey) {
          // When input is read-only paste-event is not emit, on IE.
          if (input.readOnly) {
            input.readOnly = false;
            setTimeout(() => {
              input.readOnly = true;
              setSafeInputValue(input, "");
            }, 10);
          }
        }
      });
    }
    if (browser.Edge) {
      handler.once(document, "keydown", (e) => {
        if (!isDescendantElement(parentElement, e.target as HTMLElement)) {
          return;
        }
        // When the input has focus on the first page opening, the paste-event and copy-event is not emit, on Edge.
        const dummyInput = document.createElement("input");
        grid.getElement().appendChild(dummyInput);
        dummyInput.focus();
        input.focus();
        dummyInput.parentElement?.removeChild(dummyInput);
      });
    }
    handler.on(document, "paste", (e) => {
      if (!isDescendantElement(parentElement, e.target as HTMLElement)) {
        return;
      }
      let pasteText: string | undefined = undefined;
      if (browser.IE) {
        // IE
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pasteText = (window as any).clipboardData.getData("Text");
      } else {
        const clipboardData = e.clipboardData!;
        if (clipboardData.items) {
          // Chrome & Firefox & Edge
          pasteText = clipboardData.getData("text/plain");
        } else {
          // Safari
          if (
            -1 !==
            Array.prototype.indexOf.call(clipboardData.types, "text/plain")
          ) {
            pasteText = clipboardData.getData("Text");
          }
        }
      }
      if (pasteText != null && pasteText.length) {
        this.fireListeners("paste", { value: pasteText, event: e });
      }
    });
    handler.on(document, "copy", (e) => {
      if (this._isComposition) {
        return;
      }
      if (!isDescendantElement(parentElement, e.target as HTMLElement)) {
        return;
      }
      setSafeInputValue(input, "");
      const data = array.find(this.fireListeners("copy"), (r) => r != null);
      if (data != null) {
        cancelEvent(e);
        if (browser.IE) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).clipboardData.setData("Text", data); // IE
        } else {
          e.clipboardData!.setData("text/plain", data as string); // Chrome, Firefox
        }
      }
    });
    handler.on(input, "focus", (e) => {
      this.fireListeners("focus", e);
    });
    handler.on(input, "blur", (e) => {
      this.fireListeners("blur", e);
    });
  }
  fireKeyDownMove(keyCode: number, e: KeyboardEvent): void {
    const fn = this._keyDownMoveCallback;
    if (!fn) {
      return;
    }
    if (this._isComposition) {
      return;
    }
    if (
      keyCode === KEY_LEFT ||
      keyCode === KEY_UP ||
      keyCode === KEY_RIGHT ||
      keyCode === KEY_DOWN ||
      keyCode === KEY_HOME ||
      keyCode === KEY_END
    ) {
      fn(e);
    } else if (
      this._grid.keyboardOptions?.moveCellOnTab &&
      keyCode === KEY_TAB
    ) {
      fn(e);
    } else if (
      this._grid.keyboardOptions?.moveCellOnEnter &&
      keyCode === KEY_ENTER
    ) {
      fn(e);
    } else if (
      this._grid.keyboardOptions?.selectAllOnCtrlA &&
      keyCode === KEY_ALPHA_A &&
      (e.ctrlKey || e.metaKey)
    ) {
      fn(e);
    }
  }
  onKeyDownMove(fn: KeyboardEventListener): void {
    this._keyDownMoveCallback = fn;
  }
  onKeyDown(fn: (e: KeydownEvent) => void): EventListenerId {
    return this.listen("keydown", fn);
  }
  onInput(fn: (value: string) => void): EventListenerId {
    return this.listen("input", fn);
  }
  onDelete(fn: (e: KeyboardEvent) => void): EventListenerId {
    return this.listen("delete", fn);
  }
  onCopy(fn: (e: ClipboardEvent) => void): EventListenerId {
    return this.listen("copy", fn);
  }
  onPaste(
    fn: (e: { value: string; event: ClipboardEvent }) => void
  ): EventListenerId {
    return this.listen("paste", fn);
  }
  onFocus(fn: (e: FocusEvent) => void): EventListenerId {
    return this.listen("focus", fn);
  }
  onBlur(fn: (e: FocusEvent) => void): EventListenerId {
    return this.listen("blur", fn);
  }
  focus(): void {
    // this._input.value = '';
    this._input.focus();
  }
  setFocusRect(rect: Rect): void {
    const input = this._input;
    const top = this._scrollable.calcTop(rect.top);
    input.style.top = `${(top - style.getScrollBarSize()).toFixed()}px`; //position:relative だとずれるが、IEは position:relativeじゃないと最大値まで利用できない
    input.style.left = `${rect.left.toFixed()}px`;
    input.style.width = `${rect.width.toFixed()}px`;
    input.style.height = `${rect.height.toFixed()}px`;
  }
  get editMode(): boolean {
    return !this._input.readOnly;
  }
  set editMode(editMode: boolean) {
    this._input.readOnly = !editMode;
  }
  resetInputStatus(): void {
    const el = this._input;
    if (!el.classList.contains("grid-focus-control--stored-status")) {
      return;
    }
    const composition = el.classList.contains("composition");

    const attrs = el.attributes;
    const removeNames = [];
    for (let i = 0, n = attrs.length; i < n; i++) {
      const attr = attrs[i];
      if (IGNORE_STORE_ATTRS.indexOf(attr.name) >= 0) continue;
      if (!this._inputStatus?.hasOwnProperty(attr.nodeName)) {
        removeNames.push(attr.name);
      }
    }
    removeNames.forEach((removeName) => {
      el.removeAttribute(removeName);
    });
    for (const name in this._inputStatus) {
      el.setAttribute(name, this._inputStatus[name]);
    }
    if (composition) {
      el.classList.add("composition");
      el.style.font = this._grid.font || "16px sans-serif";
    } else {
      el.classList.remove("composition");
    }
    el.classList.remove("grid-focus-control--stored-status");
  }
  storeInputStatus(): void {
    const el = this._input;
    if (el.classList.contains("grid-focus-control--stored-status")) {
      return;
    }
    const inputStatus: FocusControl["_inputStatus"] = (this._inputStatus = {});
    const attrs = el.attributes;
    for (let i = 0, n = attrs.length; i < n; i++) {
      const attr = attrs[i];
      if (IGNORE_STORE_ATTRS.indexOf(attr.name) >= 0) continue;
      inputStatus[attr.name] = attr.value;
    }
    el.classList.add("grid-focus-control--stored-status");
  }
  setDefaultInputStatus(): void {
    // なぜかスクロールが少しずつずれていくことがあるのでここではセットしない。
    // this._input.style.font = this._grid.font || '16px sans-serif';
  }
  get input(): HTMLInputElement {
    return this._input;
  }
  dispose(): void {
    super.dispose();
    this._handler.dispose();
  }
}

/**
 * Selected area management
 */
class Selection extends EventTarget {
  private _grid: DrawGrid;
  private _sel: CellAddress;
  private _focus: CellAddress;
  private _start: CellAddress;
  private _end: CellAddress;
  private _isWrapped?: boolean;
  constructor(grid: DrawGrid) {
    super();
    this._grid = grid;

    this._sel = { col: 0, row: 0 };
    this._focus = { col: 0, row: 0 };

    this._start = { col: 0, row: 0 };
    this._end = { col: 0, row: 0 };
  }
  get range(): CellRange {
    const start = this._start;
    const end = this._end;
    const startCol = Math.min(start.col, end.col);
    const startRow = Math.min(start.row, end.row);
    const endCol = Math.max(start.col, end.col);
    const endRow = Math.max(start.row, end.row);
    return {
      start: {
        col: startCol,
        row: startRow,
      },
      end: {
        col: endCol,
        row: endRow,
      },
    };
  }
  set range(range) {
    this._callBeforeHooks();
    const startCol = Math.min(range.start.col, range.end.col);
    const startRow = Math.min(range.start.row, range.end.row);
    const endCol = Math.max(range.start.col, range.end.col);
    const endRow = Math.max(range.start.row, range.end.row);

    this._wrapFireSelectedEvent(() => {
      this._sel = {
        col: startCol,
        row: startRow,
      };
      this._focus = {
        col: startCol,
        row: startRow,
      };
      this._start = {
        col: startCol,
        row: startRow,
      };
      this._end = {
        col: endCol,
        row: endRow,
      };

      _updatedSelection.call(this._grid);
    });
  }
  get focus(): CellAddress {
    const { col, row } = this._focus;
    return { col, row };
  }
  get select(): CellAddress {
    const { col, row } = this._sel;
    return { col, row };
  }
  set select(cell: CellAddress) {
    this._callBeforeHooks();
    this._wrapFireSelectedEvent(() => {
      const { col = 0, row = 0 } = cell;
      this._setSelectCell(col, row);
      this._setFocusCell(col, row, true, true);

      _updatedSelection.call(this._grid);
    });
  }
  private _setSelectCell(col: number, row: number): void {
    this._wrapFireSelectedEvent(() => {
      this._sel = { col, row };
      this._start = { col, row };
    });
  }
  _setFocusCell(
    col: number,
    row: number,
    keepSelect: boolean,
    ignoreBeforeHook?: boolean
  ): void {
    if (!ignoreBeforeHook) this._callBeforeHooks();
    this._wrapFireSelectedEvent(() => {
      if (!keepSelect) {
        this._setSelectCell(col, row);
      }
      this._focus = { col, row };
      this._end = { col, row };
    });
  }
  private _wrapFireSelectedEvent(callback: AnyFunction): void {
    if (this._isWrapped) {
      callback();
    } else {
      this._isWrapped = true;
      try {
        const before: BeforeSelectedCellEvent = {
          col: this._sel.col,
          row: this._sel.row,
          selected: false,
          after: null as never,
        };
        callback();
        const after: AfterSelectedCellEvent = {
          col: this._sel.col,
          row: this._sel.row,
          selected: true,
          before: {
            col: before.col,
            row: before.row,
          },
        };
        before.after = {
          col: after.col,
          row: after.row,
        };
        this.fireListeners(DG_EVENT_TYPE.SELECTED_CELL, before);
        this.fireListeners(DG_EVENT_TYPE.SELECTED_CELL, after);
      } finally {
        this._isWrapped = false;
      }
    }
  }
  _updateGridRange(): boolean {
    const { rowCount, colCount } = this._grid;
    const points = [this._sel, this._focus, this._start, this._end];
    let needChange = false;
    for (let i = 0; i < points.length; i++) {
      if (colCount <= points[i].col || rowCount <= points[i].row) {
        needChange = true;
        break;
      }
    }
    if (!needChange) {
      return false;
    }
    this._wrapFireSelectedEvent(() => {
      points.forEach((p) => {
        p.col = Math.min(colCount - 1, p.col);
        p.row = Math.min(rowCount - 1, p.row);
      });
    });
    return true;
  }
  private _callBeforeHooks() {
    this.fireListeners("before_hook");
  }
}

/** @private */
type DrawLayerFunction = (ctx: CanvasRenderingContext2D) => void;
/**
 * This class manages the drawing process for each layer
 */
/** @private */
class DrawLayers {
  private _layers: { [level: number]: DrawLayer };
  constructor() {
    this._layers = {};
  }
  addDraw(level: number, fn: DrawLayerFunction): void {
    const l =
      this._layers[level] || (this._layers[level] = new DrawLayer(level));
    l.addDraw(fn);
  }
  draw(ctx: CanvasRenderingContext2D): void {
    const list = [];
    for (const k in this._layers) {
      list.push(this._layers[k]);
    }
    list.sort((a, b) => a.level - b.level);
    list.forEach((l) => l.draw(ctx));
  }
}
/** @private */
class DrawLayer {
  private _level: number;
  private _list: DrawLayerFunction[];
  constructor(level: number) {
    this._level = level;
    this._list = [];
  }
  get level(): number {
    return this._level;
  }
  addDraw(fn: DrawLayerFunction): void {
    this._list.push(fn);
  }
  draw(ctx: CanvasRenderingContext2D): void {
    this._list.forEach((fn) => {
      ctx.save();
      try {
        fn(ctx);
      } finally {
        ctx.restore();
      }
    });
  }
}
/**
 * Context of cell drawing
 * @private
 */
class DrawCellContext implements CellContext {
  private _col: number;
  private _row: number;
  private _mode: number;
  private _ctx: CanvasRenderingContext2D | null;
  private _rect: Rect | null;
  private _drawRect: Rect | null;
  private _drawing: boolean;
  private _selection: Selection;
  private _drawLayers: DrawLayers;
  private _childContexts: DrawCellContext[];
  private _cancel?: boolean;
  private _grid?: DrawGrid;
  private _onTerminate?: () => void;
  private _rectFilter: ((base: Rect) => Rect) | null = null;
  //  private _grid: any;
  //  private _onTerminate: any;
  /**
   * constructor
   * @param {number} col index of column
   * @param {number} row index of row
   * @param {CanvasRenderingContext2D} ctx context
   * @param {Rect} rect rect of cell area
   * @param {Rect} drawRect rect of drawing area
   * @param {boolean} drawing `true` if drawing is in progress
   * @param {object} selection the selection
   * @param {Array} drawLayers array of draw layers
   * @private
   */
  constructor(
    col: number,
    row: number,
    ctx: CanvasRenderingContext2D,
    rect: Rect | null,
    drawRect: Rect | null,
    drawing: boolean,
    selection: Selection,
    drawLayers: DrawLayers
  ) {
    this._col = col;
    this._row = row;
    this._mode = 0;
    this._ctx = ctx;
    this._rect = rect;
    this._drawRect = drawRect;
    this._drawing = drawing;
    this._selection = selection;
    this._drawLayers = drawLayers;
    this._childContexts = [];
  }
  get drawing(): boolean {
    if (this._mode === 0) {
      return this._drawing;
    } else {
      return true;
    }
  }
  get row(): number {
    return this._row;
  }
  get col(): number {
    return this._col;
  }
  cancel(): void {
    this._cancel = true;
    this._childContexts.forEach((ctx) => {
      ctx.cancel();
    });
  }
  /**
   * select status.
   * @return {object} select status
   */
  getSelection(): { select: CellAddress; range: CellRange } {
    return {
      select: this._selection.select,
      range: this._selection.range,
    };
  }
  /**
   * Canvas context.
   * @return {CanvasRenderingContext2D} Canvas context.
   */
  getContext(): CanvasRenderingContext2D {
    if (this._mode === 0) {
      return this._ctx!;
    } else {
      return _getInitContext.call(this._grid!);
    }
  }
  /**
   * Rectangle of cell.
   * @return {Rect} rect Rectangle of cell.
   */
  getRect(): Rect {
    const rectFilter = this._rectFilter;
    return rectFilter
      ? rectFilter(this._getRectInternal())
      : this._getRectInternal();
  }
  setRectFilter(rectFilter: (base: Rect) => Rect): void {
    this._rectFilter = rectFilter;
  }
  /**
   * Rectangle of Drawing range.
   * @return {Rect} Rectangle of Drawing range.
   */
  getDrawRect(): Rect | null {
    if (this._cancel) {
      return null;
    }
    if (this._mode === 0) {
      return this._drawRect;
    } else {
      if (this._isOutOfRange()) {
        return null;
      }

      const absoluteRect = this._grid!.getCellRect(this._col, this._row);
      return this._toRelativeDrawRect(absoluteRect);
    }
  }
  private _isOutOfRange(): boolean {
    const { colCount, rowCount } = this._grid!;
    return colCount <= this._col || rowCount <= this._row;
  }
  /**
   * get Context of current state
   * @return {DrawCellContext} current DrawCellContext.
   */
  toCurrentContext(): DrawCellContext {
    if (this._mode === 0) {
      return this;
    } else {
      const absoluteRect = this._grid!.getCellRect(this._col, this._row);
      const rect = _toRelativeRect(this._grid!, absoluteRect);
      const drawRect = this._isOutOfRange()
        ? null
        : this._toRelativeDrawRect(absoluteRect);
      const context = new DrawCellContext(
        this._col,
        this._row,
        this.getContext(),
        rect,
        drawRect,
        this.drawing,
        this._selection,
        this._drawLayers
      );
      // toCurrentContext は自分の toCurrentContextを呼ばせる
      context.toCurrentContext = this.toCurrentContext.bind(this);
      this._childContexts.push(context);
      if (this._cancel) {
        context.cancel();
      }
      context._rectFilter = this._rectFilter;
      return context;
    }
  }
  addLayerDraw(level: number, fn: DrawLayerFunction): void {
    this._drawLayers.addDraw(level, fn);
  }
  private _toRelativeDrawRect(absoluteRect: Rect): Rect | null {
    const visibleRect = _getVisibleRect(this._grid!);
    let rect = absoluteRect.copy();
    if (!rect.intersection(visibleRect)) {
      return null;
    }

    const grid = this._grid!;

    const isFrozenCell = grid.isFrozenCell(this._col, this._row);
    if (grid.frozenColCount >= 0 && (!isFrozenCell || !isFrozenCell.col)) {
      const fRect = grid.getCellRect(grid.frozenColCount - 1, this._row);
      rect = Rect.bounds(
        Math.max(rect.left, fRect.right),
        rect.top,
        rect.right,
        rect.bottom
      );
    }
    if (grid.frozenRowCount >= 0 && (!isFrozenCell || !isFrozenCell.row)) {
      const fRect = grid.getCellRect(this._col, grid.frozenRowCount - 1);
      rect = Rect.bounds(
        rect.left,
        Math.max(rect.top, fRect.bottom),
        rect.right,
        rect.bottom
      );
    }

    if (!rect.intersection(visibleRect)) {
      return null;
    }
    rect.offsetLeft(-visibleRect.left);
    rect.offsetTop(-visibleRect.top);

    return rect;
  }
  _delayMode(grid: DrawGrid, onTerminate: () => void): void {
    this._mode = 1;
    this._ctx = null;
    this._rect = null;
    this._drawRect = null;
    this._grid = grid;
    this._onTerminate = onTerminate;
  }
  /**
   * terminate
   * @return {void}
   */
  terminate(): void {
    if (this._mode !== 0) {
      this._onTerminate?.();
    }
  }
  private _getRectInternal(): Rect {
    if (this._mode === 0) {
      return this._rect!;
    } else {
      if (this._rect) {
        return this._rect;
      }
      return this._grid!.getCellRelativeRect(this._col, this._row);
    }
  }
}
/** @protected */
interface DrawGridProtected {
  element: HTMLElement;
  scrollable: Scrollable;
  handler: EventHandler;
  selection: Selection;
  focusControl: FocusControl;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  rowCount: number;
  colCount: number;
  frozenColCount: number;
  frozenRowCount: number;
  defaultRowHeight: number;
  defaultColWidth: string | number;
  font?: string;
  underlayBackgroundColor?: string;
  keyboardOptions?: DrawGridKeyboardOptions;
  disableColumnResize?: boolean;
  trimOnPaste: boolean;

  rowHeightsMap: NumberMap<number>;
  colWidthsMap: NumberMap<string | number>;
  colWidthsLimit: {
    [col: number]: {
      max?: string | number;
      min?: string | number;
    };
  };
  calcWidthContext: {
    _: DrawGridProtected;
    full: number;
    em: number;
  };

  columnResizer: ColumnResizer;
  cellSelector: CellSelector;

  drawCells: { [row: number]: { [col: number]: DrawCellContext } };
  cellTextOverflows: { [at: string]: string };
  focusedGrid: boolean;

  config:
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [name: string]: any;
      }
    | undefined;
  scroll: {
    left: number;
    top: number;
  };
  disposables?: { dispose(): void }[] | null;
}

export { DrawGridProtected };

export interface DrawGridConstructorOptions {
  rowCount?: number;
  colCount?: number;
  frozenColCount?: number;
  frozenRowCount?: number;
  /**
   * Default grid row height. default 40
   */
  defaultRowHeight?: number;
  /**
   * Default grid col width. default 80
   */
  defaultColWidth?: string | number;
  font?: string;
  underlayBackgroundColor?: string;
  keyboardOptions?: DrawGridKeyboardOptions;
  /**
   * Canvas parent element
   */
  parentElement?: HTMLElement | null;
  /**
   * Disable column resizing
   */
  disableColumnResize?: boolean;
  /**
   * If set to true, trim the pasted text on pasting.
   */
  trimOnPaste?: boolean;
}
/** @private */
const protectedKey = _;
/**
 * DrawGrid
 * @classdesc cheetahGrid.core.DrawGrid
 * @memberof cheetahGrid.core
 */
export abstract class DrawGrid extends EventTarget implements DrawGridAPI {
  protected [protectedKey]: DrawGridProtected;
  static get EVENT_TYPE(): typeof DG_EVENT_TYPE {
    return DG_EVENT_TYPE;
  }
  constructor(options: DrawGridConstructorOptions = {}) {
    super();
    const {
      rowCount = 10,
      colCount = 10,
      frozenColCount = 0,
      frozenRowCount = 0,
      defaultRowHeight = 40,
      defaultColWidth = 80,
      font,
      underlayBackgroundColor,
      keyboardOptions,
      parentElement,
      disableColumnResize,
      trimOnPaste,
    } = options;
    const protectedSpace = (this[_] = {} as DrawGridProtected);
    style.initDocument();
    protectedSpace.element = createRootElement();
    protectedSpace.scrollable = new Scrollable();
    protectedSpace.handler = new EventHandler();
    protectedSpace.selection = new Selection(this);
    protectedSpace.focusControl = new FocusControl(
      this,
      protectedSpace.scrollable.getElement(),
      protectedSpace.scrollable,
      protectedSpace.selection
    );

    protectedSpace.canvas = hiDPI.transform(document.createElement("canvas"));
    protectedSpace.context = protectedSpace.canvas.getContext("2d", {
      alpha: false,
    })!;

    protectedSpace.rowCount = rowCount;
    protectedSpace.colCount = colCount;
    protectedSpace.frozenColCount = frozenColCount;
    protectedSpace.frozenRowCount = frozenRowCount;

    protectedSpace.defaultRowHeight = defaultRowHeight;
    protectedSpace.defaultColWidth = defaultColWidth;

    protectedSpace.font = font;
    protectedSpace.underlayBackgroundColor = underlayBackgroundColor;

    protectedSpace.keyboardOptions = keyboardOptions;
    protectedSpace.disableColumnResize = disableColumnResize;
    protectedSpace.trimOnPaste = trimOnPaste ?? false;

    /////
    protectedSpace.rowHeightsMap = new NumberMap();
    protectedSpace.colWidthsMap = new NumberMap();
    protectedSpace.colWidthsLimit = {};
    protectedSpace.calcWidthContext = {
      _: protectedSpace,
      get full(): number {
        return this._.canvas.width;
      },
      get em(): number {
        return getFontSize(this._.context, this._.font).width;
      },
    };

    protectedSpace.columnResizer = new ColumnResizer(this);
    protectedSpace.cellSelector = new CellSelector(this);

    protectedSpace.drawCells = {};
    protectedSpace.cellTextOverflows = {};
    protectedSpace.focusedGrid = false;

    protectedSpace.element.appendChild(protectedSpace.canvas);
    protectedSpace.element.appendChild(protectedSpace.scrollable.getElement());
    protectedSpace.scroll = {
      left: 0,
      top: 0,
    };
    this.updateScroll();
    if (parentElement) {
      parentElement.appendChild(protectedSpace.element);
      this.updateSize();
    } else {
      this.updateSize();
    }
    _bindEvents.call(this);
    this.bindEventsInternal();
  }
  /**
   * Get root element.
   * @returns {HTMLElement} root element
   */
  getElement(): HTMLElement {
    return this[_].element;
  }
  /**
   * Get canvas element.
   */
  get canvas(): HTMLCanvasElement {
    return this[_].canvas;
  }
  /**
   * Focus the grid.
   * @return {void}
   */
  focus(): void {
    const { col, row } = this[_].selection.select;
    this.focusCell(col, row);
  }
  hasFocusGrid(): boolean {
    return this[_].focusedGrid;
  }
  /**
   * Get the selection instance.
   */
  get selection(): Selection {
    return this[_].selection;
  }
  /**
   * Get the number of rows.
   */
  get rowCount(): number {
    return this[_].rowCount;
  }
  /**
   * Set the number of rows.
   */
  set rowCount(rowCount: number) {
    this[_].rowCount = rowCount;
    this.updateScroll();
    if (this[_].selection._updateGridRange()) {
      const { col, row } = this[_].selection.focus;
      this.makeVisibleCell(col, row);
      this.setFocusCursor(col, row);
    }
  }
  /**
   * Get the number of columns.
   */
  get colCount(): number {
    return this[_].colCount;
  }
  /**
   * Set the number of columns.
   */
  set colCount(colCount: number) {
    this[_].colCount = colCount;
    this.updateScroll();
    if (this[_].selection._updateGridRange()) {
      const { col, row } = this[_].selection.focus;
      this.makeVisibleCell(col, row);
      this.setFocusCursor(col, row);
    }
  }
  /**
   * Get the number of frozen columns.
   */
  get frozenColCount(): number {
    return this[_].frozenColCount;
  }
  /**
   * Set the number of frozen columns.
   */
  set frozenColCount(frozenColCount: number) {
    this[_].frozenColCount = frozenColCount;
  }
  /**
   * Get the number of frozen rows.
   */
  get frozenRowCount(): number {
    return this[_].frozenRowCount;
  }
  /**
   * Set the number of frozen rows.
   */
  set frozenRowCount(frozenRowCount: number) {
    this[_].frozenRowCount = frozenRowCount;
  }
  /**
   * Get the default row height.
   *
   */
  get defaultRowHeight(): number {
    return this[_].defaultRowHeight;
  }
  /**
   * Set the default row height.
   */
  set defaultRowHeight(defaultRowHeight: number) {
    this[_].defaultRowHeight = defaultRowHeight;
  }
  /**
   * Get the default column width.
   */
  get defaultColWidth(): string | number {
    return this[_].defaultColWidth;
  }
  /**
   * Set the default column width.
   */
  set defaultColWidth(defaultColWidth: string | number) {
    this[_].defaultColWidth = defaultColWidth;
  }
  /**
   * Get the font definition as a string.
   */
  get font(): string | undefined {
    return this[_].font;
  }
  /**
   * Set the font definition with the given string.
   */
  set font(font: string | undefined) {
    this[_].font = font;
  }
  /**
   * Get the background color of the underlay.
   */
  get underlayBackgroundColor(): string | undefined {
    return this[_].underlayBackgroundColor;
  }
  /**
   * Set the background color of the underlay.
   */
  set underlayBackgroundColor(underlayBackgroundColor: string | undefined) {
    this[_].underlayBackgroundColor = underlayBackgroundColor;
  }
  /**
   * If set to true, trim the pasted text on pasting.
   */
  get trimOnPaste(): boolean {
    return this[_].trimOnPaste;
  }
  set trimOnPaste(trimOnPaste: boolean) {
    this[_].trimOnPaste = trimOnPaste;
  }
  get keyboardOptions(): DrawGridKeyboardOptions | null {
    return this[_].keyboardOptions ?? null;
  }
  set keyboardOptions(keyboardOptions: DrawGridKeyboardOptions | null) {
    this[_].keyboardOptions = keyboardOptions ?? undefined;
  }
  configure(name: "fadeinWhenCallbackInPromise", value?: boolean): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configure(name: string, value?: any): any {
    const cfg = this[_].config || (this[_].config = {});
    if (value != null) {
      cfg[name] = value;
    }
    return cfg[name];
  }
  /**
   * Apply the changed size.
   * @return {void}
   */
  updateSize(): void {
    //スタイルをクリアしてサイズ値を取得
    const { canvas } = this[_];
    canvas.style.width = "";
    canvas.style.height = "";
    const width = Math.floor(
      canvas.offsetWidth ||
        canvas.parentElement!.offsetWidth -
          style.getScrollBarSize() /*for legacy*/
    );
    const height = Math.floor(
      canvas.offsetHeight ||
        canvas.parentElement!.offsetHeight -
          style.getScrollBarSize() /*for legacy*/
    );

    canvas.width = width;
    canvas.height = height;

    //整数で一致させるためstyleをセットして返す
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const { focus } = this[_].selection;
    this[_].focusControl.setFocusRect(this.getCellRect(focus.col, focus.row));
  }
  /**
   * Apply the changed scroll size.
   * @return {boolean} `true` if there was a change in the scroll size
   */
  updateScroll(): boolean {
    const { scrollable } = this[_];
    const newHeight = _getScrollHeight.call(this);
    const newWidth = _getScrollWidth(this);
    if (
      newHeight === scrollable.scrollHeight &&
      newWidth === scrollable.scrollWidth
    ) {
      return false;
    }
    scrollable.setScrollSize(newWidth, newHeight);
    this[_].scroll = {
      left: scrollable.scrollLeft,
      top: scrollable.scrollTop,
    };

    const { focus } = this[_].selection;
    this[_].focusControl.setFocusRect(this.getCellRect(focus.col, focus.row));
    return true;
  }
  /**
   * Get the row height of the given the row index.
   * @param  {number} row The row index
   * @return {number} The row height
   */
  getRowHeight(row: number): number {
    return _getRowHeight.call(this, row);
  }
  /**
   * Set the row height of the given the row index.
   * @param  {number} row The row index
   * @param  {number} height The row height
   * @return {void}
   */
  setRowHeight(row: number, height: number | null): void {
    _setRowHeight(this, row, height);
  }
  /**
   * Get the column width of the given the column index.
   * @param  {number} col The column index
   * @return {number} The column width
   */
  getColWidth(col: number): number {
    return _getColWidth(this, col);
  }
  /**
   * Set the column width of the given the column index.
   * @param  {number} col The column index
   * @param  {number} width The column width
   * @return {void}
   */
  setColWidth(col: number, width: string | number | null): void {
    _setColWidth(this, col, width);
  }
  /**
   * Get the column max width of the given the column index.
   * @param  {number} col The column index
   * @return {number} The column max width
   */
  getMaxColWidth(col: number): string | number | undefined {
    const obj = this[_].colWidthsLimit[col];
    return (obj && obj.max) || undefined;
  }
  /**
   * Set the column max width of the given the column index.
   * @param  {number} col The column index
   * @param  {number} maxwidth The column max width
   * @return {void}
   */
  setMaxColWidth(col: number, maxwidth: string | number | null): void {
    const obj =
      this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
    if (maxwidth != null) {
      obj.max = maxwidth;
    } else {
      delete obj.max;
    }
  }
  /**
   * Get the column min width of the given the column index.
   * @param  {number} col The column index
   * @return {number} The column min width
   */
  getMinColWidth(col: number): string | number | undefined {
    const obj = this[_].colWidthsLimit[col];
    return (obj && obj.min) || undefined;
  }
  /**
   * Set the column min width of the given the column index.
   * @param  {number} col The column index
   * @param  {number} minwidth The column min width
   * @return {void}
   */
  setMinColWidth(col: number, minwidth: string | number | null): void {
    const obj =
      this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
    if (minwidth != null) {
      obj.min = minwidth;
    } else {
      delete obj.min;
    }
  }
  /**
   * Get the rect of the cell.
   * @param {number} col index of column, of the cell
   * @param {number} row index of row, of the cell
   * @returns {Rect} the rect of the cell.
   */
  getCellRect(col: number, row: number): Rect {
    const isFrozenCell = this.isFrozenCell(col, row);

    let absoluteLeft = _getColsWidth(this, 0, col - 1);
    const width = _getColWidth(this, col);
    if (isFrozenCell && isFrozenCell.col) {
      absoluteLeft += this[_].scroll.left;
    }

    let absoluteTop = _getRowsHeight.call(this, 0, row - 1);
    const height = _getRowHeight.call(this, row);
    if (isFrozenCell && isFrozenCell.row) {
      absoluteTop += this[_].scroll.top;
    }
    return new Rect(absoluteLeft, absoluteTop, width, height);
  }
  /**
   * Get the relative rectangle of the cell.
   * @param {number} col index of column, of the cell
   * @param {number} row index of row, of the cell
   * @returns {Rect} the rect of the cell.
   */
  getCellRelativeRect(col: number, row: number): Rect {
    return _toRelativeRect(this, this.getCellRect(col, row));
  }
  /**
   * Get the rectangle of the cells area.
   * @param {number} startCol index of the starting column, of the cell
   * @param {number} startRow index of the starting row, of the cell
   * @param {number} endCol index of the ending column, of the cell
   * @param {number} endRow index of the ending row, of the cell
   * @returns {Rect} the rect of the cells.
   */
  getCellsRect(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number
  ): Rect {
    const isFrozenStartCell = this.isFrozenCell(startCol, startRow);
    const isFrozenEndCell = this.isFrozenCell(endCol, endRow);

    let absoluteLeft = _getColsWidth(this, 0, startCol - 1);
    let width = _getColsWidth(this, startCol, endCol);
    if (isFrozenStartCell && isFrozenStartCell.col) {
      const scrollLeft = this[_].scroll.left;
      absoluteLeft += scrollLeft;
      if (!isFrozenEndCell || !isFrozenEndCell.col) {
        width -= scrollLeft;
        width = Math.max(
          width,
          _getColsWidth(this, startCol, this.frozenColCount - 1)
        );
      }
    }
    let absoluteTop = _getRowsHeight.call(this, 0, startRow - 1);
    let height = _getRowsHeight.call(this, startRow, endRow);
    if (isFrozenStartCell && isFrozenStartCell.row) {
      const scrollTop = this[_].scroll.top;
      absoluteTop += scrollTop;
      if (!isFrozenEndCell || !isFrozenEndCell.row) {
        height -= scrollTop;
        height = Math.max(
          height,
          _getColsWidth(this, startRow, this.frozenRowCount - 1)
        );
      }
    }
    return new Rect(absoluteLeft, absoluteTop, width, height);
  }
  getCellRangeRect(range: CellRange): Rect {
    return this.getCellsRect(
      range.start.col,
      range.start.row,
      range.end.col,
      range.end.row
    );
  }
  isFrozenCell(
    col: number,
    row: number
  ): {
    row: boolean;
    col: boolean;
  } | null {
    const { frozenRowCount, frozenColCount } = this[_];
    const isFrozenRow = frozenRowCount > 0 && row < frozenRowCount;
    const isFrozenCol = frozenColCount > 0 && col < frozenColCount;
    if (isFrozenRow || isFrozenCol) {
      return {
        row: isFrozenRow,
        col: isFrozenCol,
      };
    } else {
      return null;
    }
  }
  getRowAt(absoluteY: number): number {
    const frozen = _getTargetFrozenRowAt(this, absoluteY);
    if (frozen) {
      return frozen.row;
    }
    const row = _getTargetRowAt.call(this, absoluteY);
    return row ? row.row : -1;
  }
  getColAt(absoluteX: number): number {
    const frozen = _getTargetFrozenColAt(this, absoluteX);
    if (frozen) {
      return frozen.col;
    }
    const col = _getTargetColAt(this, absoluteX);
    return col ? col.col : -1;
  }
  getCellAt(absoluteX: number, absoluteY: number): CellAddress {
    return {
      row: this.getRowAt(absoluteY),
      col: this.getColAt(absoluteX),
    };
  }
  /**
   * Scroll to where cell is visible.
   * @param  {number} col The column index.
   * @param  {number} row The row index
   * @return {void}
   */
  makeVisibleCell(col: number, row: number): void {
    const isFrozenCell = this.isFrozenCell(col, row);
    if (isFrozenCell && isFrozenCell.col && isFrozenCell.row) {
      return;
    }
    const rect = this.getCellRect(col, row);
    const visibleRect = _getScrollableVisibleRect(this);
    if (visibleRect.contains(rect)) {
      return;
    }
    const { scrollable } = this[_];
    if (!isFrozenCell || !isFrozenCell.col) {
      if (rect.left < visibleRect.left) {
        scrollable.scrollLeft -= visibleRect.left - rect.left;
      } else if (visibleRect.right < rect.right) {
        scrollable.scrollLeft -= visibleRect.right - rect.right;
      }
    }
    if (!isFrozenCell || !isFrozenCell.row) {
      if (rect.top < visibleRect.top) {
        scrollable.scrollTop -= visibleRect.top - rect.top;
      } else if (visibleRect.bottom < rect.bottom) {
        scrollable.scrollTop -= visibleRect.bottom - rect.bottom;
      }
    }
  }
  /**
   * Moves the focus cursor to the given cell.
   * @param  {number} col The column index.
   * @param  {number} row The row index
   * @return {void}
   */
  setFocusCursor(col: number, row: number): void {
    const { focusControl } = this[_];
    const oldEditMode = focusControl.editMode;

    focusControl.setFocusRect(this.getCellRect(col, row));

    _updatedSelection.call(this);

    if (oldEditMode && !focusControl.editMode) {
      focusControl.resetInputStatus();
    }
  }
  /**
   * Focus the cell.
   * @param  {number} col The column index.
   * @param  {number} row The row index
   * @return {void}
   */
  focusCell(col: number, row: number): void {
    this.setFocusCursor(col, row);

    // Failure occurs in IE if focus is not last
    this[_].focusControl.focus();
  }
  /**
   * Redraws the range of the given cell.
   * @param  {number} col The column index of cell.
   * @param  {number} row The row index of cell.
   * @return {void}
   */
  invalidateCell(col: number, row: number): void {
    this.invalidateGridRect(col, row);
  }
  /**
   * Redraws the range of the given cells.
   * @param {number} startCol index of the starting column, of the cell
   * @param {number} startRow index of the starting row, of the cell
   * @param {number} endCol index of the ending column, of the cell
   * @param {number} endRow index of the ending row, of the cell
   * @return {void}
   */
  invalidateGridRect(
    startCol: number,
    startRow: number,
    endCol = startCol,
    endRow = startRow
  ): void {
    const offset = this.getOffsetInvalidateCells();
    if (offset > 0) {
      startCol -= offset;
      startRow -= offset;
      endCol += offset;
      endRow += offset;
    }

    const visibleRect = _getVisibleRect(this);
    const cellsRect = this.getCellsRect(startCol, startRow, endCol, endRow);
    const invalidateTarget = visibleRect.intersection(cellsRect);
    if (invalidateTarget) {
      const { frozenColCount, frozenRowCount } = this[_];
      if (frozenColCount > 0 && endCol >= frozenColCount) {
        const frozenRect = _getFrozenColsRect(this)!;
        if (frozenRect.intersection(invalidateTarget)) {
          invalidateTarget.left = Math.min(
            frozenRect.right - 1,
            invalidateTarget.left
          );
        }
      }

      if (frozenRowCount > 0 && endRow >= frozenRowCount) {
        const frozenRect = _getFrozenRowsRect(this)!;
        if (frozenRect.intersection(invalidateTarget)) {
          invalidateTarget.top = Math.min(
            frozenRect.bottom - 1,
            invalidateTarget.top
          );
        }
      }

      _invalidateRect(this, invalidateTarget);
    }
  }
  invalidateCellRange(range: CellRange): void {
    this.invalidateGridRect(
      range.start.col,
      range.start.row,
      range.end.col,
      range.end.row
    );
  }
  /**
   * Redraws the whole grid.
   * @return {void}
   */
  invalidate(): void {
    const visibleRect = _getVisibleRect(this);
    _invalidateRect(this, visibleRect);
  }
  /**
   * Get the number of scrollable rows fully visible in the grid. visibleRowCount does not include the frozen rows counted by the frozenRowCount property. It does not include any partially visible rows on the bottom of the grid.
   * @returns {number}
   */
  get visibleRowCount(): number {
    const { frozenRowCount } = this;
    const visibleRect = _getVisibleRect(this);
    const visibleTop =
      frozenRowCount > 0
        ? visibleRect.top + _getRowsHeight.call(this, 0, frozenRowCount - 1)
        : visibleRect.top;

    const initRow = _getTargetRowAt.call(this, visibleTop);
    if (!initRow) {
      return 0;
    }
    const startRow = Math.max(
      initRow.top >= visibleTop ? initRow.row : initRow.row + 1,
      frozenRowCount
    );
    let absoluteTop = _getRowsHeight.call(this, 0, startRow - 1);
    let count = 0;
    const { rowCount } = this;
    for (let row = startRow; row < rowCount; row++) {
      const height = _getRowHeight.call(this, row);
      const bottom = absoluteTop + height;
      if (visibleRect.bottom < bottom) {
        break;
      }
      count++;
      absoluteTop = bottom;
    }
    return count;
  }
  /**
   * Get the number of scrollable columns fully visible in the grid. visibleColCount does not include the frozen columns counted by the frozenColCount property. It does not include any partially visible columns on the right of the grid.
   * @returns {number}
   */
  get visibleColCount(): number {
    const { frozenColCount } = this;
    const visibleRect = _getVisibleRect(this);
    const visibleLeft =
      frozenColCount > 0
        ? visibleRect.left + _getColsWidth(this, 0, frozenColCount - 1)
        : visibleRect.left;

    const initCol = _getTargetColAt(this, visibleLeft);
    if (!initCol) {
      return 0;
    }
    const startCol = Math.max(
      initCol.left >= visibleLeft ? initCol.col : initCol.col + 1,
      frozenColCount
    );
    let absoluteLeft = _getColsWidth(this, 0, startCol - 1);
    let count = 0;
    const { colCount } = this;
    for (let col = startCol; col < colCount; col++) {
      const width = _getColWidth(this, col);
      const right = absoluteLeft + width;
      if (visibleRect.right < right) {
        break;
      }
      count++;
      absoluteLeft = right;
    }
    return count;
  }
  /**
   * Get the index of the first row in the scrollable region that is visible.
   * @returns {number}
   */
  get topRow(): number {
    const { frozenRowCount } = this;
    const visibleRect = _getVisibleRect(this);
    const visibleTop =
      frozenRowCount > 0
        ? visibleRect.top + _getRowsHeight.call(this, 0, frozenRowCount - 1)
        : visibleRect.top;

    const initRow = _getTargetRowAt.call(this, visibleTop);
    if (!initRow) {
      return 0;
    }
    return Math.max(
      initRow.top >= visibleTop ? initRow.row : initRow.row + 1,
      frozenRowCount
    );
  }
  /**
   * Get the index of the first column in the scrollable region that is visible.
   * @returns {number}
   */
  get leftCol(): number {
    const { frozenColCount } = this;
    const visibleRect = _getVisibleRect(this);
    const visibleLeft =
      frozenColCount > 0
        ? visibleRect.left + _getColsWidth(this, 0, frozenColCount - 1)
        : visibleRect.left;

    const initCol = _getTargetColAt(this, visibleLeft);
    if (!initCol) {
      return 0;
    }
    return Math.max(
      initCol.left >= visibleLeft ? initCol.col : initCol.col + 1,
      frozenColCount
    );
  }
  /**
   * gets or sets the number of pixels that an element's content is scrolled vertically
   */
  get scrollTop(): number {
    return this[_].scrollable.scrollTop;
  }
  set scrollTop(scrollTop: number) {
    this[_].scrollable.scrollTop = scrollTop;
  }
  /**
   * gets or sets the number of pixels that an element's content is scrolled from its left edge
   */
  get scrollLeft(): number {
    return this[_].scrollable.scrollLeft;
  }
  set scrollLeft(scrollLeft: number) {
    this[_].scrollable.scrollLeft = scrollLeft;
  }
  /**
   * Get the value of cell with the copy action.
   * <p>
   * Please implement
   * </p>
   *
   * @protected
   * @param col Column index of cell.
   * @param row Row index of cell.
   * @param range Copy range.
   * @return {string} the value of cell
   */
  protected getCopyCellValue(
    _col: number,
    _row: number,
    _range: CellRange
  ): unknown {
    //Please implement get cell value!!
    return undefined;
  }
  /**
   * Draw a cell
   * <p>
   * Please implement cell drawing.
   * </p>
   *
   * @protected
   * @param  {number} col Column index of cell.
   * @param  {number} row Row index of cell.
   * @param  {DrawCellContext} context context of cell drawing.
   * @return {void}
   */
  protected abstract onDrawCell(
    col: number,
    row: number,
    context: CellContext
  ): Promise<void> | void;
  /**
   * Get the overflowed text in the cell rectangle, from the given cell.
   * @param  {number} col The column index.
   * @param  {number} row The row index
   * @return {string | null} The text overflowing the cell rect.
   */
  getCellOverflowText(col: number, row: number): string | null {
    const key = `${col}:${row}`;
    return this[_].cellTextOverflows[key] || null;
  }
  /**
   * Set the overflowed text in the cell rectangle, to the given cell.
   * @param  {number} col The column index.
   * @param  {number} row The row index
   * @param  {string} overflowText The overflowed text in the cell rectangle.
   * @return {void}
   */
  setCellOverflowText(
    col: number,
    row: number,
    overflowText: string | false
  ): void {
    const key = `${col}:${row}`;
    if (overflowText) {
      this[_].cellTextOverflows[key] =
        typeof overflowText === "string" ? overflowText.trim() : overflowText;
    } else {
      delete this[_].cellTextOverflows[key];
    }
  }
  addDisposable(disposable: { dispose(): void }): void {
    if (
      !disposable ||
      !disposable.dispose ||
      typeof disposable.dispose !== "function"
    ) {
      throw new Error("not disposable!");
    }
    const disposables = (this[_].disposables = this[_].disposables || []);
    disposables.push(disposable);
  }
  /**
   * Dispose the grid instance.
   * @returns {void}
   */
  dispose(): void {
    super.dispose();
    const protectedSpace = this[_];
    protectedSpace.handler.dispose();
    protectedSpace.scrollable.dispose();
    protectedSpace.focusControl.dispose();
    protectedSpace.columnResizer.dispose();
    protectedSpace.cellSelector.dispose();
    if (protectedSpace.disposables) {
      protectedSpace.disposables.forEach((disposable) => disposable.dispose());
      protectedSpace.disposables = null;
    }

    const { parentElement } = protectedSpace.element;
    if (parentElement) {
      parentElement.removeChild(protectedSpace.element);
    }
  }
  getAttachCellsArea(range: CellRange): {
    element: HTMLElement;
    rect: Rect;
  } {
    return {
      element: this.getElement(),
      rect: _toRelativeRect(this, this.getCellRangeRect(range)),
    };
  }
  onKeyDownMove(evt: KeyboardEvent): void {
    _onKeyDownMove.call(this, evt);
  }
  protected bindEventsInternal(): void {
    //nop
  }
  protected getTargetRowAtInternal(
    _absoluteY: number
  ): { row: number; top: number } | void {
    //継承用 設定を無視して計算する場合継承して実装
  }
  protected getRowsHeightInternal(
    _startRow: number,
    _endRow: number
  ): number | void {
    //継承用 設定を無視して計算する場合継承して実装
  }
  protected getRowHeightInternal(_row: number): number | void {
    //継承用 設定を無視して計算する場合継承して実装
  }
  protected getScrollHeightInternal(_row?: number): number | void {
    //継承用 設定を無視して計算する場合継承して実装
  }
  protected getMoveLeftColByKeyDownInternal({ col }: CellAddress): number {
    return col - 1;
  }
  protected getMoveRightColByKeyDownInternal({ col }: CellAddress): number {
    return col + 1;
  }
  protected getMoveUpRowByKeyDownInternal({ row }: CellAddress): number {
    return row - 1;
  }
  protected getMoveDownRowByKeyDownInternal({ row }: CellAddress): number {
    return row + 1;
  }
  protected getOffsetInvalidateCells(): number {
    return 0;
  }
  protected getCopyRangeInternal(range: CellRange): CellRange {
    return range;
  }
  protected _getInitContext(): CanvasRenderingContext2D {
    const ctx = this[_].context;
    //初期化
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.lineWidth = 1;
    ctx.font = this.font || "16px sans-serif";
    return ctx;
  }
  fireListeners<TYPE extends keyof DrawGridEventHandlersEventMap>(
    type: TYPE,
    ...event: DrawGridEventHandlersEventMap[TYPE]
  ): DrawGridEventHandlersReturnMap[TYPE][] {
    return super.fireListeners(type, ...event);
  }
}
