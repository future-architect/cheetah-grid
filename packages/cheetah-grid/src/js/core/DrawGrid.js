'use strict';

const {
	isDef,
	browser,
	isDescendantElement,
	array,
	isPromise,
	event: {
		isTouchEvent,
		getMouseButtons,
		getKeyCode,
		cancel: cancelEvent,
	}
} = require('../internal/utils');

const EventTarget = require('./EventTarget');
const Rect = require('../internal/Rect');
const Scrollable = require('../internal/Scrollable');
const EventHandler = require('../internal/EventHandler');
const NumberMap = require('../internal/NumberMap');
const style = require('../internal/style');
const calc = require('../internal/calc');
const {getFontSize} = require('../internal/canvases');
const hiDPI = require('../internal/hiDPI');
//protected symbol
const {PROTECTED_SYMBOL: _} = require('../internal/symbolManager');

function createRootElement() {
	const element = document.createElement('div');
	element.classList.add('cheetah-grid');
	return element;
}

const KEY_END = 35;
const KEY_HOME = 36;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_ALPHA_C = 67;
const KEY_ALPHA_V = 86;

const EV_CLICK_CELL = 'click_cell';
const EV_DBLCLICK_CELL = 'dblclick_cell';
const EV_DBLTAP_CELL = 'dbltap_cell';
const EV_MOUSEDOWN_CELL = 'mousedown_cell';
const EV_MOUSEUP_CELL = 'mouseup_cell';
const EV_SELECTED_CELL = 'selected_cell';
const EV_KEYDOWN = 'keydown';
const EV_MOUSEMOVE_CELL = 'mousemove_cell';
const EV_MOUSEENTER_CELL = 'mouseenter_cell';
const EV_MOUSELEAVE_CELL = 'mouseleave_cell';
const EV_MOUSEOVER_CELL = 'mouseover_cell';
const EV_MOUSEOUT_CELL = 'mouseout_cell';
const EV_INPUT_CELL = 'input_cell';
const EV_PASTE_CELL = 'paste_cell';
const EV_EDITABLEINPUT_CELL = 'editableinput_cell';
const EV_MODIFY_STATUS_EDITABLEINPUT_CELL = 'modify_status_editableinput_cell';
const EV_RESIZE_COLUMN = 'resize_column';
const EV_SCROLL = 'scroll';
const EVENT_TYPE = {
	CLICK_CELL: EV_CLICK_CELL,
	DBLCLICK_CELL: EV_DBLCLICK_CELL,
	DBLTAP_CELL: EV_DBLTAP_CELL,
	MOUSEDOWN_CELL: EV_MOUSEDOWN_CELL,
	MOUSEUP_CELL: EV_MOUSEUP_CELL,
	SELECTED_CELL: EV_SELECTED_CELL,
	KEYDOWN: EV_KEYDOWN,
	MOUSEMOVE_CELL: EV_MOUSEMOVE_CELL,
	MOUSEENTER_CELL: EV_MOUSEENTER_CELL,
	MOUSELEAVE_CELL: EV_MOUSELEAVE_CELL,
	MOUSEOVER_CELL: EV_MOUSEOVER_CELL,
	MOUSEOUT_CELL: EV_MOUSEOUT_CELL,
	INPUT_CELL: EV_INPUT_CELL,
	PASTE_CELL: EV_PASTE_CELL,
	EDITABLEINPUT_CELL: EV_EDITABLEINPUT_CELL,
	MODIFY_STATUS_EDITABLEINPUT_CELL: EV_MODIFY_STATUS_EDITABLEINPUT_CELL,
	RESIZE_COLUMN: EV_RESIZE_COLUMN,
	SCROLL: EV_SCROLL,
};

