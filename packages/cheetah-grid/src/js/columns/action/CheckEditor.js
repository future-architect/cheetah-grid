'use strict';

const {
	obj: {setReadonly},
	isPromise,
	event: {
		cancel: cancelEvent,
	},
} = require('../../internal/utils');
const {bindCellClickAction, bindCellKeyAction} = require('./actionBind');
const animate = require('../../internal/animate');

const Editor = require('./Editor');
const {CHECK_COLUMN_STATE_ID} = require('../../internal/symbolManager');

const {EVENT_TYPE: {
	PASTE_CELL,
}} = require('../../core/DrawGrid');

const KEY_ENTER = 13;
const KEY_SPACE = 32;

function toggleValue(val) {
	if (typeof val === 'number') {
		if (val === 0) {
			return 1;
		} else {
			return 0;
		}
	} else if (typeof val === 'string') {
		if (val === 'false') {
			return 'true';
		} else if (val === 'off') {
			return 'on';
		} else if (val.match(/^0+$/)) {
			return val.replace(/^(0*)0$/, '$11');
		} else if (val === 'true') {
			return 'false';
		} else if (val === 'on') {
			return 'off';
		} else if (val.match(/^0*1$/)) {
			return val.replace(/^(0*)1$/, '$10');
		}
	}
	return !val;
}

class CheckEditor extends Editor {
	clone() {
		return new CheckEditor(this);
	}
	bindGridEvent(grid, col, util) {
		if (!grid[CHECK_COLUMN_STATE_ID]) {
			setReadonly(grid, CHECK_COLUMN_STATE_ID, {});
		}
		const state = grid[CHECK_COLUMN_STATE_ID];

		const action = (cell) => {
			const cellKey = `${cell.col}:${cell.row}`;
			const blockKey = `${cellKey}::block`;
			const elapsedKey = `${cellKey}::elapsed`;
			if (this.readOnly || this.disabled || state[blockKey]) {
				return;
			}
			const ret = grid.doChangeValue(cell.col, cell.row, toggleValue);
			if (ret) {

				const onChange = () => {
					// checkbox animation
					animate(200, (point) => {
						if (point === 1) {
							delete state[elapsedKey];
						} else {
							state[elapsedKey] = point;
						}
						grid.invalidateCell(cell.col, cell.row);
					});
				};
				if (isPromise(ret)) {
					state[blockKey] = true;
					ret.then(() => {
						delete state[blockKey];
						onChange();
					});
				} else {
					onChange();
				}
			}
		};
		return [
			...bindCellClickAction(grid, col, util, {
				action,
				mouseOver: (e) => {
					if (this.disabled) {
						return false;
					}
					state.mouseActiveCell = {
						col: e.col,
						row: e.row
					};
					grid.invalidateCell(e.col, e.row);
					return true;
				},
				mouseOut: (e) => {
					delete state.mouseActiveCell;
					grid.invalidateCell(e.col, e.row);
				},
			}),
			...bindCellKeyAction(grid, col, util, {
				action: (e) => {
					const selrange = grid.selection.range;
					const {col} = grid.selection.select;
					for (let {row} = selrange.start; row <= selrange.end.row; row++) {
						if (!util.isTarget(col, row)) {
							continue;
						}
						action({
							col,
							row,
						});
					}
				},
				acceptKeys: [KEY_ENTER, KEY_SPACE],
			}),

			// paste value
			grid.listen(PASTE_CELL, (e) => {
				if (e.multi) {
					// ignore multi cell values
					return;
				}
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				const pasteValue = e.normalizeValue.trim();
				grid.doGetCellValue(e.col, e.row, (value) => {
					const newValue = toggleValue(value);
					if (`${newValue}`.trim() === pasteValue) {
						cancelEvent(e.event);

						action({
							col: e.col,
							row: e.row,
						});
					}
				});
			}),
		];
	}
}

module.exports = CheckEditor;
