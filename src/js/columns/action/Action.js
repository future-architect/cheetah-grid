'use strict';
{
	
	const {bindCellClickAction, bindCellKeyAction} = require('./actionBind');

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
				if (this.disabled) {
					return;
				}
				const record = grid.getRowRecord(cell.row);
				this._action(record);
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
					action
				})
			];
		}
	}

	module.exports = Action;
}