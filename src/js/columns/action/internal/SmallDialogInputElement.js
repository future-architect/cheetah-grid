'use strict';
const {
	event: {
		getKeyCode,
		cancel: cancelEvent,
	},
} = require('../../../internal/utils');
	
const EventHandler = require('../../../internal/EventHandler');

const CLASSNAME = 'cheetah-grid__small-dialog-input';
const INPUT_CLASSNAME = CLASSNAME + '__input';

const KEY_ENTER = 13;
const KEY_ESC = 27;

function _focus(input, handler) {
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
	handler.tryWithOffEvents(input, 'blur', () => {
		focus();
	});
}

function createElement() {
	require('./SmallDialogInputElement.css');
	const element = document.createElement('div');
	element.classList.add(CLASSNAME);
	const input = document.createElement('input');
	input.classList.add(INPUT_CLASSNAME);
	element.classList.remove('show');
	element.classList.add('hide');
	input.readonly = true;
	input.tabIndex = -1;
	element.appendChild(input);
	return element;
}

function bindProps(grid, dialog, input, editor) {
	const {classList, helperText} = editor;
	if (classList) {
		dialog.classList.add(...classList);
	}
	if (helperText && typeof helperText !== 'function') {
		dialog.dataset.helperText = helperText;
	}
	setInputAttrs(editor, grid, input);
}

function unbindProps(grid, dialog, input, editor) {
	const {classList} = editor;
	if (classList) {
		dialog.classList.remove(...classList);
	}
	delete dialog.dataset.helperText;
	input.type = '';
}

function setInputAttrs(editor, grid, input) {
	const {type} = editor;
	input.type = type || '';
}

class SmallDialogInputElement {
	static setInputAttrs(...args) {
		setInputAttrs(...args);
	}
	constructor() {
		this._handler = new EventHandler();
		this._dialog = createElement();
		this._input = this._dialog.querySelector('.' + INPUT_CLASSNAME);
		this._bindDialogEvents();
	}
	dispose() {
		this.detach();
		this._handler.dispose();
		this._dialog = null;
		this._input = null;
		this._beforePropEditor = null;
	}
	attach(grid, editor, col, row, value) {
		const handler = this._handler;
		const dialog = this._dialog;
		const input = this._input;

		if (this._beforePropEditor) {
			unbindProps(grid, dialog, input, this._beforePropEditor);
		}

		delete dialog.dataset.errorMessage;
		dialog.classList.remove('show');
		dialog.classList.add('hide');
		input.readonly = false;
		input.tabIndex = 0;
		const {element, rect} = grid.getAttachCellArea(col, row);
		dialog.style.top = rect.top.toFixed() + 'px';
		dialog.style.left = rect.left.toFixed() + 'px';
		dialog.style.width = rect.width.toFixed() + 'px';
		dialog.style.height = rect.height.toFixed() + 'px';
		element.appendChild(dialog);
			
		input.value = value;
		input.style.font = grid.font || '16px sans-serif';
		const activeData = {grid, col, row, editor};
		this._onInputValue(input, activeData);
		_focus(input, handler);
		dialog.classList.add('show');
		dialog.classList.remove('hide');
		input.readonly = true;

		
		bindProps(grid, dialog, input, editor);

		this._activeData = activeData;
		this._beforePropEditor = editor;
	}
	detach(gridFocus) {
		if (this._isActive()) {
			const dialog = this._dialog;
			const input = this._input;

			dialog.classList.remove('show');
			dialog.classList.add('hide');
			input.readonly = false;
			input.tabIndex = -1;

			const {grid, col, row} = this._activeData;
			
			grid.invalidateCell(col, row);
			if (gridFocus) {
				grid.focus();
			}
		}
		this._activeData = null;
		this._beforeValue = null;
	}
	_doChangeValue() {
		if (!this._isActive()) {
			return false;
		}
		const input = this._input;
		const value = input.value;
		if (!this._validate(value)) {
			return false;
		}
		const {grid, col, row} = this._activeData;
		grid.doChangeValue(col, row, () => value);
		return true;
	}
	_isActive() {
		const dialog = this._dialog;
		if (!dialog || !dialog.parentElement) {
			return false;
		}
		if (!this._activeData) {
			return false;
		}
		return true;
	}
	_bindDialogEvents() {
		const handler = this._handler;
		const dialog = this._dialog;
		const input = this._input;
		const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
		handler.on(dialog, 'click', stopPropagationOnly);
		handler.on(dialog, 'dblclick', stopPropagationOnly);
		handler.on(dialog, 'mousedown', stopPropagationOnly);
		handler.on(dialog, 'touchstart', stopPropagationOnly);
			
		handler.on(input, 'compositionstart', (e) => {
			input.classList.add('composition');
		});
		handler.on(input, 'compositionend', (e) => {
			input.classList.remove('composition');
			this._onInputValue(input);
		});
		const onKeyupAndPress = (e) => {
			if (input.classList.contains('composition')) {
				return;
			}
			this._onInputValue(input);
		};
		handler.on(input, 'keyup', onKeyupAndPress);
		handler.on(input, 'keypress', onKeyupAndPress);
		handler.on(input, 'keydown', (e) => {
			if (input.classList.contains('composition')) {
				return;
			}
			const keyCode = getKeyCode(e);
			if (keyCode === KEY_ESC) {
				this.detach(true);
				cancelEvent(e);
			} else if (keyCode === KEY_ENTER) {
				if (this._doChangeValue()) {
					this.detach(true);
				}
				cancelEvent(e);
			} else {
				this._onInputValue(input);
			}
		});
	}
	_onInputValue(input, activeData) {
		const before = this._beforeValue;
		const value = input.value;
		if (before !== value) {
			this._onInputValueChange(value, before, activeData);
		}
		this._beforeValue = value;
	}
	_onInputValueChange(after, before, activeData) {
		activeData = activeData || this._activeData;
		const dialog = this._dialog;
		const {grid, col, row, editor} = activeData;
		if (typeof editor.helperText === 'function') {
			const helperText = editor.helperText(after, {grid, col, row});
			if (helperText) {
				dialog.dataset.helperText = helperText;
			} else {
				delete dialog.dataset.helperText;
			}
		}
		if (dialog.hasAttribute('data-error-message')) {
			this._validate(after, true);
		}
	}
	_validate(value, inputOnly) {
		const dialog = this._dialog;
		const {grid, col, row, editor} = this._activeData;
		let message = null;
		if (editor.inputValidator) {
			message = editor.inputValidator(value, {grid, col, row});
		}
		if (!message && editor.validator && !inputOnly) {
			message = editor.validator(value, {grid, col, row});
		}
		if (message) {
			dialog.dataset.errorMessage = message;
			return false;
		} else {
			delete dialog.dataset.errorMessage;
			return true;
		}
	}
}

module.exports = SmallDialogInputElement;