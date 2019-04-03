'use strict';

const {bindCellClickAction, bindCellKeyAction} = require('./actionBind');
const {isDisabledRecord} = require('./action-utils');

const BaseAction = require('./BaseAction');

class Action extends BaseAction {
	constructor(option = {}) {
		super(option);
		this._action = option.action;
	}
	get action() {
		return this._action;
	}
	set action(action) {
		this._action = action;
	}
	clone() {
		return new Action(this);
	}
	getState(grid) {
		return {};
	}
	bindGridEvent(grid, col, util) {
		const state = this.getState(grid);
		const action = (cell) => {
			if (isDisabledRecord(this.disabled, grid, cell.row)) {
				return;
			}
			const record = grid.getRowRecord(cell.row);
			this._action(record);
		};

		return [
			...bindCellClickAction(grid, col, util, {
				action,
				mouseOver: (e) => {
					if (isDisabledRecord(this.disabled, grid, e.row)) {
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
				action
			})
		];
	}
}

module.exports = Action;