//private methods
function _vibrate(e) {
	if (navigator.vibrate && isTouchEvent(e)) {
		navigator.vibrate(50);
	}
}
function _getTargetRowAt(grid, absoluteY) {
	const internal = grid.getTargetRowAtInternal(absoluteY);
	if (isDef(internal)) {
		return internal;
	}
	const findBefore = (startRow, startBottom) => {
		let bottom = startBottom;
		for (let row = startRow; row >= 0; row--) {
			const height = _getRowHeight(grid, row);
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
	const findAfter = (startRow, startBottom) => {
		let top = startBottom - _getRowHeight(grid, startRow);
		const {rowCount} = grid[_];
		for (let row = startRow; row < rowCount; row++) {
			const height = _getRowHeight(grid, row);
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
	const candRow = Math.min(Math.ceil(absoluteY / grid[_].defaultRowHeight), grid.rowCount - 1);
	const bottom = _getRowsHeight(grid, 0, candRow);
	if (absoluteY >= bottom) {
		return findAfter(candRow, bottom);
	} else {
		return findBefore(candRow, bottom);
	}
}
function _getTargetColAt(grid, absoluteX) {
	let left = 0;
	const {colCount} = grid[_];
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
function _getTargetFrozenRowAt(grid, absoluteY) {
	if (!grid[_].frozenRowCount) {
		return null;
	}
	let {top} = grid[_].scroll;
	const rowCount = grid[_].frozenRowCount;
	for (let row = 0; row < rowCount; row++) {
		const height = _getRowHeight(grid, row);
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
function _getTargetFrozenColAt(grid, absoluteX) {
	if (!grid[_].frozenColCount) {
		return null;
	}
	let {left} = grid[_].scroll;
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
function _getFrozenRowsRect(grid) {
	if (!grid[_].frozenRowCount) {
		return null;
	}
	const {top} = grid[_].scroll;
	let height = 0;
	const rowCount = grid[_].frozenRowCount;
	for (let row = 0; row < rowCount; row++) {
		height += _getRowHeight(grid, row);
	}
	return new Rect(
			grid[_].scroll.left,
			top,
			grid[_].canvas.width,
			height
	);
}
function _getFrozenColsRect(grid) {
	if (!grid[_].frozenColCount) {
		return null;
	}
	const {left} = grid[_].scroll;
	let width = 0;
	const colCount = grid[_].frozenColCount;
	for (let col = 0; col < colCount; col++) {
		width += _getColWidth(grid, col);
	}
	return new Rect(
			left,
			grid[_].scroll.top,
			width,
			grid[_].canvas.height
	);
}
function _getCellDrawing(grid, col, row) {
	if (!grid[_].drawCells[row]) {
		return null;
	}
	return grid[_].drawCells[row][col];
}
function _putCellDrawing(grid, col, row, context) {
	if (!grid[_].drawCells[row]) {
		grid[_].drawCells[row] = {};
	}
	grid[_].drawCells[row][col] = context;
}
function _removeCellDrawing(grid, col, row) {
	if (!grid[_].drawCells[row]) {
		return;
	}
	delete grid[_].drawCells[row][col];
	if (Object.keys(grid[_].drawCells[row]).length === 0) {
		delete grid[_].drawCells[row];
	}
}
function _drawCell(grid, ctx, col, absoluteLeft, width, row, absoluteTop, height, visibleRect,
		skipAbsoluteTop, skipAbsoluteLeft, drawLayers) {
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
			const cellDrawing = _getCellDrawing(grid, col, row);
			if (cellDrawing) {
				cellDrawing.cancel();
			}
			const dcContext = new DrawCellContext(
					col, row,
					ctx, rect, drawRect,
					!!cellDrawing,
					grid[_].selection,
					drawLayers
			);
			const p = grid.onDrawCell(col, row, dcContext);
			if (isPromise(p)) {
				//遅延描画
				_putCellDrawing(grid, col, row, dcContext);

				const pCol = col;
				dcContext._delayMode(grid, () => {
					_removeCellDrawing(grid, pCol, row);
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

function _drawRow(grid, ctx, initFrozenCol, initCol,
		drawRight, row, absoluteTop, height, visibleRect, skipAbsoluteTop, drawLayers) {
	const {colCount} = grid[_];
	const drawOuter = (col, absoluteLeft) => {
		//データ範囲外の描画
		if (col >= (colCount - 1) && grid[_].canvas.width > (absoluteLeft - visibleRect.left)) {
			const outerLeft = absoluteLeft - visibleRect.left;
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = grid.underlayBackgroundColor || '#F6F6F6';
			ctx.rect(outerLeft, absoluteTop - visibleRect.top, grid[_].canvas.width - outerLeft, height);
			ctx.fill();
			ctx.restore();
		}
	};

	let skipAbsoluteLeft = 0;
	if (initFrozenCol) {
		let absoluteLeft = initFrozenCol.left;
		const count = grid[_].frozenColCount;
		for (let {col} = initFrozenCol; col < count; col++) {
			const width = _getColWidth(grid, col);

			_drawCell(grid, ctx, col, absoluteLeft, width, row, absoluteTop, height, visibleRect,
					skipAbsoluteTop, 0,
					drawLayers);

			absoluteLeft += width;
			if (drawRight <= absoluteLeft) { //描画範囲外（終了）
				drawOuter(col, absoluteLeft);
				return;
			}
		}
		skipAbsoluteLeft = absoluteLeft;
	}

	let absoluteLeft = initCol.left;
	for (let {col} = initCol; col < colCount; col++) {
		const width = _getColWidth(grid, col);
		_drawCell(grid, ctx, col, absoluteLeft, width, row, absoluteTop, height, visibleRect,
				skipAbsoluteTop, skipAbsoluteLeft,
				drawLayers);

		absoluteLeft += width;
		if (drawRight <= absoluteLeft) { //描画範囲外（終了）
			drawOuter(col, absoluteLeft);
			return;
		}
	}
	drawOuter(colCount - 1, absoluteLeft);

}
function _invalidateRect(grid, drawRect) {
	const visibleRect = _getVisibleRect(grid);
	const {rowCount} = grid[_];
	const ctx = grid._getInitContext();

	const initRow = _getTargetRowAt(grid, Math.max(visibleRect.top, drawRect.top)) || {
		top: _getRowsHeight(grid, 0, rowCount - 1),
		row: rowCount
	};
	const initCol = _getTargetColAt(grid, Math.max(visibleRect.left, drawRect.left)) || {
		left: _getColsWidth(grid, 0, grid[_].colCount - 1),
		col: grid[_].colCount
	};
	const drawBottom = Math.min(visibleRect.bottom, drawRect.bottom);
	const drawRight = Math.min(visibleRect.right, drawRect.right);

	const initFrozenRow = _getTargetFrozenRowAt(grid, Math.max(visibleRect.top, drawRect.top));
	const initFrozenCol = _getTargetFrozenColAt(grid, Math.max(visibleRect.left, drawRect.left));

	const drawLayers = new DrawLayers();

	const drawOuter = (row, absoluteTop) => {
		//データ範囲外の描画
		if (row >= (rowCount - 1) && grid[_].canvas.height > (absoluteTop - visibleRect.top)) {
			const outerTop = absoluteTop - visibleRect.top;
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = grid.underlayBackgroundColor || '#F6F6F6';
			ctx.rect(0, outerTop, grid[_].canvas.width, grid[_].canvas.height - outerTop);
			ctx.fill();
			ctx.restore();
		}
	};

	let skipAbsoluteTop = 0;
	if (initFrozenRow) {
		let absoluteTop = initFrozenRow.top;
		const count = grid[_].frozenRowCount;
		for (let {row} = initFrozenRow; row < count; row++) {
			const height = _getRowHeight(grid, row);
			_drawRow(grid,
					ctx, initFrozenCol, initCol, drawRight,
					row, absoluteTop, height, visibleRect, 0,
					drawLayers
			);
			absoluteTop += height;
			if (drawBottom <= absoluteTop) { //描画範囲外（終了）
				drawOuter(row, absoluteTop);
				drawLayers.draw(ctx);
				return;
			}
		}
		skipAbsoluteTop = absoluteTop;
	}

	let absoluteTop = initRow.top;
	for (let {row} = initRow; row < rowCount; row++) {
		const height = _getRowHeight(grid, row);

		//行の描画
		_drawRow(grid,
				ctx, initFrozenCol, initCol, drawRight,
				row, absoluteTop, height, visibleRect, skipAbsoluteTop,
				drawLayers
		);

		absoluteTop += height;
		if (drawBottom <= absoluteTop) { //描画範囲外（終了）
			drawOuter(row, absoluteTop);
			drawLayers.draw(ctx);
			return;
		}
	}
	drawOuter(rowCount - 1, absoluteTop);

	drawLayers.draw(ctx);
}

function _toPxWidth(grid, width) {
	return Math.round(calc.toPx(width, grid[_].calcWidthContext));
}

function _getDefaultColPxWidth(grid) {
	return _toPxWidth(grid, grid.defaultColWidth);
}

function _adjustColWidth(grid, col, orgWidth) {
	const limit = grid[_].colWidthsLimit[col];
	if (!limit) {
		return orgWidth;
	}

	if (limit.min) {
		const min = _toPxWidth(grid, limit.min);
		if (min > orgWidth) {
			return min;
		}
	}
	if (limit.max) {
		const max = _toPxWidth(grid, limit.max);
		if (max < orgWidth) {
			return max;
		}
	}
	return orgWidth;
}

function _getColWidth(grid, col) {
	const width = grid[_].colWidthsMap.get(col);
	if (width) {
		return _adjustColWidth(grid, col, _toPxWidth(grid, width));
	}
	return _getDefaultColPxWidth(grid);
}
function _setColWidth(grid, col, width) {
	grid[_].colWidthsMap.put(col, width);
}
function _getColsWidth(grid, startCol, endCol) {
	const colCount = endCol - startCol + 1;
	let w = _getDefaultColPxWidth(grid) * colCount;
	grid[_].colWidthsMap.each(startCol, endCol, (width, col) => {
		w += _adjustColWidth(grid, col, _toPxWidth(grid, width)) - _getDefaultColPxWidth(grid);
	});
	return w;
}

function _getRowHeight(grid, row) {
	const internal = grid.getRowHeightInternal(row);
	if (isDef(internal)) {
		return internal;
	}
	const height = grid[_].rowHeightsMap.get(row);
	if (height) {
		return height;
	}
	return grid[_].defaultRowHeight;
}
function _setRowHeight(grid, row, height) {
	grid[_].rowHeightsMap.put(row, height);
}
function _getRowsHeight(grid, startRow, endRow) {
	const internal = grid.getRowsHeightInternal(startRow, endRow);
	if (isDef(internal)) {
		return internal;
	}
	const rowCount = endRow - startRow + 1;
	let h = grid[_].defaultRowHeight * rowCount;
	grid[_].rowHeightsMap.each(startRow, endRow, (height) => {
		h += height - grid[_].defaultRowHeight;
	});
	return h;
}

function _getScrollWidth(grid) {
	const defaultColPxWidth = _getDefaultColPxWidth(grid);
	let w = defaultColPxWidth * grid[_].colCount;
	grid[_].colWidthsMap.each(0, grid[_].colCount - 1, (width, col) => {
		w += _adjustColWidth(grid, col, _toPxWidth(grid, width)) - defaultColPxWidth;
	});
	return w;
}
function _getScrollHeight(grid, row) {
	const internal = grid.getScrollHeightInternal(row);
	if (isDef(internal)) {
		return internal;
	}
	let h = grid[_].defaultRowHeight * grid[_].rowCount;
	grid[_].rowHeightsMap.each(0, grid[_].rowCount - 1, (height) => {
		h += height - grid[_].defaultRowHeight;
	});
	return h;
}
function _onScroll(grid, e) {
	const lastLeft = grid[_].scroll.left;
	const lastTop = grid[_].scroll.top;
	const moveX = grid[_].scrollable.scrollLeft - lastLeft;
	const moveY = grid[_].scrollable.scrollTop - lastTop;

	//次回計算用情報を保持
	grid[_].scroll = {
		left: grid[_].scrollable.scrollLeft,
		top: grid[_].scrollable.scrollTop,
	};
	const visibleRect = _getVisibleRect(grid);
	if ((Math.abs(moveX) >= visibleRect.width) || (Math.abs(moveY) >= visibleRect.height)) {
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
					const frozenRect = _getFrozenColsRect(grid);
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
					_invalidateRect(grid, _getFrozenColsRect(grid));
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
					const frozenRect = _getFrozenRowsRect(grid);
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
					_invalidateRect(grid, _getFrozenRowsRect(grid));
				}
			}
		}
	}
}

function _onKeyDownMove(grid, e) {
	const {shiftKey} = e;
	const keyCode = getKeyCode(e);
	const focusCell = shiftKey ? grid.selection._focus : grid.selection._sel;
	if (keyCode === KEY_LEFT) {
		const col = grid.getMoveLeftColByKeyDownInternal(focusCell);
		if (col < 0) {
			return;
		}
		_moveFocusCell(grid, col, focusCell.row, shiftKey);
		cancelEvent(e);
	} else if (keyCode === KEY_UP) {
		const row = grid.getMoveUpRowByKeyDownInternal(focusCell);
		if (row < 0) {
			return;
		}
		_moveFocusCell(grid, focusCell.col, row, shiftKey);
		cancelEvent(e);
	} else if (keyCode === KEY_RIGHT) {
		const col = grid.getMoveRightColByKeyDownInternal(focusCell);
		if (grid.colCount <= col) {
			return;
		}
		_moveFocusCell(grid, col, focusCell.row, shiftKey);
		cancelEvent(e);
	} else if (keyCode === KEY_DOWN) {
		const row = grid.getMoveDownRowByKeyDownInternal(focusCell);
		if (grid.rowCount <= row) {
			return;
		}
		_moveFocusCell(grid, focusCell.col, row, shiftKey);
		cancelEvent(e);
	} else if (keyCode === KEY_HOME) {
		const row = e.ctrlKey ? 0 : focusCell.row;
		_moveFocusCell(grid, 0, row, e.shiftKey);
		cancelEvent(e);
	} else if (keyCode === KEY_END) {
		const row = e.ctrlKey ? grid.rowCount - 1 : focusCell.row;
		_moveFocusCell(grid, grid.colCount - 1, row, shiftKey);
		cancelEvent(e);
	}
}
function _moveFocusCell(grid, col, row, shiftKey) {
	const offset = grid.getOffsetInvalidateCells();

	function extendRange(range) {
		if (offset > 0) {
			range.start.col -= offset;
			range.start.row -= offset;
			range.end.col += offset;
			range.end.row += offset;
		}
		return range;
	}

	const beforeRange = extendRange(grid.selection.range);
	const beforeRect = grid.getCellsRect(
			beforeRange.start.col, beforeRange.start.row,
			beforeRange.end.col, beforeRange.end.row
	);

	grid.selection._setFocusCell(col, row, shiftKey);
	grid.makeVisibleCell(col, row);
	grid.focusCell(col, row);

	const afterRange = extendRange(grid.selection.range);
	const afterRect = grid.getCellsRect(
			afterRange.start.col, afterRange.start.row,
			afterRange.end.col, afterRange.end.row
	);

	if (afterRect.intersection(beforeRect)) {
		const invalidateRect = Rect.max(afterRect, beforeRect);
		_invalidateRect(grid, invalidateRect);
	} else {
		_invalidateRect(grid, beforeRect);
		_invalidateRect(grid, afterRect);
	}
}
function _getMouseAbstractPoint(grid, e) {
	if (isTouchEvent(e)) {
		e = e.changedTouches[0];
	}
	const clientX = e.clientX || (e.pageX + window.scrollX);
	const clientY = e.clientY || (e.pageY + window.scrollY);
	const rect = grid[_].canvas.getBoundingClientRect();
	if (rect.right <= clientX) {
		return null;
	}
	if (rect.bottom <= clientY) {
		return null;
	}
	const x = clientX - rect.left + grid[_].scroll.left;
	const y = clientY - rect.top + grid[_].scroll.top;
	return {x, y};
}

function _bindEvents(grid) {
	const {handler, element, scrollable} = grid[_];
	const getCellEventArgsSet = (e) => {
		const abstractPos = _getMouseAbstractPoint(grid, e);
		if (!abstractPos) {
			return {};
		}
		const cell = grid.getCellAt(abstractPos.x, abstractPos.y);
		if (cell.col < 0 || cell.row < 0) {
			return {
				abstractPos,
				cell
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
			eventArgs
		};
	};
	const canResizeColumn = (col) => {
		const limit = grid[_].colWidthsLimit[col];
		if (!limit || !limit.min || !limit.max) {
			return true;
		}
		return limit.max !== limit.min;
	};
	handler.on(element, 'mousedown', (e) => {
		const eventArgsSet = getCellEventArgsSet(e);
		const {abstractPos, eventArgs} = eventArgsSet;
		if (!abstractPos) {
			return;
		}
		if (eventArgs) {
			const results = grid.fireListeners(EV_MOUSEDOWN_CELL, eventArgs);
			if (array.findIndex(results, (v) => !v) >= 0) {
				return;
			}
		}
		if (getMouseButtons(e) !== 1) {
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
	handler.on(element, 'mouseup', (e) => {
		if (!grid.hasListeners(EV_MOUSEUP_CELL)) {
			return;
		}
		const {eventArgs} = getCellEventArgsSet(e);
		if (eventArgs) {
			grid.fireListeners(EV_MOUSEUP_CELL, eventArgs);
		}
	});
	let doubleTapBefore = null;
	let longTouchId = null;
	handler.on(element, 'touchstart', (e) => {

		if (!doubleTapBefore) {
			doubleTapBefore = getCellEventArgsSet(e).eventArgs;
			setTimeout(() => {
				doubleTapBefore = null;
			}, 350);
		} else {
			const {eventArgs} = getCellEventArgsSet(e);
			if (eventArgs &&
					eventArgs.col === doubleTapBefore.col &&
					eventArgs.row === doubleTapBefore.row) {
				grid.fireListeners(EV_DBLTAP_CELL, eventArgs);
			}

			doubleTapBefore = null;

			if (e.defaultPrevented) {
				return;
			}
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

	function cancel(e) {
		if (longTouchId) {
			clearTimeout(longTouchId);
			longTouchId = null;
		}
	}
	handler.on(element, 'touchcancel', cancel);
	handler.on(element, 'touchmove', cancel);
	handler.on(element, 'touchend', (e) => {
		if (longTouchId) {
			clearTimeout(longTouchId);
			grid[_].cellSelector.select(e);
			longTouchId = null;
		}
	});

	let isMouseover = false;
	let mouseEnterCell = null;
	let mouseOverCell = null;
	function onMouseenterCell(cell) {
		grid.fireListeners(EV_MOUSEENTER_CELL, cell);
		mouseEnterCell = cell;
	}
	function onMouseleaveCell() {
		const beforeMouseCell = mouseEnterCell;
		mouseEnterCell = null;
		if (beforeMouseCell) {
			grid.fireListeners(EV_MOUSELEAVE_CELL, {
				col: beforeMouseCell.col,
				row: beforeMouseCell.row,
			});
		}
	}
	function onMouseoverCell(cell) {
		grid.fireListeners(EV_MOUSEOVER_CELL, cell);
		mouseOverCell = cell;
	}
	function onMouseoutCell() {
		const beforeMouseCell = mouseOverCell;
		mouseOverCell = null;
		if (beforeMouseCell) {
			grid.fireListeners(EV_MOUSEOUT_CELL, {
				col: beforeMouseCell.col,
				row: beforeMouseCell.row,
			});
		}
	}
	const scrollElement = scrollable.getElement();
	handler.on(scrollElement, 'mouseover', (e) => {
		isMouseover = true;
	});
	handler.on(scrollElement, 'mouseout', (e) => {
		isMouseover = false;
		onMouseoutCell();
	});

	handler.on(element, 'mouseleave', (e) => {
		onMouseleaveCell();
	});

	handler.on(element, 'mousemove', (e) => {
		const eventArgsSet = getCellEventArgsSet(e);
		const {abstractPos, eventArgs} = eventArgsSet;
		if (eventArgs) {
			const beforeMouseCell = mouseEnterCell;
			if (beforeMouseCell) {
				grid.fireListeners(EV_MOUSEMOVE_CELL, eventArgs);
				if (beforeMouseCell.col !== eventArgs.col || beforeMouseCell.row !== eventArgs.row) {
					onMouseoutCell();
					onMouseleaveCell();
					const cell = {
						col: eventArgs.col,
						row: eventArgs.row,
					};
					onMouseenterCell(cell);
					if (isMouseover) {
						onMouseoverCell(cell);
					}
				} else if (isMouseover && !mouseOverCell) {
					onMouseoverCell({
						col: eventArgs.col,
						row: eventArgs.row,
					});
				}
			} else {
				const cell = {
					col: eventArgs.col,
					row: eventArgs.row,
				};
				onMouseenterCell(cell);
				if (isMouseover) {
					onMouseoverCell(cell);
				}
				grid.fireListeners(EV_MOUSEMOVE_CELL, eventArgs);
			}
		} else {
			onMouseoutCell();
			onMouseleaveCell();
		}
		if (grid[_].columnResizer.moving(e) || grid[_].cellSelector.moving(e)) {
			return;
		}
		const {style} = element;
		if (!abstractPos) {
			if (style.cursor === 'col-resize') {
				style.cursor = '';
			}
			return;
		}
		const resizeCol = _getResizeColAt(grid, abstractPos.x, abstractPos.y);
		if (resizeCol >= 0 && canResizeColumn(resizeCol)) {
			style.cursor = 'col-resize';
		} else {
			if (style.cursor === 'col-resize') {
				style.cursor = '';
			}
		}
	});
	handler.on(element, 'click', (e) => {
		if (grid[_].columnResizer.lastMoving(e) || grid[_].cellSelector.lastMoving(e)) {
			return;
		}
		if (!grid.hasListeners(EV_CLICK_CELL)) {
			return;
		}
		const {eventArgs} = getCellEventArgsSet(e);
		if (!eventArgs) {
			return;
		}
		grid.fireListeners(EV_CLICK_CELL, eventArgs);
	});
	handler.on(element, 'dblclick', (e) => {
		if (!grid.hasListeners(EV_DBLCLICK_CELL)) {
			return;
		}
		const {eventArgs} = getCellEventArgsSet(e);
		if (!eventArgs) {
			return;
		}
		grid.fireListeners(EV_DBLCLICK_CELL, eventArgs);
	});
	grid[_].focusControl.listen('keydown', (keyCode, e) => {
		grid.fireListeners(EV_KEYDOWN, keyCode, e);
	});
	grid[_].selection.listen(EV_SELECTED_CELL, (data) => {
		grid.fireListeners(EV_SELECTED_CELL, data, data.selected);
	});

	scrollable.onScroll((e) => {
		_onScroll(grid, e);
		grid.fireListeners(EV_SCROLL, {event: e});
	});
	grid[_].focusControl.onKeyDownMove((e) => {
		_onKeyDownMove(grid, e);
	});
	grid.listen('copydata', (range) => {
		let copyValue = '';
		for (let {row} = range.start; row <= range.end.row; row++) {
			for (let {col} = range.start; col <= range.end.col; col++) {
				const copyCellValue = grid.getCopyCellValue(col, row);
				if (window.Promise && copyCellValue instanceof window.Promise) {
					//非同期データは取得できない
				} else {
					const strCellValue = `${copyCellValue}`;
					if (strCellValue.match(/^\[object .*\]$/)) {
						//object は無視
					} else {
						copyValue += strCellValue;
					}
				}

				if (col < range.end.col) {
					copyValue += '\t';
				}
			}
			copyValue += '\n';
		}
		return copyValue;
	});
	grid[_].focusControl.onCopy((e) => array.find(grid.fireListeners('copydata', grid[_].selection.range), isDef));
	grid[_].focusControl.onPaste(({value, event}) => {
		const normalizeValue = value.replace(/\r?\n$/, '');
		const {col, row} = grid[_].selection.select;
		grid.fireListeners(EV_PASTE_CELL, {
			col,
			row,
			value,
			normalizeValue,
			multi: /[\r\n\u2028\u2029\t]/.test(normalizeValue), // is multi cell values
			event,
		});
	});
	grid[_].focusControl.onInput((value) => {
		const {col, row} = grid[_].selection.select;
		grid.fireListeners(EV_INPUT_CELL, {col, row, value});
	});
	grid.bindEventsInternal();
}

function _getResizeColAt(grid, abstractX, abstractY, offset = 5) {
	if (grid[_].frozenRowCount <= 0) {
		return -1;
	}
	const frozenRect = _getFrozenRowsRect(grid);
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
function _getVisibleRect(grid) {
	const {
		scroll: {left, top},
		canvas: {width, height}
	} = grid[_];
	return new Rect(
			left,
			top,
			width,
			height
	);
}
function _getScrollableVisibleRect(grid) {
	let frozenColsWidth = 0;
	if (grid[_].frozenColCount > 0) {
		//固定列がある場合固定列分描画
		const frozenRect = _getFrozenColsRect(grid);
		frozenColsWidth = frozenRect.width;
	}
	let frozenRowsHeight = 0;
	if (grid[_].frozenRowCount > 0) {
		//固定列がある場合固定列分描画
		const frozenRect = _getFrozenRowsRect(grid);
		frozenRowsHeight = frozenRect.height;
	}
	return new Rect(
			grid[_].scroll.left + frozenColsWidth,
			grid[_].scroll.top + frozenRowsHeight,
			grid[_].canvas.width - frozenColsWidth,
			grid[_].canvas.height - frozenRowsHeight
	);
}

function _toRelativeRect(grid, absoluteRect) {
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
	constructor(grid) {
		this._grid = grid;
		this._handler = new EventHandler();
		this._events = {};
		this._started = false;
		this._moved = false;
	}
	moving(e) {
		return !!this._started;
	}
	lastMoving(e) {
		// mouseup後すぐに、clickイベントを反応しないようにする制御要
		if (this.moving(e)) {
			return true;
		}
		const last = this._mouseEndPoint;
		if (!last) {
			return false;
		}
		const pt = _getMouseAbstractPoint(this._grid, e);
		return pt.x === last.x && pt.y === last.y;
	}
	_bindMoveAndUp(e) {
		const events = this._events;
		const handler = this._handler;
		if (!isTouchEvent(e)) {
			events.mousemove = handler.on(document.body, 'mousemove', (e) => this._mouseMove(e));
			events.mouseup = handler.on(document.body, 'mouseup', (e) => this._mouseUp(e));
		} else {
			events.touchmove = handler.on(document.body, 'touchmove', (e) => this._mouseMove(e), {passive: false});
			events.touchend = handler.on(document.body, 'touchend', (e) => this._mouseUp(e));
			events.touchcancel = handler.on(document.body, 'touchcancel', (e) => this._mouseUp(e));
		}
		this._started = true;
		this._moved = false;
	}
	_mouseMove(e) {
		if (!isTouchEvent(e)) {
			if (getMouseButtons(e) !== 1) {
				this._mouseUp(e);
				return;
			}
		}
		this._moved = this._moveInternal(e) || this._moved/*calculation on after*/;

		cancelEvent(e);
	}
	_moveInternal(e) {
		//protected
	}
	_mouseUp(e) {
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
		if (this._moved) { //移動が発生していたら
			this._mouseEndPoint = _getMouseAbstractPoint(this._grid, e);
			setTimeout(() => {
				this._mouseEndPoint = null;
			}, 10);
		}
	}
	_upInternal(e) {
		//protected
	}
	dispose() {
		this._handler.dispose();
	}
}

/**
 * managing cell selection operation with mouse
 * @private
 */
class CellSelector extends BaseMouseDownMover {
	start(e) {
		const cell = this._getTargetCell(e);
		if (!cell) {
			return;
		}
		_moveFocusCell(this._grid, cell.col, cell.row, e.shiftKey);

		this._bindMoveAndUp(e);

		this._cell = cell;

		cancelEvent(e);
		_vibrate(e);
	}
	select(e) {
		const cell = this._getTargetCell(e);
		if (!cell) {
			return;
		}
		_moveFocusCell(this._grid, cell.col, cell.row, e.shiftKey);
		this._cell = cell;
	}
	_moveInternal(e) {
		const cell = this._getTargetCell(e);
		if (!cell) {
			return false;
		}
		const {col: oldCol, row: oldRow} = this._cell;
		const {col: newCol, row: newRow} = cell;
		if (oldCol === newCol && oldRow === newRow) {
			return false;
		}
		const grid = this._grid;
		_moveFocusCell(grid, newCol, newRow, true);

		//make visible
		const makeVisibleCol = (() => {
			if (newCol < oldCol && 0 < newCol) {
				// move left
				return newCol - 1;
			} else if (oldCol < newCol && newCol + 1 < grid.colCount) {
				// move right
				return newCol + 1;
			}
			return newCol;
		})();
		const makeVisibleRow = (() => {
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
	_getTargetCell(e) {
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
	constructor(grid) {
		super(grid);
		this._targetCol = -1;
	}
	start(col, e) {
		let pageX;
		if (!isTouchEvent(e)) {
			({pageX} = e);
		} else {
			({pageX} = e.changedTouches[0]);
		}

		this._x = pageX;
		this._preX = 0;

		this._bindMoveAndUp(e);

		this._targetCol = col;
		this._invalidateAbsoluteLeft = _getColsWidth(this._grid, 0, col - 1);

		cancelEvent(e);
		_vibrate(e);
	}
	_moveInternal(e) {
		const pageX = isTouchEvent(e) ? e.changedTouches[0].pageX : e.pageX;

		const x = pageX - this._x;
		const moveX = x - this._preX;
		this._preX = x;
		const pre = this._grid.getColWidth(this._targetCol);
		let afterSize = _adjustColWidth(this._grid, this._targetCol, pre + moveX);
		if (afterSize < 10 && moveX < 0) {
			afterSize = 10;
		}
		_setColWidth(this._grid, this._targetCol, afterSize);

		const rect = _getVisibleRect(this._grid);
		rect.left = this._invalidateAbsoluteLeft;
		_invalidateRect(this._grid, rect);

		this._grid.fireListeners(EV_RESIZE_COLUMN, {col: this._targetCol});

		return true;
	}
	_upInternal(e) {
		const grid = this._grid;
		if (grid.updateScroll()) {
			grid.invalidate();
		}
	}
}

function setSafeInputValue(input, value) {
	const {type} = input;
	input.type = '';
	input.value = value;
	if (type) {
		input.type = type;
	}
}

/**
 * Manage focus
 * @private
 */
class FocusControl extends EventTarget {
	constructor(grid, parentElement, scrollable) {
		super();
		this._grid = grid;
		this._scrollable = scrollable;
		const handler = this._handler = new EventHandler();
		const input = this._input = document.createElement('input');
		input.classList.add('grid-focus-control');
		input.readOnly = true;
		parentElement.appendChild(input);

		handler.on(input, 'compositionstart', (e) => {
			input.classList.add('composition');
			input.style.font = grid.font || '16px sans-serif';
			this._isComposition = true;
			if (this._compositionEnd) {
				clearTimeout(this._compositionEnd);
				delete this._compositionEnd;
			}
			grid.focus();
		});
		let lastInputValue;
		const inputClear = () => {
			lastInputValue = input.value;
			if (this._isComposition) {
				return;
			}
			setSafeInputValue(input, '');
		};

		const handleCompositionEnd = () => {
			this._isComposition = false;
			input.classList.remove('composition');
			input.style.font = '';
			const {value} = input;

			inputClear();

			if (!input.readOnly) {
				this.fireListeners('input', value);
			}

			if (this._compositionEnd) {
				clearTimeout(this._compositionEnd);
				delete this._compositionEnd;
			}
		};
		handler.on(input, 'compositionend', (e) => {
			this._compositionEnd = setTimeout(handleCompositionEnd);
		});
		handler.on(input, 'keypress', (e) => {
			if (this._isComposition) {
				return;
			}
			if (!input.readOnly && e.key && e.key.length === 1) {
				if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
					//copy! for Firefox & Safari
				} else	if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
					//paste! for Firefox & Safari
				} else {
					this.fireListeners('input', e.key);
					cancelEvent(e);
				}
			}
			inputClear();
		});
		handler.on(input, 'keydown', (e) => {
			if (this._isComposition) {
				if (this._compositionEnd) {
					handleCompositionEnd();
					cancelEvent(e);
				}
				return;
			}
			const keyCode = getKeyCode(e);
			this.fireListeners('keydown', keyCode, e);

			if (!input.readOnly && lastInputValue) {
				// for Safari
				this.fireListeners('input', lastInputValue);
			}

			inputClear();
		});
		handler.on(input, 'keyup', (e) => {
			if (this._isComposition) {
				if (this._compositionEnd) {
					handleCompositionEnd();
				}
			}
			inputClear();
		});

		handler.on(input, 'input', (e) => {
			inputClear();
		});
		if (browser.IE) {
			handler.on(document, 'keydown', (e) => {
				if (e.target !== input) {
					return;
				}
				const keyCode = getKeyCode(e);
				if (keyCode === KEY_ALPHA_C && e.ctrlKey) {
					// When text is not selected copy-event is not emit, on IE.
					setSafeInputValue(input, 'dummy');
					input.select();
					setTimeout(() => {
						setSafeInputValue(input, '');
					}, 100);
				} else if (keyCode === KEY_ALPHA_V && e.ctrlKey) {
					// When input is read-only paste-event is not emit, on IE.
					if (input.readOnly) {
						input.readOnly = false;
						setTimeout(() => {
							input.readOnly = true;
							setSafeInputValue(input, '');
						}, 10);
					}
				}
			});
		}
		if (browser.Edge) {
			handler.once(document, 'keydown', (e) => {
				if (!isDescendantElement(parentElement, e.target)) {
					return;
				}
				// When the input has focus on the first page opening, the paste-event and copy-event is not emit, on Edge.
				const dummyInput = document.createElement('input');
				grid.getElement().appendChild(dummyInput);
				dummyInput.focus();
				input.focus();
				dummyInput.parentElement.removeChild(dummyInput);
			});
		}
		handler.on(document, 'paste', (e) => {
			if (!isDescendantElement(parentElement, e.target)) {
				return;
			}
			let pasteText = undefined;
			if (browser.IE) {
				// IE
				pasteText = window.clipboardData.getData('Text');
			} else {
				const {clipboardData} = e;
				if (clipboardData.items) {
					// Chrome & Firefox & Edge
					pasteText = clipboardData.getData('text/plain');
				} else {
					// Safari
					if (-1 !== Array.prototype.indexOf.call(clipboardData.types, 'text/plain')) {
						pasteText = clipboardData.getData('Text');
					}
				}
			}
			if (isDef(pasteText) && pasteText.length) {
				this.fireListeners('paste', {value: pasteText, event: e});
			}
		});
		handler.on(document, 'copy', (e) => {
			if (this._isComposition) {
				return;
			}
			if (!isDescendantElement(parentElement, e.target)) {
				return;
			}
			setSafeInputValue(input, '');
			const data = array.find(this.fireListeners('copy'), isDef);
			if (isDef(data)) {
				cancelEvent(e);
				if (browser.IE) {
					window.clipboardData.setData('Text', data); // IE
				} else {
					e.clipboardData.setData('text/plain', data); // Chrome, Firefox
				}
			}
		});
	}
	onKeyDownMove(fn) {
		this._handler.on(this._input, 'keydown', (e) => {
			if (this._isComposition) {
				return;
			}
			const keyCode = getKeyCode(e);
			if (keyCode === KEY_LEFT ||
					keyCode === KEY_UP ||
					keyCode === KEY_RIGHT ||
					keyCode === KEY_DOWN ||
					keyCode === KEY_HOME ||
					keyCode === KEY_END
			) {
				fn(e);
			}
		});
	}
	onInput(fn) {
		return this.listen('input', fn);
	}
	onCopy(fn) {
		return this.listen('copy', fn);
	}
	onPaste(fn) {
		return this.listen('paste', fn);
	}
	focus() {
		// this._input.value = '';
		this._input.focus();
	}
	setFocusRect(rect) {
		const input = this._input;
		const top = this._scrollable.calcTop(rect.top);
		input.style.top = `${(top - style.getScrollBarSize()).toFixed()}px`;//position:relative だとずれるが、IEは position:relativeじゃないと最大値まで利用できない
		input.style.left = `${rect.left.toFixed()}px`;
		input.style.width = `${rect.width.toFixed()}px`;
		input.style.height = `${rect.height.toFixed()}px`;
	}
	set editMode(editMode) {
		this._input.readOnly = !editMode;
	}
	resetInputStatus() {
		const el = this._input;
		const composition = el.classList.contains('composition');

		const atts = el.attributes;
		const removeNames = [];
		for (let i = 0, n = atts.length; i < n; i++) {
			const att = atts[i];
			if (!this._inputStatus.hasOwnProperty(att.nodeName)) {
				removeNames.push(att.name);
			}
		}
		removeNames.forEach((removeName) => {
			el.removeAttribute(removeName);
		});
		for (const name in this._inputStatus) {
			el.setAttribute(name, this._inputStatus[name]);
		}
		if (composition) {
			el.classList.add('composition');
			el.style.font = this._grid.font || '16px sans-serif';
		} else {
			el.classList.remove('composition');
		}
	}
	storeInputStatus() {
		const el = this._input;
		const inputStatus = this._inputStatus = {};
		const atts = el.attributes;
		for (let i = 0, n = atts.length; i < n; i++) {
			const att = atts[i];
			inputStatus[att.name] = att.value;
		}
	}
	setDefaultInputStatus() {
		// なぜかスクロールが少しずつずれていくことがあるのでここではセットしない。
		// this._input.style.font = this._grid.font || '16px sans-serif';
	}
	get editMode() {
		return !this._input.readOnly;
	}
	get input() {
		return this._input;
	}
	dispose() {
		super.dispose();
		this._handler.dispose();
	}
}

/**
 * Selected area management
 */
class Selection extends EventTarget {
	constructor(grid) {
		super();
		this._grid = grid;

		this._sel = {col: 0, row: 0};
		this._focus = {col: 0, row: 0};

		this._start = {col: 0, row: 0};
		this._end = {col: 0, row: 0};
	}
	get range() {
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
			inCell(col, row) {
				return startCol <= col && col <= endCol &&
						startRow <= row && row <= endRow;
			},
		};
	}
	get focus() {
		const {col, row} = this._focus;
		return {col, row};
	}
	get select() {
		const {col, row} = this._sel;
		return {col, row};
	}
	set select(cell = {}) {
		this._wrapFireSelectedEvent(() => {
			const {
				col = 0,
				row = 0
			} = cell;
			this._setSelectCell(col, row);
			this._setFocusCell(col, row, true);
		});
	}
	_setSelectCell(col, row) {
		this._wrapFireSelectedEvent(() => {
			this._sel = {col, row};
			this._start = {col, row};
		});
	}
	_setFocusCell(col, row, keepSelect) {
		this._wrapFireSelectedEvent(() => {
			if (!keepSelect) {
				this._setSelectCell(col, row);
			}
			this._focus = {col, row};
			this._end = {col, row};
		});
	}
	_wrapFireSelectedEvent(callback) {
		if (this._isWraped) {
			callback();
		} else {
			this._isWraped = true;
			try {
				const before = {
					col: this._sel.col,
					row: this._sel.row,
					selected: false,
				};
				callback();
				const after = {
					col: this._sel.col,
					row: this._sel.row,
					selected: true,
					before: {
						col: before.col,
						row: before.row,
					}
				};
				before.after = {
					col: after.col,
					row: after.row,
				};
				this.fireListeners(EV_SELECTED_CELL, before);
				this.fireListeners(EV_SELECTED_CELL, after);
			} finally {
				this._isWraped = false;
			}
		}
	}
	_updateGridRange() {
		const {rowCount, colCount} = this._grid;
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
}

/**
 * This class manages the drawing process for each layer
 */
class DrawLayers {
	constructor() {
		this._layers = {};
	}
	addDraw(level, fn) {
		const l = this._layers[level] || (this._layers[level] = new DrawLayer(level));
		l.addDraw(fn);
	}
	draw(ctx) {
		const list = [];
		for (const k in this._layers) {
			list.push(this._layers[k]);
		}
		list.sort((a, b) => a.level - b.level);
		list.forEach((l) => l.draw(ctx));
	}
}
class DrawLayer {
	constructor(level) {
		this._level = level;
		this._list = [];
	}
	get level() {
		return this._level;
	}
	addDraw(fn) {
		this._list.push(fn);
	}
	draw(ctx) {
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
 */
class DrawCellContext {
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
	constructor(col, row, ctx, rect, drawRect, drawing, selection, drawLayers) {
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
	get drawing() {
		if (this._mode === 0) {
			return this._drawing;
		} else {
			return true;
		}
	}
	get row() {
		return this._row;
	}
	get col() {
		return this._col;
	}
	cancel() {
		this._cancel = true;
		this._childContexts.forEach((ctx) => { ctx.cancel(); });
	}
	/**
	 * select status.
	 * @return {object} select status
	 */
	getSelectState() {
		const sel = this._selection.select;
		return {
			selected: sel.col === this._col && sel.row === this._row,
			selection: this._selection.range.inCell(this._col, this._row),
		};
	}
	/**
	 * Canvas context.
	 * @return {CanvasRenderingContext2D} Canvas context.
	 */
	getContext() {
		if (this._mode === 0) {
			return this._ctx;
		} else {
			return this._grid._getInitContext();
		}
	}
	/**
	 * Rectangle of cell.
	 * @return {Rect} rect Rectangle of cell.
	 */
	getRect() {
		if (this._mode === 0) {
			return this._rect;
		} else {
			if (this._rect) {
				return this._rect;
			}
			return this._grid.getCellRelativeRect(this._col, this._row);
		}
	}
	setRect(rect) {
		this._rect = rect;
	}
	/**
	 * Rectangle of Drawing range.
	 * @return {Rect} Rectangle of Drawing range.
	 */
	getDrawRect() {
		if (this._cancel) {
			return null;
		}
		if (this._mode === 0) {
			return this._drawRect;
		} else {
			if (this._isOutOfRange()) {
				return null;
			}

			const absoluteRect = this._grid.getCellRect(this._col, this._row);
			return this._toRelativeDrawRect(absoluteRect);
		}
	}
	_isOutOfRange() {
		const {colCount, rowCount} = this._grid;
		return colCount <= this._col || rowCount <= this._row;
	}
	/**
	 * get Context of current state
	 * @return {DrawCellContext} current DrawCellContext.
	 */
	toCurrentContext() {
		if (this._mode === 0) {
			return this;
		} else {
			const absoluteRect = this._grid.getCellRect(this._col, this._row);
			const rect = _toRelativeRect(this._grid, absoluteRect);
			const drawRect = this._isOutOfRange() ? null : this._toRelativeDrawRect(absoluteRect);
			const context = new DrawCellContext(
					this._col, this._row, this.getContext(), rect, drawRect, this.drawing, this._selection,
					this._drawLayers
			);
				// toCurrentContext は自分の toCurrentContextを呼ばせる
			context.toCurrentContext = this.toCurrentContext.bind(this);
			this._childContexts.push(context);
			if (this._cancel) {
				context.cancel();
			}
			return context;
		}
	}
	addLayerDraw(level, fn) {
		this._drawLayers.addDraw(level, fn);
	}
	_toRelativeDrawRect(absoluteRect) {
		const visibleRect = _getVisibleRect(this._grid);
		let rect = absoluteRect.copy();
		if (!rect.intersection(visibleRect)) {
			return null;
		}

		const isFrozenCell = this._grid.isFrozenCell(this._col, this._row);
		if (this._grid.frozenColCount >= 0 && (!isFrozenCell || !isFrozenCell.col)) {
			const fRect = this._grid.getCellRect(this._grid.frozenColCount - 1, this._row);
			rect = Rect.bounds(
					Math.max(rect.left, fRect.right),
					rect.top,
					rect.right,
					rect.bottom
			);
		}
		if (this._grid.frozenRowCount >= 0 && (!isFrozenCell || !isFrozenCell.row)) {
			const fRect = this._grid.getCellRect(this._col, this._grid.frozenRowCount - 1);
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
	_delayMode(grid, onTerminate) {
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
	terminate() {
		if (this._mode !== 0) {
			this._onTerminate();
		}
	}
}
/**
 * DrawGrid
 * @classdesc cheetahGrid.core.DrawGrid
 * @extends EventTarget
 * @memberof cheetahGrid.core
 */
class DrawGrid extends EventTarget {
	static get EVENT_TYPE() {
		return EVENT_TYPE;
	}
	/**
	 * constructor
	 *
	 * <pre>
	 * Constructor options
	 * -----
	 * rowCount: grid row count.default 10
	 * colCount: grid col count.default 10
	 * frozenColCount: default 0
	 * frozenRowCount: default 0
	 * defaultRowHeight: default grid row height. default 40
	 * defaultColWidth: default grid col width. default 80
	 * parentElement: canvas parentElement
	 * font: default font
	 * underlayBackgroundColor: underlay background color
	 * -----
	 * </pre>
	 *
	 * @constructor
	 * @param  {Object} options Constructor options
	 */
	constructor(
			{
				rowCount = 10,
				colCount = 10,
				frozenColCount = 0,
				frozenRowCount = 0,
				defaultRowHeight = 40,
				defaultColWidth = 80,
				font,
				underlayBackgroundColor,
				parentElement,
			} = {}) {
		super();
		const protectedSpace = this[_] = {};
		style.initDocument();
		protectedSpace.element = createRootElement();
		protectedSpace.scrollable = new Scrollable();
		protectedSpace.handler = new EventHandler();
		protectedSpace.selection = new Selection(this);
		protectedSpace.focusControl = new FocusControl(
				this, protectedSpace.scrollable.getElement(),
				protectedSpace.scrollable
		);

		protectedSpace.canvas = hiDPI.transform(document.createElement('canvas'));
		protectedSpace.context = protectedSpace.canvas.getContext('2d', {alpha: false});

		protectedSpace.rowCount = rowCount;
		protectedSpace.colCount = colCount;
		protectedSpace.frozenColCount = frozenColCount;
		protectedSpace.frozenRowCount = frozenRowCount;

		protectedSpace.defaultRowHeight = defaultRowHeight;
		protectedSpace.defaultColWidth = defaultColWidth;

		protectedSpace.font = font;
		protectedSpace.underlayBackgroundColor = underlayBackgroundColor;

		/////
		protectedSpace.rowHeightsMap = new NumberMap();
		protectedSpace.colWidthsMap = new NumberMap();
		protectedSpace.colWidthsLimit = {};
		protectedSpace.calcWidthContext = {
			_: protectedSpace,
			get full() {
				return this._.canvas.width;
			},
			get em() {
				return getFontSize(this._.context, this._.font).width;
			}
		};

		protectedSpace.columnResizer = new ColumnResizer(this);
		protectedSpace.cellSelector = new CellSelector(this);

		protectedSpace.drawCells = {};
		protectedSpace.cellTextOverflows = {};

		protectedSpace.element.appendChild(protectedSpace.canvas);
		protectedSpace.element.appendChild(protectedSpace.scrollable.getElement());
		this.updateScroll();
		if (parentElement) {
			parentElement.appendChild(protectedSpace.element);
			this.updateSize();
		} else {
			this.updateSize();
		}
		_bindEvents(this);
	}
	/**
	 * Get root element.
	 * @returns {HTMLElement} root element
	 */
	getElement() {
		return this[_].element;
	}
	/**
	 * Get canvas element.
	 * @type {HTMLCanvasElement}
	 */
	get canvas() {
		return this[_].canvas;
	}
	/**
	 * Focus the grid.
	 * @return {void}
	 */
	focus() {
		const {col, row} = this[_].selection.select;
		this.focusCell(col, row);
	}
	/**
	 * Get the selection instance.
	 * @type {Selection}
	 */
	get selection() {
		return this[_].selection;
	}
	/**
	 * Get the number of rows.
	 * @type {number}
	 */
	get rowCount() {
		return this[_].rowCount;
	}
	/**
	 * Set the number of rows.
	 * @param {number} rowCount the number of rows to set
	 * @type {number}
	 */
	set rowCount(rowCount) {
		this[_].rowCount = rowCount;
		this.updateScroll();
		if (this[_].selection._updateGridRange()) {
			const {col, row} = this[_].selection.focus;
			this.makeVisibleCell(col, row);
			this.focusCell(col, row);
		}
	}
	/**
	 * Get the number of columns.
	 * @type {number}
	 */
	get colCount() {
		return this[_].colCount;
	}
	/**
	 * Set the number of columns.
	 * @param {number} colCount the number of columns to set
	 * @type {number}
	 */
	set colCount(colCount) {
		this[_].colCount = colCount;
		this.updateScroll();
		if (this[_].selection._updateGridRange()) {
			const {col, row} = this[_].selection.focus;
			this.makeVisibleCell(col, row);
			this.focusCell(col, row);
		}
	}
	/**
	 * Get the number of frozen columns.
	 * @type {number}
	 */
	get frozenColCount() {
		return this[_].frozenColCount;
	}
	/**
	 * Set the number of frozen columns.
	 * @param {number} frozenColCount the number of frozen columns to set
	 * @type {number}
	 */
	set frozenColCount(frozenColCount) {
		this[_].frozenColCount = frozenColCount;
	}
	/**
	 * Get the number of frozen rows.
	 * @type {number}
	 */
	get frozenRowCount() {
		return this[_].frozenRowCount;
	}
	/**
	 * Set the number of frozen rows.
	 * @param {number} frozenRowCount the number of frozen rows to set
	 * @type {number}
	 */
	set frozenRowCount(frozenRowCount) {
		this[_].frozenRowCount = frozenRowCount;
	}
	/**
	 * Get the default row height.
	 * @type {number}
	 *
	 */
	get defaultRowHeight() {
		return this[_].rowCount;
	}
	/**
	 * Set the default row height.
	 * @param {number} defaultRowHeight the default row height to set
	 * @type {number}
	 */
	set defaultRowHeight(defaultRowHeight) {
		this[_].defaultRowHeight = defaultRowHeight;
		this.updateScroll();
	}
	/**
	 * Get the default column width.
	 * @type {number}
	 */
	get defaultColWidth() {
		return this[_].defaultColWidth;
	}
	/**
	 * Set the default column width.
	 * @param {number} defaultColWidth the default column width to set
	 * @type {number}
	 */
	set defaultColWidth(defaultColWidth) {
		this[_].defaultColWidth = defaultColWidth;
		this.updateScroll();
	}
	/**
	 * Get the font definition as a string.
	 * @type {string}
	 */
	get font() {
		return this[_].font;
	}
	/**
	 * Set the font definition with the given string.
	 * @param {string} font the font definition to set
	 * @type {string}
	 */
	set font(font) {
		this[_].font = font;
	}
	/**
	 * Get the background color of the underlay.
	 * @type {*}
	 */
	get underlayBackgroundColor() {
		return this[_].underlayBackgroundColor;
	}
	/**
	 * Set the background color of the underlay.
	 * @param {*} underlayBackgroundColor the background color of the underlay to set
	 * @type {*}
	 */
	set underlayBackgroundColor(underlayBackgroundColor) {
		this[_].underlayBackgroundColor = underlayBackgroundColor;
	}
	configure(name, value) {
		const cfg = this[_].config || (this[_].config = {});
		if (isDef(value)) {
			cfg[name] = value;
		}
		return cfg[name];
	}
	/**
	 * Apply the changed size.
	 * @return {void}
	 */
	updateSize() {
		//スタイルをクリアしてサイズ値を取得
		const {canvas} = this[_];
		canvas.style.width = '';
		canvas.style.height = '';
		const width = Math.floor(canvas.offsetWidth ||
					canvas.parentElement.offsetWidth - style.getScrollBarSize()/*for legacy*/
		);
		const height = Math.floor(canvas.offsetHeight ||
					canvas.parentElement.offsetHeight - style.getScrollBarSize()/*for legacy*/
		);

		canvas.width = width;
		canvas.height = height;

		//整数で一致させるためstyleをセットして返す
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		const sel = this[_].selection.select;
		this[_].focusControl.setFocusRect(this.getCellRect(sel.col, sel.row));
	}
	/**
	 * Apply the changed scroll size.
	 * @return {boolean} `true` if there was a change in the scroll size
	 */
	updateScroll() {
		const {scrollable} = this[_];
		const newHeight = _getScrollHeight(this);
		const newWidth = _getScrollWidth(this);
		if (newHeight === scrollable.scrollHeight && newWidth === scrollable.scrollWidth) {
			return false;
		}
		scrollable.setScrollSize(newWidth, newHeight);
		this[_].scroll = {
			left: scrollable.scrollLeft,
			top: scrollable.scrollTop,
		};
		return true;
	}
	/**
	 * Get the row height of the given the row index.
	 * @param  {number} row The row index
	 * @return {number} The row height
	 */
	getRowHeight(row) {
		return _getRowHeight(this, row);
	}
	/**
	 * Set the row height of the given the row index.
	 * @param  {number} row The row index
	 * @param  {number} height The row height
	 * @return {void}
	 */
	setRowHeight(row, height) {
		_setRowHeight(this, row, height);
		this.updateScroll();
	}
	/**
	 * Get the column width of the given the column index.
	 * @param  {number} col The column index
	 * @return {number} The column width
	 */
	getColWidth(col) {
		return _getColWidth(this, col);
	}
	/**
	 * Set the column widtht of the given the column index.
	 * @param  {number} col The column index
	 * @param  {number} width The column width
	 * @return {void}
	 */
	setColWidth(col, width) {
		_setColWidth(this, col, width);
		this.updateScroll();
	}
	/**
	 * Get the column max width of the given the column index.
	 * @param  {number} col The column index
	 * @return {number} The column max width
	 */
	getMaxColWidth(col) {
		const obj = this[_].colWidthsLimit[col];
		return obj && obj.max || undefined;
	}
	/**
	 * Set the column max widtht of the given the column index.
	 * @param  {number} col The column index
	 * @param  {number} maxwidth The column max width
	 * @return {void}
	 */
	setMaxColWidth(col, maxwidth) {
		const obj = this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
		obj.max = maxwidth;
	}
	/**
	 * Get the column min width of the given the column index.
	 * @param  {number} col The column index
	 * @return {number} The column min width
	 */
	getMinColWidth(col) {
		const obj = this[_].colWidthsLimit[col];
		return obj && obj.min || undefined;
	}
	/**
	 * Set the column min widtht of the given the column index.
	 * @param  {number} col The column index
	 * @param  {number} minwidth The column min width
	 * @return {void}
	 */
	setMinColWidth(col, minwidth) {
		const obj = this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
		obj.min = minwidth;
	}
	/**
	 * Get the rect of the cell.
	 * @param {number} col index of column, of the cell
	 * @param {number} row index of row, of the cell
	 * @returns {Rect} the rect of the cell.
	 */
	getCellRect(col, row) {
		const isFrozenCell = this.isFrozenCell(col, row);

		let absoluteLeft = _getColsWidth(this, 0, col - 1);
		const width = _getColWidth(this, col);
		if (isFrozenCell && isFrozenCell.col) {
			absoluteLeft += this[_].scroll.left;
		}

		let absoluteTop = _getRowsHeight(this, 0, row - 1);
		const height = _getRowHeight(this, row);
		if (isFrozenCell && isFrozenCell.row) {
			absoluteTop += this[_].scroll.top;
		}
		return new Rect(
				absoluteLeft,
				absoluteTop,
				width,
				height
		);
	}
	/**
	 * Get the relative rectangle of the cell.
	 * @param {number} col index of column, of the cell
	 * @param {number} row index of row, of the cell
	 * @returns {Rect} the rect of the cell.
	 */
	getCellRelativeRect(col, row) {
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
	getCellsRect(startCol, startRow, endCol, endRow) {
		const isFrozenStartCell = this.isFrozenCell(startCol, startRow);
		const isFrozenEndCell = this.isFrozenCell(endCol, endRow);

		let absoluteLeft = _getColsWidth(this, 0, startCol - 1);
		let width = _getColsWidth(this, startCol, endCol);
		if (isFrozenStartCell && isFrozenStartCell.col) {
			const scrollLeft = this[_].scroll.left;
			absoluteLeft += scrollLeft;
			if (!isFrozenEndCell || !isFrozenEndCell.col) {
				width -= scrollLeft;
				width = Math.max(width, _getColsWidth(this, startCol, this.frozenColCount - 1));
			}
		}
		let absoluteTop = _getRowsHeight(this, 0, startRow - 1);
		let height = _getRowsHeight(this, startRow, endRow);
		if (isFrozenStartCell && isFrozenStartCell.row) {
			const scrollTop = this[_].scroll.top;
			absoluteTop += scrollTop;
			if (!isFrozenEndCell || !isFrozenEndCell.row) {
				height -= scrollTop;
				height = Math.max(height, _getColsWidth(this, startRow, this.frozenRowCount - 1));
			}
		}
		return new Rect(
				absoluteLeft,
				absoluteTop,
				width,
				height
		);
	}
	isFrozenCell(col, row) {
		const {frozenRowCount, frozenColCount} = this[_];
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
	getRowAt(absoluteY) {
		const frozen = _getTargetFrozenRowAt(this, absoluteY);
		if (frozen) {
			return frozen.row;
		}
		const row = _getTargetRowAt(this, absoluteY);
		return row ? row.row : -1;

	}
	getColAt(absoluteX) {
		const frozen = _getTargetFrozenColAt(this, absoluteX);
		if (frozen) {
			return frozen.col;
		}
		const col = _getTargetColAt(this, absoluteX);
		return col ? col.col : -1;
	}
	getCellAt(absoluteX, absoluteY) {
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
	makeVisibleCell(col, row) {
		const isFrozenCell = this.isFrozenCell(col, row);
		if (isFrozenCell && isFrozenCell.col && isFrozenCell.row) {
			return;
		}
		const rect = this.getCellRect(col, row);
		const visibleRect = _getScrollableVisibleRect(this);
		if (visibleRect.contains(rect)) {
			return;
		}
		const {scrollable} = this[_];
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
	 * Focus the cell.
	 * @param  {number} col The column index.
	 * @param  {number} row The row index
	 * @return {void}
	 */
	focusCell(col, row) {
		const {focusControl} = this[_];
		const oldEditMode = focusControl.editMode;
		if (oldEditMode) {
			focusControl.resetInputStatus();
		}

		focusControl.setFocusRect(this.getCellRect(col, row));

		const {col: selCol, row: selRow} = this[_].selection.select;
		const results = this.fireListeners(
				EV_EDITABLEINPUT_CELL,
				{col: selCol, row: selRow}
		);

		const editMode = (array.findIndex(results, (v) => !!v) >= 0);
		focusControl.editMode = editMode;

		if (editMode) {
			focusControl.storeInputStatus();
			focusControl.setDefaultInputStatus();
			this.fireListeners(
					EV_MODIFY_STATUS_EDITABLEINPUT_CELL,
					{col: selCol, row: selRow, input: focusControl.input}
			);
		}

		// Failure occurs in IE if focus is not last
		focusControl.focus();
	}
	/**
	 * Redraws the range of the given cell.
	 * @param  {number} col The column index of cell.
	 * @param  {number} row The row index of cell.
	 * @return {void}
	 */
	invalidateCell(col, row) {
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
	invalidateGridRect(startCol, startRow, endCol = startCol, endRow = startRow) {
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

			const {frozenColCount, frozenRowCount} = this[_];
			if (frozenColCount > 0 && endCol >= frozenColCount) {
				const frozenRect = _getFrozenColsRect(this);
				if (frozenRect.intersection(invalidateTarget)) {
					invalidateTarget.left = Math.min(frozenRect.right - 1, frozenRect.right);
				}
			}

			if (frozenRowCount > 0 && endRow >= frozenRowCount) {
				const frozenRect = _getFrozenRowsRect(this);
				if (frozenRect.intersection(invalidateTarget)) {
					invalidateTarget.top = Math.min(frozenRect.bottom - 1, invalidateTarget.top);
				}
			}

			_invalidateRect(this, invalidateTarget);
		}
	}
	/**
	 * Redraws the whole grid.
	 * @return {void}
	 */
	invalidate() {
		const visibleRect = _getVisibleRect(this);
		_invalidateRect(this, visibleRect);
	}
	/**
	 * Get the value of cell with the copy action.
	 * <p>
	 * Please implement
	 * </p>
	 *
	 * @protected
	 * @param  {number} col Column index of cell.
	 * @param  {number} row Row index of cell.
	 * @return {string} the value of cell
	 */
	getCopyCellValue(col, row) {
		//Please implement get cell value!!
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
	onDrawCell(col, row, context) {
		//Please implement cell drawing!!
	}
	/**
	 * Get the overflowed text in the cell rectangle, from the given cell.
	 * @param  {number} col The column index.
	 * @param  {number} row The row index
	 * @return {string | null} The text overflowing the cell rect.
	 */
	getCellOverflowText(col, row) {
		const key = `${col}:${row}`;
		return this[_].cellTextOverflows[key] || null;
	}
	/**
	 * Set the overflowed text in the cell rectangle, to the given cell.
	 * @param  {number} col The column index.
	 * @param  {number} row The row index
	 * @param  {boolean} overflowText The overflowed text in the cell rectangle.
	 * @return {void}
	 */
	setCellOverflowText(col, row, overflowText) {
		const key = `${col}:${row}`;
		if (overflowText) {
			this[_].cellTextOverflows[key] = typeof overflowText === 'string' ? overflowText.trim() : overflowText;
		} else {
			delete this[_].cellTextOverflows[key];
		}
	}
	addDisposable(disposable) {
		if (!disposable || !disposable.dispose || typeof disposable.dispose !== 'function') {
			throw new Error('not disposable!');
		}
		const disposables = this[_].disposables = this[_].disposables || [];
		disposables.push(disposable);
	}
	/**
	 * Dispose the grid instance.
	 * @returns {void}
	 */
	dispose() {
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

		const {parentElement} = protectedSpace.element;
		if (parentElement) {
			parentElement.removeChild(protectedSpace.element);
		}
	}
	getAttachCellArea(col, row) {
		return {
			element: this.getElement(),
			rect: _toRelativeRect(this, this.getCellRect(col, row)),
		};
	}
	bindEventsInternal() {
		//nop
	}
	getTargetRowAtInternal(absoluteY) {
		//継承用 設定を無視して計算する場合継承して実装
	}
	getRowsHeightInternal(startRow, endRow) {
		//継承用 設定を無視して計算する場合継承して実装
	}
	getRowHeightInternal(row) {
		//継承用 設定を無視して計算する場合継承して実装
	}
	getScrollHeightInternal(row) {
		//継承用 設定を無視して計算する場合継承して実装
	}
	getMoveLeftColByKeyDownInternal({col, row}) {
		return col - 1;
	}
	getMoveRightColByKeyDownInternal({col, row}) {
		return col + 1;
	}
	getMoveUpRowByKeyDownInternal({col, row}) {
		return row - 1;
	}
	getMoveDownRowByKeyDownInternal({col, row}) {
		return row + 1;
	}
	getOffsetInvalidateCells() {
		return 0;
	}
	_getInitContext() {
		const ctx = this[_].context;
		//初期化
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 1;
		ctx.font = this.font || '16px sans-serif';
		return ctx;
	}
}

module.exports = DrawGrid;
