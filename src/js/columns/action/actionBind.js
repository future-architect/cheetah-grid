'use strict';
{
	
	const {isPromise, event: {cancel}} = require('../../internal/utils');
	const {EVENT_TYPE: {
		CLICK_CELL,
		MOUSEENTER_CELL,
		MOUSELEAVE_CELL,
		KEYDOWN,
	}} = require('../../core/DrawGrid');
	function bindCellClickAction(grid, col, util, {
		action,
		mouseEnter,
		mouseLeave
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
			grid.listen(MOUSEENTER_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				if (isPromise(grid.getRowRecord(e.row))) {
					return;
				}
				if (mouseEnter) {
					if (!mouseEnter({
						col: e.col,
						row: e.row
					})) {
						return;
					}
				}
				grid.getElement().style.cursor = 'pointer';
			}),
			grid.listen(MOUSELEAVE_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				if (mouseLeave) {
					mouseLeave({
						col: e.col,
						row: e.row
					});
				}
				grid.getElement().style.cursor = '';
			}),
		];
	}
	function bindCellKeyAction(grid, col, util, {action, acceptKeys = []}) {
		acceptKeys = [...acceptKeys, 13];
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