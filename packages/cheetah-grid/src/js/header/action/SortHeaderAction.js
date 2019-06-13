'use strict';

const {bindCellClickAction} = require('./actionBind');

const BaseAction = require('./BaseAction');
const {obj: {isObject}} = require('../../internal/utils');

class SortHeaderAction extends BaseAction {
	constructor(option = {}) {
		super(option);
		this._sort = option.sort;
	}
	get sort() {
		return this._sort;
	}
	set sort(sort) {
		this._sort = sort;
		this.onChangeDisabledInternal();
	}
	clone() {
		return new SortHeaderAction(this);
	}
	_executeSort(newState, grid) {
		if (typeof this._sort === 'function') {
			this._sort({
				order: newState.order,
				col: newState.col,
				grid
			});
		} else {
			let field = grid.getField(newState.col);
			if (isObject(field) && field.get && field.set) {
				field = field.get;
			}
			grid.dataSource.sort(grid.getField(newState.col), newState.order);
		}
	}
	bindGridEvent(grid, range) {
		const action = (cell) => {
			if (this.disabled) {
				return;
			}
			const state = grid.sortState;
			let newState;
			if (range.isCellInRange(state.col, cell.row)) {
				newState = {
					col: range.startCol,
					row: range.startRow,
					order: state.order === 'asc' ? 'desc' : 'asc'
				};
			} else {
				newState = {
					col: range.startCol,
					row: range.startRow,
					order: 'asc'
				};
			}
			grid.sortState = newState;
			this._executeSort(newState, grid);
			grid.invalidateGridRect(0, 0, grid.colCount - 1, grid.rowCount - 1);
		};

		return [
			...bindCellClickAction(grid, range, {
				action,
				mouseOver: (e) => {
					if (this.disabled) {
						return false;
					}
					return true;
				},
			})
		];
	}
}

module.exports = SortHeaderAction;
