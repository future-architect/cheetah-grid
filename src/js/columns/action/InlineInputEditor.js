'use strict';

const {obj: {setReadonly}} = require('../../internal/utils');
const BaseInputEditor = require('./BaseInputEditor');
const InlineInputElement = require('./internal/InlineInputElement');
const {INLINE_INPUT_EDITOR_STATE_ID: _} = require('../../internal/symbolManager');

	
let globalElement = null;
let bindGridCount = 0;
function attachInput(grid, cell, editor, value) {
	if (!grid[_]) {
		setReadonly(grid, _, {});
	}
	if (!globalElement) {
		globalElement = new InlineInputElement();
	}
	const state = grid[_];
	if (!state.element) {
		state.element = globalElement;
		bindGridCount++;
		grid.addDisposable({
			dispose() {
				bindGridCount--;
				if (!bindGridCount) {
					globalElement.dispose();
					globalElement = null;
				}
			}
		});
	}

	globalElement.attach(grid, editor, cell.col, cell.row, value);
}
function detachInput(gridFocus) {
	if (globalElement) {
		globalElement.detach(gridFocus);
	}
}
function doChangeValue(grid) {
	if (globalElement) {
		globalElement.doChangeValue();
	}
}


class InlineInputEditor extends BaseInputEditor {
	constructor(option = {}) {
		super(option);
		this._classList = option.classList;
		this._type = option.type;
	}
	get classList() {
		return this._classList && (Array.isArray(this._classList) ? this._classList : [this._classList]);
	}
	set classList(classList) {
		this._classList = classList;
	}
	get type() {
		return this._type;
	}
	set type(type) {
		this._type = type;
	}
	clone() {
		return new InlineInputEditor(this);
	}
	onInputCellInternal(grid, cell, inputValue) {
		attachInput(grid, cell, this, inputValue);
	}
	onOpenCellInternal(grid, cell) {
		grid.doGetCellValue(cell.col, cell.row, (value) => {
			attachInput(grid, cell, this, value);
		});
	}
	onChangeSelectCellInternal(grid, cell, selected) {
		doChangeValue(grid);
		detachInput();
	}
	onGridScrollInternal(grid) {
		doChangeValue(grid);
		detachInput(true);
	}
	onChangeDisabledInternal() {
		// cancel input
		detachInput(true);
	}
	onChangeReadOnlyInternal() {
		// cancel input
		detachInput(true);
	}
	onSetInputAttrsInternal(grid, cell, input) {
		InlineInputElement.setInputAttrs(this, grid, input);
	}
}

module.exports = InlineInputEditor;