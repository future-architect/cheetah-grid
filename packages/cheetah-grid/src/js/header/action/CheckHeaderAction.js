'use strict';

const {obj: {setReadonly}} = require('../../internal/utils');
const {bindCellClickAction, bindCellKeyAction} = require('./actionBind');
const animate = require('../../internal/animate');

const BaseAction = require('./BaseAction');
const {CHECK_HEADER_STATE_ID} = require('../../internal/symbolManager');

const KEY_ENTER = 13;
const KEY_SPACE = 32;

class CheckHeaderAction extends BaseAction {
	clone() {
		return new CheckHeaderAction(this);
	}
	bindGridEvent(grid, range) {
		if (!grid[CHECK_HEADER_STATE_ID]) {
			setReadonly(grid, CHECK_HEADER_STATE_ID, {});
		}
		const state = grid[CHECK_HEADER_STATE_ID];

		const action = ({col, row}) => {
			const cellKey = `${col}:${row}`;
			const blockKey = `${cellKey}::block`;
			const elapsedKey = `${cellKey}::elapsed`;
			if (this.disabled || state[blockKey]) {
				return;
			}
			const checked = grid.getHeaderValue(col, row);
			grid.setHeaderValue(col, row, !checked);

			const onChange = () => {
				// checkbox animation
				animate(200, (point) => {
					if (point === 1) {
						delete state[elapsedKey];
					} else {
						state[elapsedKey] = point;
					}
					grid.invalidateGridRect(range.startCol, range.startRow, range.endCol, range.endRow);
				});
			};
			onChange();
		};
		return [
			...bindCellClickAction(grid, range, {
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
			...bindCellKeyAction(grid, range, {
				action,
				acceptKeys: [KEY_ENTER, KEY_SPACE],
			})
		];
	}
}

module.exports = CheckHeaderAction;
