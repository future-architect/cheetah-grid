'use strict';
{
	const {
		event: {
			getKeyCode,
			cancel: cancelEvent,
		},
	} = require('../../internal/utils');
	
	const BaseInputEditor = require('./BaseInputEditor');
	const EventHandler = require('../../internal/EventHandler');
	
	const globalState = {};
	const inputHandler = new EventHandler();

	function bindInputElementEvent(input) {
		inputHandler.on(input, 'click', (e) => {
			// gridにイベントが伝播しないように
			e.stopPropagation();
		});
		inputHandler.on(input, 'mousedown', (e) => {
			// gridにイベントが伝播しないように
			e.stopPropagation();
		});
		inputHandler.on(input, 'compositionstart', (e) => {
			input.classList.add('composition');
		});
		inputHandler.on(input, 'compositionend', (e) => {
			input.classList.remove('composition');
		});
		inputHandler.on(input, 'keypress', (e) => {
		});
		inputHandler.on(input, 'keydown', (e) => {
			if (input.classList.contains('composition')) {
				return;
			}
			if (getKeyCode(e) === 13) {
				doChangeValue();
				if (globalState.bindGrid) {
					globalState.bindGrid.focus();
				}
				removeInputElement();
				cancelEvent(e);
			}
		});
		inputHandler.on(input, 'blur', (e) => {
			doChangeValue();
			removeInputElement();
		});
	}

	function createInputElement() {
		const input = document.createElement('input');
		input.classList.add('cheetah-grid__inline-input-editor__input');
		bindInputElementEvent(input);
		return input;
	}
	function getInputElement() {
		return globalState.input || (globalState.input = createInputElement());
	}
	function removeInputElement() {
		const input = getActiveInput();
		if (input) {
			inputHandler.tryWithOffEvents(input, 'blur', () => {
				input.parentElement.removeChild(input);
				const classList = globalState.bindEditorInstance.classList;
				if (classList) {
					input.classList.remove(classList);
				}
			});
			const {col, row} = globalState.bindCell;
			globalState.bindGrid.invalidateCell(col, row);
		}
		globalState.bindGrid = null;
		globalState.bindCell = null;
		globalState.bindEditorInstance = null;
	}
	function bindInputElement(grid, cell, editorInstance, value) {
		const rect = grid.getCellRect(cell.col, cell.row);
		const input = getInputElement();
		input.style.font = grid.font || '16px sans-serif';
		grid.appendChildElement(input, rect);

		setInputAttrs(editorInstance, grid, input);
		input.value = value;
		globalState.bindGrid = grid;
		globalState.bindCell = cell;
		globalState.bindEditorInstance = editorInstance;

		const focus = () => {
			input.focus();

			const end = input.value.length;
			try {
				if (typeof (input.selectionStart) !== 'undefined') {
					input.selectionStart = end;
					input.selectionEnd = end;
					return;
				}
			} catch (e) {
				//ignore
			}
			if (document.selection) {
				const range = input.createTextRange();
				range.collapse();
				range.moveEnd('character', end);
				range.moveStart('character', end);
				range.select();
			}
		};
		inputHandler.tryWithOffEvents(input, 'blur', () => {
			focus();
		});
	}
	function getActiveInput() {
		const input = globalState.input;
		if (!input || !input.parentElement) {
			return undefined;
		}
		const grid = globalState.bindGrid;
		if (!grid) {
			return undefined;
		}
		const cell = globalState.bindCell;
		if (!cell) {
			return undefined;
		}
		return input;
	}
	function doChangeValue() {
		const input = getActiveInput();
		if (!input) {
			return;
		}
		const value = input.value;
		const grid = globalState.bindGrid;
		const cell = globalState.bindCell;
		grid.doChangeValue(cell.col, cell.row, () => value);
	}
	function setInputAttrs(inputEditor, grid, input) {
		const classList = inputEditor.classList;
		if (classList) {
			input.classList.add(classList);
		}
		input.type = inputEditor.type || '';
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
			bindInputElement(grid, cell, this, inputValue);
		}
		onOpenCellInternal(grid, cell) {
			grid.doGetCellValue(cell.col, cell.row, (value) => {
				bindInputElement(grid, cell, this, value);
			});
		}
		onChangeSelectCellInternal(grid, cell, selected) {
			doChangeValue();
			removeInputElement();
		}
		onGridScrollInternal(grid) {
			doChangeValue();
			removeInputElement();
		}
		onSetInputAttrsInternal(grid, cell, input) {
			setInputAttrs(this, grid, input);
		}
	}

	module.exports = InlineInputEditor;
}