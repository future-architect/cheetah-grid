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

	class InputDialogManager {
		constructor({validator, inputValidator, classList, type, message} = {}) {
			this._handler = new EventHandler();
			this._validator = validator;
			this._inputValidator = inputValidator;
			this._classList = classList;
			this._type = type;
			this._message = message;
		}
		dispose() {
			this.detach();
			this._handler.dispose();
		}
		renderElement() {
			const element = document.createElement('div');
			element.classList.add('cheetah-grid__small-dialog-input-editor-dialog');
			const input = document.createElement('input');
			input.classList.add('cheetah-grid__small-dialog-input-editor-dialog__input');
			if (this._classList) {
				element.classList.add(this._classList);
			}
			input.type = this._type || '';
			if (this._labelMessage && typeof this._labelMessage !== 'function') {
				element.setAttribute('data-message', this._labelMessage);
			}
			element.appendChild(input);
			this._bindEvents(element, input);
			return element;
		}
		setCloseStylesInternal(element, input) {
			element.style.padding = '0';// amination
			input.readonly = true;
			const transitionProp = document.defaultView.getComputedStyle(element, '')['transition-property'];
			return transitionProp && transitionProp.indexOf('padding') > -1;
		}
		setOpenStylesInternal(element, input) {
			element.style.padding = '';// amination
			input.readonly = false;
		}
		attach(grid, col, row, value) {
			this._active = true;
			this._attachInfo = {grid, col, row};

			const rect = grid.getCellRect(col, row);
			const element = this.getElementInternal();
			element.removeAttribute('data-error-message');
			const input = this.getInputInternal();
			this.setCloseStylesInternal(element, input);
			grid.appendChildElement(element, rect);
			
			input.value = value;
			input.style.font = grid.font || '16px sans-serif';
			this._onInputValue(input);
			this._focus(input);
			this.setOpenStylesInternal(element, input);
		}
		detach(gridFocus) {
			this._active = false;
			if (!this._attachInfo) {
				return;
			}
			if (this._element) {
				const input = this.getInputInternal();
				const element = this.getElementInternal();

				if (this.setCloseStylesInternal(element, input) !== false) {
					if (!this._handler.hasListener(element, 'transitionend')) {
						this._handler.on(element, 'transitionend', () => {
							if (this._active) {
								return;
							}
							if (element.parentElement) {
								this._handler.tryWithOffEvents(input, 'blur', () => {
									element.parentElement.removeChild(element);
								});
							}
						});
					}
				} else {
					this._handler.tryWithOffEvents(input, 'blur', () => {
						element.parentElement.removeChild(element);
					});
				}
			}
			const {grid, col, row} = this._attachInfo;
			grid.invalidateCell(col, row);
			if (gridFocus) {
				grid.focus();
			}
			this._attachInfo = null;
		}
		getElementInternal() {
			return this._element || (this._element = this.renderElement());
		}
		getInputInternal() {
			return this.getElementInternal().getElementsByTagName('input')[0];
		}
		doChangeCellValueInternal() {
			if (!this._attachInfo) {
				return false;
			}
			const input = this.getInputInternal();
			const value = input.value;
			if (!this._validate(value)) {
				return false;
			}
			
			const {grid, col, row} = this._attachInfo;
			grid.doChangeValue(col, row, () => value);
			return true;
		}
		setInputAttrsInternal(input) {
			input.type = this._type || '';
		}
		_validate(value, inputOnly) {
			const {grid, col, row} = this._attachInfo;
			const element = this.getElementInternal();
			let message = null;
			if (this._inputValidator) {
				message = this._inputValidator(value, {grid, col, row});
			}
			if (!message && this._validator && !inputOnly) {
				message = this._validator(value, {grid, col, row});
			}
			if (message) {
				element.setAttribute('data-error-message', message);
				return false;
			} else {
				element.removeAttribute('data-error-message');
				return true;
			}
		}
		_onInputValueChange(after, before) {
			const element = this.getElementInternal();
			if (typeof this._message === 'function') {
				const {grid, col, row} = this._attachInfo;
				const message = this._message(after, {grid, col, row});
				if (message) {
					element.setAttribute('data-message', message);
				} else {
					element.removeAttribute('data-message');
				}
			}
			if (element.hasAttribute('data-error-message')) {
				this._validate(after, true);
			}
		}
		_onInputValue(input) {
			const before = this._beforeValue;
			const value = input.value;
			if (before !== value) {
				this._onInputValueChange(value, before);
			}
			this._beforeValue = value;
		}
		_bindEvents(element, input) {
			const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
			this._handler.on(element, 'click', stopPropagationOnly);
			this._handler.on(element, 'mousedown', stopPropagationOnly);
			this._handler.on(element, 'dblclick', stopPropagationOnly);
			this._handler.on(input, 'compositionstart', (e) => {
				input.classList.add('composition');
			});
			this._handler.on(input, 'compositionend', (e) => {
				input.classList.remove('composition');
				this._onInputValue(input);
			});
			const onKeyupAndPress = (e) => {
				if (input.classList.contains('composition')) {
					return;
				}
				this._onInputValue(input);
			};
			this._handler.on(input, 'keyup', onKeyupAndPress);
			this._handler.on(input, 'keypress', onKeyupAndPress);
			this._handler.on(input, 'keydown', (e) => {
				if (input.classList.contains('composition')) {
					return;
				}
				const keyCode = getKeyCode(e);
				if (keyCode === 27) {
					this.detach(true);
					cancelEvent(e);
				} else if (keyCode === 13) {
					if (this.doChangeCellValueInternal()) {
						this.detach(true);
					}
					cancelEvent(e);
				} else {
					this._onInputValue(input);
				}
			});
		}
		_focusGrid() {
			const {grid} = this._attachInfo || {};
			if (grid) {
				grid.focus();
			}
		}
		_focus(input) {
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
			this._handler.tryWithOffEvents(input, 'blur', () => {
				focus();
			});
		}
	}
	function createDefaultInputDialogManager(option) {
		const {
			validator,
			inputValidator,
			classList,
			type,
			message
		} = option;
		return new InputDialogManager({
			validator,
			inputValidator,
			classList,
			type,
			message
		});
	}
	class SmallDialogInputEditor extends BaseInputEditor {
		static get InputDialogManager() {
			return InputDialogManager;
		}
		constructor(option = {}) {
			super(option);
			this._inputDialogManager = option.inputDialogManager || createDefaultInputDialogManager(option);
		}
		get inputDialogManager() {
			return this._inputDialogManager;
		}
		set inputDialogManager(inputDialogManager) {
			this._inputDialogManager = inputDialogManager;
		}
		clone() {
			return new SmallDialogInputEditor(this);
		}
		onInputCellInternal(grid, cell, inputValue) {
			this._inputDialogManager.attach(grid, cell.col, cell.row, inputValue);
		}
		onOpenCellInternal(grid, cell) {
			grid.doGetCellValue(cell.col, cell.row, (value) => {
				this._inputDialogManager.attach(grid, cell.col, cell.row, value);
			});
		}
		onChangeSelectCellInternal(grid, cell, selected) {
			// cancel input
			this._inputDialogManager.detach();
		}
		onGridScrollInternal(grid) {
			// cancel input
			this._inputDialogManager.detach();
		}
		onSetInputAttrsInternal(grid, cell, input) {
			this._inputDialogManager.setInputAttrsInternal(input);
		}
	}

	module.exports = SmallDialogInputEditor;
}