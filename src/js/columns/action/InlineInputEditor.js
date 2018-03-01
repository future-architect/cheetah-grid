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

	const KEY_ENTER = 13;
	
	let globalBindGrid;
	let globalBindCell;
	let globalBindEditor;
	let globalInput;

	const inputHandler = new EventHandler();

	function bindInputElementEvent(input) {
		const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
		inputHandler.on(input, 'click', stopPropagationOnly);
		inputHandler.on(input, 'mousedown', stopPropagationOnly);
		inputHandler.on(input, 'touchstart', stopPropagationOnly);
		inputHandler.on(input, 'dblclick', stopPropagationOnly);
		
		inputHandler.on(input, 'compositionstart', (e) => {
			input.classList.add('composition');
		});
		inputHandler.on(input, 'compositionend', (e) => {
			input.classList.remove('composition');
		});
		inputHandler.on(input, 'keydown', (e) => {
			if (input.classList.contains('composition')) {
				return;
			}
			if (getKeyCode(e) === KEY_ENTER) {
				doChangeValue();
				if (globalBindGrid) {
					globalBindGrid.focus();
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
		return globalInput || (globalInput = createInputElement());
	}
	function removeInputElement() {
		const input = getActiveInput();
		if (input) {
			inputHandler.tryWithOffEvents(input, 'blur', () => {
				input.parentElement.removeChild(input);
				const classList = globalBindEditor.classList;
				if (classList) {
					input.classList.remove(classList);
				}
			});
			const {col, row} = globalBindCell;
			globalBindGrid.invalidateCell(col, row);
		}
		globalBindGrid = null;
		globalBindCell = null;
		globalBindEditor = null;
	}
	function bindInputElement(grid, cell, editor, value) {
		const rect = grid.getCellRect(cell.col, cell.row);
		const input = getInputElement();
		input.style.font = grid.font || '16px sans-serif';
		grid.appendChildElement(input, rect);

		setInputAttrs(editor, grid, input);
		input.value = value;
		globalBindGrid = grid;
		globalBindCell = cell;
		globalBindEditor = editor;

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
		const input = globalInput;
		if (!input || !input.parentElement) {
			return undefined;
		}
		const grid = globalBindGrid;
		if (!grid) {
			return undefined;
		}
		const cell = globalBindCell;
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
		const grid = globalBindGrid;
		const cell = globalBindCell;
		grid.doChangeValue(cell.col, cell.row, () => value);
	}
	function setInputAttrs(editor, grid, input) {
		const {classList, type} = editor;
		if (classList) {
			input.classList.add(classList);
		}
		input.type = type || '';
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