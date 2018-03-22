'use strict';
const {
	event: {
		getKeyCode,
		cancel: cancelEvent,
	},
} = require('../../../internal/utils');
	
const EventHandler = require('../../../internal/EventHandler');
const {
	createElement,
} = require('../../../internal/dom');
const KEY_ENTER = 13;

const CLASSNAME = 'cheetah-grid__inline-input';

function createInputElement() {
	require('./InlineInputElement.css');
	return createElement('input', {classList: CLASSNAME});
}

function setInputAttrs(editor, grid, input) {
	const {classList, type} = editor;
	if (classList) {
		input.classList.add(...classList);
	}
	input.type = type || '';
}

class InlineInputElement {
	static setInputAttrs(...args) {
		setInputAttrs(...args);
	}
	constructor() {
		this._handler = new EventHandler();
		this._input = createInputElement();
		this._bindInputEvents();
	}
	dispose() {
		this.detach();
		this._handler.dispose();
		this._input = null;
		this._beforePropEditor = null;
	}
	attach(grid, editor, col, row, value) {
		const input = this._input;
		const handler = this._handler;

		if (this._beforePropEditor) {
			const {classList} = this._beforePropEditor;
			if (classList) {
				input.classList.remove(...classList);
			}
		}

		input.style.font = grid.font || '16px sans-serif';

		const {element, rect} = grid.getAttachCellArea(col, row);
		input.style.top = rect.top.toFixed() + 'px';
		input.style.left = rect.left.toFixed() + 'px';
		input.style.width = rect.width.toFixed() + 'px';
		input.style.height = rect.height.toFixed() + 'px';
		element.appendChild(input);

		setInputAttrs(editor, grid, input);
		input.value = value;

		this._activeData = {grid, col, row, editor};
		this._beforePropEditor = editor;

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
	detach(gridFocus) {
		if (this._isActive()) {
			const {grid, col, row} = this._activeData;
			const input = this._input;
			this._handler.tryWithOffEvents(input, 'blur', () => {
				input.parentElement.removeChild(input);
			});
			grid.invalidateCell(col, row);
			if (gridFocus) {
				grid.focus();
			}
		}
		this._activeData = null;
	}
	doChangeValue() {
		if (!this._isActive()) {
			return;
		}
		const input = this._input;
		const {value} = input;
		const {grid, col, row} = this._activeData;
		grid.doChangeValue(col, row, () => value);
	}
	_isActive() {
		const input = this._input;
		if (!input || !input.parentElement) {
			return false;
		}
		if (!this._activeData) {
			return false;
		}
		return true;
	}
	_bindInputEvents() {
		const handler = this._handler;
		const input = this._input;
		const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
		handler.on(input, 'click', stopPropagationOnly);
		handler.on(input, 'mousedown', stopPropagationOnly);
		handler.on(input, 'touchstart', stopPropagationOnly);
		handler.on(input, 'dblclick', stopPropagationOnly);
		
		handler.on(input, 'compositionstart', (e) => {
			input.classList.add('composition');
		});
		handler.on(input, 'compositionend', (e) => {
			input.classList.remove('composition');
		});
		handler.on(input, 'keydown', (e) => {
			if (input.classList.contains('composition')) {
				return;
			}
			if (getKeyCode(e) === KEY_ENTER) {
				if (!this._isActive()) {
					return;
				}
				const {grid} = this._activeData;

				this.doChangeValue();
				if (grid) {
					grid.focus();
				}
				this.detach();
				cancelEvent(e);
			}
		});
		handler.on(input, 'blur', (e) => {
			this.doChangeValue();
			this.detach();
		});
	}
}

module.exports = InlineInputElement;