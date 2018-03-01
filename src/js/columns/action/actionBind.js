'use strict';
{
	
	const {isPromise, event: {cancel}} = require('../../internal/utils');
	const {EVENT_TYPE: {
		CLICK_CELL,
		MOUSEOVER_CELL,
		MOUSEOUT_CELL,
		KEYDOWN,
	}} = require('../../core/DrawGrid');
	const KEY_ENTER = 13;
	function bindCellClickAction(grid, col, util, {
		action,
		mouseOver,
		mouseOut
	}) {
		return [
			// click
			grid.listen(CLICK_CELL, (e) => {
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
			grid.listen(MOUSEOVER_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				if (isPromise(grid.getRowRecord(e.row))) {
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
			}),
			grid.listen(MOUSEOUT_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				if (mouseOut) {
					mouseOut({
						col: e.col,
						row: e.row
					});
				}
				grid.getElement().style.cursor = '';
			}),
		];
	}
	function bindCellKeyAction(grid, col, util, {action, acceptKeys = []}) {
		acceptKeys = [...acceptKeys, KEY_ENTER];
		return [
			// enter key down
			grid.listen(KEYDOWN, (keyCode, e) => {
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
				cancel(e);
			}),

		];
	}

	module.exports = {
		bindCellClickAction,
		bindCellKeyAction,
	};
}