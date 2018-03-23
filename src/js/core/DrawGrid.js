'use strict';
{
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

	const EVENT_TYPE = {
		CLICK_CELL: 'click_cell',
		DBLCLICK_CELL: 'dblclick_cell',
		DBLTAP_CELL: 'dbltap_cell',
		MOUSEDOWN_CELL: 'mousedown_cell',
		MOUSEUP_CELL: 'mouseup_cell',
		SELECTED_CELL: 'selected_cell',
		KEYDOWN: 'keydown',
		MOUSEMOVE_CELL: 'mousemove_cell',
		MOUSEENTER_CELL: 'mouseenter_cell',
		MOUSELEAVE_CELL: 'mouseleave_cell',
		MOUSEOVER_CELL: 'mouseover_cell',
		MOUSEOUT_CELL: 'mouseout_cell',
		INPUT_CELL: 'input_cell',
		EDITABLEINPUT_CELL: 'editableinput_cell',
		MODIFY_STATUS_EDITABLEINPUT_CELL: 'modify_status_editableinput_cell',
		RESIZE_COLUMN: 'resize_column',
		SCROLL: 'scroll',
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
	function _isCellDrawing(grid, col, row) {
		if (!grid[_].drawCells[row]) {
			return false;
		}
		return !!grid[_].drawCells[row][col];
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
				const dcContext = new DrawCellContext(
						col, row,
						ctx, rect, drawRect,
						_isCellDrawing(grid, col, row),
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
		let w = _getDefaultColPxWidth(grid) * grid[_].colCount;
		grid[_].colWidthsMap.eachAll((width, col) => {
			w += _adjustColWidth(grid, col, _toPxWidth(grid, width)) - _getDefaultColPxWidth(grid);
		});
		return w;
	}
	function _getScrollHeight(grid, row) {
		const internal = grid.getScrollHeightInternal(row);
		if (isDef(internal)) {
			return internal;
		}
		let h = grid[_].defaultRowHeight * grid[_].rowCount;
		grid[_].rowHeightsMap.eachAll((height) => {
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
		grid[_].handler.on(grid[_].element, 'mousedown', (e) => {
			const eventArgsSet = getCellEventArgsSet(e);
			const {abstractPos, eventArgs} = eventArgsSet;
			if (!abstractPos) {
				return;
			}
			if (eventArgs) {
				const results = grid.fireListeners(EVENT_TYPE.MOUSEDOWN_CELL, eventArgs);
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
		let doubleTapBefore = null;
		let longTouchId = null;
		grid[_].handler.on(grid[_].element, 'touchstart', (e) => {
		
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
					grid.fireListeners(EVENT_TYPE.DBLTAP_CELL, eventArgs);
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
		grid[_].handler.on(grid[_].element, 'touchcancel', cancel);
		grid[_].handler.on(grid[_].element, 'touchmove', cancel);
		grid[_].handler.on(grid[_].element, 'touchend', (e) => {
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
			grid.fireListeners(EVENT_TYPE.MOUSEENTER_CELL, cell);
			mouseEnterCell = cell;
		}
		function onMouseleaveCell() {
			const beforeMouseCell = mouseEnterCell;
			mouseEnterCell = null;
			if (beforeMouseCell) {
				grid.fireListeners(EVENT_TYPE.MOUSELEAVE_CELL, {
					col: beforeMouseCell.col,
					row: beforeMouseCell.row,
				});
			}
		}
		function onMouseoverCell(cell) {
			grid.fireListeners(EVENT_TYPE.MOUSEOVER_CELL, cell);
			mouseOverCell = cell;
		}
		function onMouseoutCell() {
			const beforeMouseCell = mouseOverCell;
			mouseOverCell = null;
			if (beforeMouseCell) {
				grid.fireListeners(EVENT_TYPE.MOUSEOUT_CELL, {
					col: beforeMouseCell.col,
					row: beforeMouseCell.row,
				});
			}
		}
		const scrollElement = grid[_].scrollable.getElement();
		grid[_].handler.on(scrollElement, 'mouseover', (e) => {
			isMouseover = true;
		});
		grid[_].handler.on(scrollElement, 'mouseout', (e) => {
			isMouseover = false;
			onMouseoutCell();
		});

		grid[_].handler.on(grid[_].element, 'mouseleave', (e) => {
			onMouseleaveCell();
		});
			
		grid[_].handler.on(grid[_].element, 'mousemove', (e) => {
			const eventArgsSet = getCellEventArgsSet(e);
			const {abstractPos, eventArgs} = eventArgsSet;
			if (eventArgs) {
				const beforeMouseCell = mouseEnterCell;
				if (beforeMouseCell) {
					grid.fireListeners(EVENT_TYPE.MOUSEMOVE_CELL, eventArgs);
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
					grid.fireListeners(EVENT_TYPE.MOUSEMOVE_CELL, eventArgs);
				}
			} else {
				onMouseoutCell();
				onMouseleaveCell();
			}
			if (grid[_].columnResizer.moving(e) || grid[_].cellSelector.moving(e)) {
				return;
			}
			const {style} = grid[_].element;
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
		grid[_].handler.on(grid[_].element, 'click', (e) => {
			if (grid[_].columnResizer.lastMoving(e) || grid[_].cellSelector.lastMoving(e)) {
				return;
			}
			if (!grid.hasListeners(EVENT_TYPE.CLICK_CELL)) {
				return;
			}
			const {eventArgs} = getCellEventArgsSet(e);
			if (!eventArgs) {
				return;
			}
			grid.fireListeners(EVENT_TYPE.CLICK_CELL, eventArgs);
		});
		grid[_].handler.on(grid[_].element, 'dblclick', (e) => {
			if (!grid.hasListeners(EVENT_TYPE.DBLCLICK_CELL)) {
				return;
			}
			const {eventArgs} = getCellEventArgsSet(e);
			if (!eventArgs) {
				return;
			}
			grid.fireListeners(EVENT_TYPE.DBLCLICK_CELL, eventArgs);
		});
		grid[_].focusControl.listen('keydown', (keyCode, e) => {
			grid.fireListeners(EVENT_TYPE.KEYDOWN, keyCode, e);
		});
		grid[_].selection.listen(EVENT_TYPE.SELECTED_CELL, (data) => {
			grid.fireListeners(EVENT_TYPE.SELECTED_CELL, data, data.selected);
		});

		grid[_].scrollable.onScroll((e) => {
			_onScroll(grid, e);
			grid.fireListeners(EVENT_TYPE.SCROLL, {event: e});
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
						const strCellValue = '' + copyCellValue;
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
		grid[_].focusControl.onInput((value) => {
			const {col, row} = grid[_].selection.select;
			grid.fireListeners(EVENT_TYPE.INPUT_CELL, {col, row, value});
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
		return new Rect(
				grid[_].scroll.left,
				grid[_].scroll.top,
				grid[_].canvas.width,
				grid[_].canvas.height
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
			if (!isTouchEvent(e)) {
				this._events.mousemove = this._handler.on(document.body, 'mousemove', (e) => this._mouseMove(e));
				this._events.mouseup = this._handler.on(document.body, 'mouseup', (e) => this._mouseUp(e));
			} else {
				this._events.touchmove = this._handler.on(document.body, 'touchmove', (e) => this._mouseMove(e), {passive: false});
				this._events.touchend = this._handler.on(document.body, 'touchend', (e) => this._mouseUp(e));
				this._events.touchcancel = this._handler.on(document.body, 'touchcancel', (e) => this._mouseUp(e));
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
			this._handler.off(this._events.mousemove);
			this._handler.off(this._events.touchmove);
			this._handler.off(this._events.mouseup);
			this._handler.off(this._events.touchend);
			// this._handler.off(this._events.mouseleave);
			this._handler.off(this._events.touchcancel);

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
			if (!cell || (this._cell.col === cell.col && this._cell.row === cell.row)) {
				return false;
			}
			_moveFocusCell(this._grid, cell.col, cell.row, true);

			//make visible
			const makeVisibleCol = (() => {
				if (cell.col < this._cell.col && 0 < cell.col) {
					// move left
					return cell.col - 1;
				} else if (this._cell.col < cell.col && cell.col + 1 < this._grid.colCount) {
					// move right
					return cell.col + 1;
				}
				return cell.col;
			})();
			const makeVisibleRow = (() => {
				if (cell.row < this._cell.row && 0 < cell.row) {
					// move up
					return cell.row - 1;
				} else if (this._cell.row < cell.row && cell.row + 1 < this._grid.rowCount) {
					// move down
					return cell.row + 1;
				}
				return cell.row;
			})();
			if (makeVisibleCol !== cell.col || makeVisibleRow !== cell.row) {
				this._grid.makeVisibleCell(makeVisibleCol, makeVisibleRow);
			}
			this._cell = cell;
			return true;
		}
		_getTargetCell(e) {
			const abstractPos = _getMouseAbstractPoint(this._grid, e);
			if (!abstractPos) {
				return null;
			}
			const cell = this._grid.getCellAt(abstractPos.x, abstractPos.y);
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

			this._grid.fireListeners(EVENT_TYPE.RESIZE_COLUMN, {col: this._targetCol});

			return true;
		}
		_upInternal(e) {
			this._grid.updateScroll();
			
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
			this._handler = new EventHandler();
			this._input = document.createElement('input');
			this._input.classList.add('grid-focus-control');
			this._input.readOnly = true;
			parentElement.appendChild(this._input);

			this._handler.on(this._input, 'compositionstart', (e) => {
				this._input.classList.add('composition');
				this._input.style.font = this._grid.font || '16px sans-serif';
				this._isComposition = true;
				grid.focus();
			});
			this._handler.on(this._input, 'compositionend', (e) => {
				this._isComposition = false;
				this._input.classList.remove('composition');
				this._input.style.font = '';
				if (!this._input.readOnly) {
					this.fireListeners('input', this._input.value);
				}
				setSafeInputValue(this._input, '');
			});
			this._handler.on(this._input, 'keypress', (e) => {
				if (this._isComposition) {
					return;
				}
				if (!this._input.readOnly && e.key && e.key.length === 1) {
					if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
						//copy! for Firefox
					} else {
						this.fireListeners('input', e.key);
						cancelEvent(e);
					}
				}
				setSafeInputValue(this._input, '');
			});
			this._handler.on(this._input, 'keydown', (e) => {
				if (this._isComposition) {
					return;
				}
				const keyCode = getKeyCode(e);
				this.fireListeners('keydown', keyCode, e);

				if (!this._input.readOnly && this._input.value) {
					// for Safari
					this.fireListeners('input', this._input.value);
				}

				setSafeInputValue(this._input, '');
			});
			const inputClear = (e) => {
				if (this._isComposition) {
					return;
				}
				setSafeInputValue(this._input, '');
			};

			this._handler.on(this._input, 'input', inputClear);
			this._handler.on(this._input, 'keyup', inputClear);
			this._handler.on(document, 'keydown', (e) => {
				if (!browser.IE) {
					return;
				}
				if (e.target !== this._input) {
					return;
				}
				const keyCode = getKeyCode(e);
				if (keyCode === KEY_ALPHA_C && e.ctrlKey) {
					setSafeInputValue(this._input, 'dummy');
					this._input.select();
					setTimeout(() => {
						setSafeInputValue(this._input, '');
					}, 100);
				}
			});
			this._handler.on(document, 'copy', (e) => {
				if (this._isComposition) {
					return;
				}
				if (!isDescendantElement(parentElement, e.target)) {
					return;
				}
				setSafeInputValue(this._input, '');
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
		focus() {
			// this._input.value = '';
			this._input.focus();
		}
		setFocusRect(rect) {
			const top = this._scrollable.calcTop(rect.top);
			this._input.style.top = (top - style.getScrollBarSize()).toFixed() + 'px';//position:relative だとずれるが、IEは position:relativeじゃないと最大値まで利用できない
			this._input.style.left = rect.left.toFixed() + 'px';
			this._input.style.width = rect.width.toFixed() + 'px';
			this._input.style.height = rect.height.toFixed() + 'px';
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
			this._inputStatus = {};
			const atts = el.attributes;
			for (let i = 0, n = atts.length; i < n; i++) {
				const att = atts[i];
				this._inputStatus[att.name] = att.value;
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
			const startCol = Math.min(this._start.col, this._end.col);
			const startRow = Math.min(this._start.row, this._end.row);
			const endCol = Math.max(this._start.col, this._end.col);
			const endRow = Math.max(this._start.row, this._end.row);
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
		get select() {
			return {
				col: this._sel.col,
				row: this._sel.row
			};
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
					this.fireListeners(EVENT_TYPE.SELECTED_CELL, before);
					this.fireListeners(EVENT_TYPE.SELECTED_CELL, after);
				} finally {
					this._isWraped = false;
				}
			}
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
			if (this._mode === 0) {
				return this._drawRect;
			} else {
				const absoluteRect = this._grid.getCellRect(this._col, this._row);
				return this._toRelativeDrawRect(absoluteRect);
			}
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
				const drawRect = this._toRelativeDrawRect(absoluteRect);
				const context = new DrawCellContext(
						this._col, this._row, this.getContext(), rect, drawRect, this.drawing, this._selection,
						this._drawLayers
				);
				// toCurrentContext は自分の toCurrentContextを呼ばせる
				context.toCurrentContext = this.toCurrentContext.bind(this);
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
			this[_] = {};
			style.initDocument();
			this[_].element = createRootElement();
			this[_].scrollable = new Scrollable();
			this[_].handler = new EventHandler();
			this[_].selection = new Selection(this);
			this[_].focusControl = new FocusControl(this, this[_].scrollable.getElement(), this[_].scrollable);

			this[_].canvas = hiDPI.transform(document.createElement('canvas'));
			this[_].context = this[_].canvas.getContext('2d', {alpha: false});

			this[_].rowCount = rowCount;
			this[_].colCount = colCount;
			this[_].frozenColCount = frozenColCount;
			this[_].frozenRowCount = frozenRowCount;

			this[_].defaultRowHeight = defaultRowHeight;
			this[_].defaultColWidth = defaultColWidth;

			this[_].font = font;
			this[_].underlayBackgroundColor = underlayBackgroundColor;

			/////
			this[_].rowHeightsMap = new NumberMap();
			this[_].colWidthsMap = new NumberMap();
			this[_].colWidthsLimit = {};
			this[_].calcWidthContext = {
				_: this[_],
				get full() {
					return this._.canvas.width;
				},
				get em() {
					return getFontSize(this._.context, this._.font).width;
				}
			};

			this[_].columnResizer = new ColumnResizer(this);
			this[_].cellSelector = new CellSelector(this);

			this[_].drawCells = {};

			this[_].element.appendChild(this[_].canvas);
			this[_].element.appendChild(this[_].scrollable.getElement());
			this.updateScroll();
			if (parentElement) {
				parentElement.appendChild(this[_].element);
				this.updateSize();
			} else {
				this.updateSize();
			}
			_bindEvents(this);
		}
		getElement() {
			return this[_].element;
		}
		get canvas() {
			return this[_].canvas;
		}
		focus() {
			const {col, row} = this[_].selection.select;
			this.focusCell(col, row);
		}
		get selection() {
			return this[_].selection;
		}
		get rowCount() {
			return this[_].rowCount;
		}
		set rowCount(rowCount) {
			this[_].rowCount = rowCount;
			this.updateScroll();
		}
		get colCount() {
			return this[_].colCount;
		}
		set colCount(colCount) {
			this[_].colCount = colCount;
			this.updateScroll();
		}
		get frozenColCount() {
			return this[_].frozenColCount;
		}
		set frozenColCount(frozenColCount) {
			this[_].frozenColCount = frozenColCount;
		}
		get frozenRowCount() {
			return this[_].frozenRowCount;
		}
		set frozenRowCount(frozenRowCount) {
			this[_].frozenRowCount = frozenRowCount;
		}
		get defaultRowHeight() {
			return this[_].rowCount;
		}
		set defaultRowHeight(defaultRowHeight) {
			this[_].defaultRowHeight = defaultRowHeight;
			this.updateScroll();
		}
		get defaultColWidth() {
			return this[_].defaultColWidth;
		}
		set defaultColWidth(defaultColWidth) {
			this[_].defaultColWidth = defaultColWidth;
			this.updateScroll();
		}
		get font() {
			return this[_].font;
		}
		set font(font) {
			this[_].font = font;
		}
		get underlayBackgroundColor() {
			return this[_].underlayBackgroundColor;
		}
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
		updateSize() {
			//スタイルをクリアしてサイズ値を取得
			this[_].canvas.style.width = '';
			this[_].canvas.style.height = '';
			const width = Math.floor(this[_].canvas.offsetWidth ||
					this[_].canvas.parentElement.offsetWidth - style.getScrollBarSize()/*for legacy*/
			);
			const height = Math.floor(this[_].canvas.offsetHeight ||
					this[_].canvas.parentElement.offsetHeight - style.getScrollBarSize()/*for legacy*/
			);

			this[_].canvas.width = width;
			this[_].canvas.height = height;

			//整数で一致させるためstyleをセットして返す
			this[_].canvas.style.width = `${width}px`;
			this[_].canvas.style.height = `${height}px`;

			const sel = this[_].selection.select;
			this[_].focusControl.setFocusRect(this.getCellRect(sel.col, sel.row));
		}
		updateScroll() {
			this[_].scrollable.setScrollSize(_getScrollWidth(this), _getScrollHeight(this));
			this[_].scroll = {
				left: this[_].scrollable.scrollLeft,
				top: this[_].scrollable.scrollTop,
			};
		}
		getRowHeight(row) {
			return _getRowHeight(this, row);
		}
		setRowHeight(row, height) {
			_setRowHeight(this, row, height);
			this.updateScroll();
		}
		getColWidth(col) {
			return _getColWidth(this, col);
		}
		setColWidth(col, width) {
			_setColWidth(this, col, width);
			this.updateScroll();
		}
		getMaxColWidth(col) {
			const obj = this[_].colWidthsLimit[col];
			return obj && obj.max || undefined;
		}
		setMaxColWidth(col, maxwidth) {
			const obj = this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
			obj.max = maxwidth;
		}
		getMinColWidth(col) {
			const obj = this[_].colWidthsLimit[col];
			return obj && obj.min || undefined;
		}
		setMinColWidth(col, minwidth) {
			const obj = this[_].colWidthsLimit[col] || (this[_].colWidthsLimit[col] = {});
			obj.min = minwidth;
		}
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
		getCellRelativeRect(col, row) {
			return _toRelativeRect(this, this.getCellRect(col, row));
		}
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
			const isFrozenRow = this[_].frozenRowCount > 0 && row < this[_].frozenRowCount;
			const isFrozenCol = this[_].frozenColCount > 0 && col < this[_].frozenColCount;
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
			if (!isFrozenCell || !isFrozenCell.col) {
				if (rect.left < visibleRect.left) {
					this[_].scrollable.scrollLeft -= visibleRect.left - rect.left;
				} else if (visibleRect.right < rect.right) {
					this[_].scrollable.scrollLeft -= visibleRect.right - rect.right;
				}
			}
			if (!isFrozenCell || !isFrozenCell.row) {
				if (rect.top < visibleRect.top) {
					this[_].scrollable.scrollTop -= visibleRect.top - rect.top;
				} else if (visibleRect.bottom < rect.bottom) {
					this[_].scrollable.scrollTop -= visibleRect.bottom - rect.bottom;
				}
			}
		}
		focusCell(col, row) {
			const oldEditMode = this[_].focusControl.editMode;
			if (oldEditMode) {
				this[_].focusControl.resetInputStatus();
			}

			this[_].focusControl.setFocusRect(this.getCellRect(col, row));
			
			const {col: selCol, row: selRow} = this[_].selection.select;
			const results = this.fireListeners(
					EVENT_TYPE.EDITABLEINPUT_CELL,
					{col: selCol, row: selRow}
			);
			
			const editMode = (array.findIndex(results, (v) => !!v) >= 0);
			this[_].focusControl.editMode = editMode;
			
			if (editMode) {
				this[_].focusControl.storeInputStatus();
				this[_].focusControl.setDefaultInputStatus();
				this.fireListeners(
						EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL,
						{col: selCol, row: selRow, input: this[_].focusControl.input}
				);
			}

			// Failure occurs in IE if focus is not last
			this[_].focusControl.focus();
		}
		invalidateCell(col, row) {
			this.invalidateGridRect(col, row);
		}
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

				if (this[_].frozenColCount > 0 && endCol >= this[_].frozenColCount) {
					const frozenRect = _getFrozenColsRect(this);
					if (frozenRect.intersection(invalidateTarget)) {
						invalidateTarget.left = Math.min(frozenRect.right - 1, frozenRect.right);
					}
				}

				if (this[_].frozenRowCount > 0 && endRow >= this[_].frozenRowCount) {
					const frozenRect = _getFrozenRowsRect(this);
					if (frozenRect.intersection(invalidateTarget)) {
						invalidateTarget.top = Math.min(frozenRect.bottom - 1, invalidateTarget.top);
					}
				}

				_invalidateRect(this, invalidateTarget);
			}
		}
		invalidate() {
			const visibleRect = _getVisibleRect(this);
			_invalidateRect(this, visibleRect);
		}
		/**
		 * get cell value at copy action
		 * <p>
		 * Please implement
		 * </p>
		 *
		 * @protected
		 * @param  {number} col Column index of cell.
		 * @param  {number} row Row index of cell.
		 * @return {string}
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
		addDisposable(disposable) {
			if (!disposable || !disposable.dispose || typeof disposable.dispose !== 'function') {
				throw new Error('not disposable!');
			}
			const disposables = this[_].disposables = this[_].disposables || [];
			disposables.push(disposable);
		}
		dispose() {
			super.dispose();
			this[_].handler.dispose();
			this[_].scrollable.dispose();
			this[_].focusControl.dispose();
			this[_].columnResizer.dispose();
			this[_].cellSelector.dispose();
			if (this[_].disposables) {
				this[_].disposables.forEach((disposable) => disposable.dispose());
				this[_].disposables = null;
			}

			const {parentElement} = this[_].element;
			if (parentElement) {
				parentElement.removeChild(this[_].element);
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
}