'use strict';
const EventHandler = require('../../../internal/EventHandler');
const {
	createElement,
} = require('../../../internal/dom');

const CLASSNAME = 'cheetah-grid__message-element';
const MESSAGE_CLASSNAME = CLASSNAME + '__message';
const HIDDEN_CLASSNAME = CLASSNAME + '--hidden';
const SHOWN_CLASSNAME = CLASSNAME + '--shown';

function createrootElement() {
	require('./MessageElement.css');
	const element = createElement('div', {classList: [CLASSNAME, HIDDEN_CLASSNAME]});
	const message = createElement('span', {classList: [MESSAGE_CLASSNAME]});
	element.appendChild(message);
	return element;
}


class MessageElement {
	constructor() {
		this._handler = new EventHandler();
		const rootElement = this._rootElement = createrootElement();
		this._messageElement = rootElement.querySelector(`.${MESSAGE_CLASSNAME}`);
	}
	dispose() {
		this.detach();
		this._handler.dispose();
		this._rootElement = null;
		this._messageElement = null;
	}
	attach(grid, col, row, message) {
		const rootElement = this._rootElement;
		const messageElement = this._messageElement;

		rootElement.classList.remove(SHOWN_CLASSNAME);
		rootElement.classList.add(HIDDEN_CLASSNAME);

		if (this._attachCell(grid, col, row)) {
			rootElement.classList.add(SHOWN_CLASSNAME);
			rootElement.classList.remove(HIDDEN_CLASSNAME);

			messageElement.textContent = message;
		} else {
			this._detach();
		}
	}
	move(grid, col, row) {
		const rootElement = this._rootElement;
		if (this._attachCell(grid, col, row)) {

			rootElement.classList.add(SHOWN_CLASSNAME);
			rootElement.classList.remove(HIDDEN_CLASSNAME);
		} else {
			this._detach();
		}
	}
	detach() {
		this._detach();
	}
	_detach() {
		const rootElement = this._rootElement;
		if (rootElement.parentElement) {
			rootElement.parentElement.removeChild(rootElement);
			rootElement.classList.remove(SHOWN_CLASSNAME);
			rootElement.classList.add(HIDDEN_CLASSNAME);
		}
	}
	_attachCell(grid, col, row) {
		const rootElement = this._rootElement;
		const {element, rect} = grid.getAttachCellArea(col, row);

		const {bottom: top, left, width} = rect;
		const {frozenRowCount, frozenColCount} = grid;
		if (row >= frozenRowCount && frozenRowCount > 0) {
			const {rect: frozenRect} = grid.getAttachCellArea(col, frozenRowCount - 1);
			if (top < frozenRect.bottom) {
				return false;
			}
		} else {
			if (top < 0) {
				return false;
			}
		}
		if (col >= frozenColCount && frozenColCount > 0) {
			const {rect: frozenRect} = grid.getAttachCellArea(frozenColCount - 1, row);
			if (left < frozenRect.right) {
				return false;
			}
		} else {
			if (left < 0) {
				return false;
			}
		}
		const {offsetHeight, offsetWidth} = element;
		if (offsetHeight < top) {
			return false;
		}
		if (offsetWidth < left) {
			return false;
		}

		rootElement.style.top = top.toFixed() + 'px';
		rootElement.style.left = left.toFixed() + 'px';
		rootElement.style.width = width.toFixed() + 'px';
		if (rootElement.parentElement !== element) {
			element.appendChild(rootElement);
		}
		return true;
	}
}

module.exports = MessageElement;