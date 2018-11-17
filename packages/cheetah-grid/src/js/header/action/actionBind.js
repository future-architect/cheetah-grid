'use strict';

const {event: {cancel}} = require('../../internal/utils');
const {EVENT_TYPE: {
	CLICK_CELL,
	MOUSEOVER_CELL,
	MOUSEOUT_CELL,
	MOUSEMOVE_CELL,
	KEYDOWN,
}} = require('../../core/DrawGrid');
const KEY_ENTER = 13;
function bindCellClickAction(grid, range, {
	action,
	mouseOver,
	mouseOut
}) {
	let inMouse;
	return [
		// click
		grid.listen(CLICK_CELL, (e) => {
			if (!range.isCellInRange(e.col, e.row)) {
				return;
			}
			action({
				col: e.col,
				row: e.row
			});
		}),
		// mouse move
		grid.listen(MOUSEOVER_CELL, (e) => {
			if (!range.isCellInRange(e.col, e.row)) {
				return;
			}
			if (mouseOver) {
				if (!mouseOver({
					col: e.col,
					row: e.row
				})) {
					return;
				}
			}
			grid.getElement().style.cursor = 'pointer';
			inMouse = true;
		}),
		//横からMOUSEENTERした場合、'col-resize'の処理と競合するのでmoveを監視して処理する
		grid.listen(MOUSEMOVE_CELL, (e) => {
			if (!range.isCellInRange(e.col, e.row)) {
				return;
			}
			if (inMouse && !grid.getElement().style.cursor) {
				grid.getElement().style.cursor = 'pointer';
			}
		}),
		grid.listen(MOUSEOUT_CELL, (e) => {
			if (!range.isCellInRange(e.col, e.row)) {
				return;
			}
			if (mouseOut) {
				mouseOut({
					col: e.col,
					row: e.row
				});
			}
			grid.getElement().style.cursor = '';
			inMouse = false;
		}),
	];
}
function bindCellKeyAction(grid, range, {action, acceptKeys = []}) {
	acceptKeys = [...acceptKeys, KEY_ENTER];
	return [
		// enter key down
		grid.listen(KEYDOWN, (keyCode, e) => {
			if (acceptKeys.indexOf(keyCode) === -1) {
				return;
			}
			const sel = grid.selection.select;
			if (!range.isCellInRange(sel.col, sel.row)) {
				return;
			}
			action({
				col: sel.col,
				row: sel.row
			});
			cancel(e);
		}),

	];
}

module.exports = {
	bindCellClickAction,
	bindCellKeyAction,
};
