'use strict';

const Editor = require('./Editor');
const {EVENT_TYPE: {
	INPUT_CELL,
	EDITABLEINPUT_CELL,
	SELECTED_CELL,
	DBLCLICK_CELL,
	DBLTAP_CELL,
	KEYDOWN,
	MODIFY_STATUS_EDITABLEINPUT_CELL,
	SCROLL
}} = require('../../core/DrawGrid');
const KEY_ENTER = 13;
const KEY_F2 = 113;

class BaseInputEditor extends Editor {
	constructor(option = {}) {
		super(option);
	}
	clone() {
		return new BaseInputEditor(this);
	}
	onInputCellInternal(grid, cell, inputValue) {
		throw new Error();
	}
	onOpenCellInternal(grid, cell) {
		throw new Error();
	}
	onChangeSelectCellInternal(grid, cell, selected) {
		throw new Error();
	}
	onSetInputAttrsInternal(grid, cell, input) {
		throw new Error();
	}
	onGridScrollInternal(grid) {
		throw new Error();
	}
	bindGridEvent(grid, col, util) {
		const open = (cell) => {
			if (this.readOnly || this.disabled) {
				return;
			}
			this.onOpenCellInternal(grid, cell);
		};

		const input = (cell, value) => {
			if (this.readOnly || this.disabled) {
				return;
			}
			this.onInputCellInternal(grid, cell, value);
		};
		return [
			grid.listen(INPUT_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				input({
					col: e.col,
					row: e.row
				}, e.value);
			}),
			grid.listen(DBLCLICK_CELL, (cell) => {
				if (!util.isTarget(cell.col, cell.row)) {
					return;
				}
				open({
					col: cell.col,
					row: cell.row
				});
			}),
			grid.listen(DBLTAP_CELL, (e) => {
				if (!util.isTarget(e.col, e.row)) {
					return;
				}
				open({
					col: e.col,
					row: e.row
				});

				e.event.preventDefault();
				e.event.stopPropagation();
			}),
			grid.listen(KEYDOWN, (keyCode, e) => {
				if (keyCode !== KEY_F2 && keyCode !== KEY_ENTER) {
					return;
				}
				const sel = grid.selection.select;
				if (!util.isTarget(sel.col, sel.row)) {
					return;
				}
				open({
					col: sel.col,
					row: sel.row
				});
			}),
			grid.listen(SELECTED_CELL, (e) => {
				this.onChangeSelectCellInternal(grid, {col: e.col, row: e.row}, e.selected);
			}),
			grid.listen(SCROLL, () => {
				this.onGridScrollInternal(grid);
			}),
			grid.listen(EDITABLEINPUT_CELL, (cell) => {
				if (!util.isTarget(cell.col, cell.row)) {
					return false;
				}
				if (this.readOnly || this.disabled) {
					return false;
				}
				return true;
			}),
			grid.listen(MODIFY_STATUS_EDITABLEINPUT_CELL, (cell) => {
				if (!util.isTarget(cell.col, cell.row)) {
					return;
				}
				if (this.readOnly || this.disabled) {
					return;
				}
				this.onSetInputAttrsInternal(grid, {
					col: cell.col,
					row: cell.row
				}, cell.input);
			}),

		];
	}
}

module.exports = BaseInputEditor;
