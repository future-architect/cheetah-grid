'use strict';
const {obj: {setReadonly}} = require('../../internal/utils');
	
const SmallDialogInputElement = require('./internal/SmallDialogInputElement');
const {SMALL_DIALOG_INPUT_EDITOR_STATE_ID: _} = require('../../internal/symbolManager');

let globalElement = null;
let bindGridCount = 0;
function attachInput(grid, cell, editor, value) {
	if (!grid[_]) {
		setReadonly(grid, _, {});
	}
	if (!globalElement) {
		globalElement = new SmallDialogInputElement();
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
function detachInput() {
	if (globalElement) {
		globalElement.detach();
	}
}
const BaseInputEditor = require('./BaseInputEditor');
class SmallDialogInputEditor extends BaseInputEditor {
	constructor(option = {}) {
		super(option);
		this._helperText = option.helperText;
		this._inputValidator = option.inputValidator;
		this._validator = option.validator;
		this._classList = option.classList;
		this._type = option.type;
	}
	dispose() {
		this._inputDialogManager.dispose();
		this._inputDialogManager = null;
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
	get helperText() {
		return this._helperText;
	}
	get inputValidator() {
		return this._inputValidator;
	}
	get validator() {
		return this._validator;
	}
	clone() {
		return new SmallDialogInputEditor(this);
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
		// cancel input
		detachInput();
	}
	onGridScrollInternal(grid) {
		// cancel input
		detachInput();
	}
	onChangeDisabledInternal() {
		// cancel input
		detachInput();
	}
	onChangeReadOnlyInternal() {
		// cancel input
		detachInput();
	}
	onSetInputAttrsInternal(grid, cell, input) {
		SmallDialogInputElement.setInputAttrs(this, grid, input);
	}
}

module.exports = SmallDialogInputEditor;