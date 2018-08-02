'use strict';
const EventHandler = require('../../internal/EventHandler');
const {
	createElement,
} = require('../../internal/dom');

const CLASSNAME = 'cheetah-grid__tooltip-element';
const CONTENT_CLASSNAME = `${CLASSNAME}__content`;
const HIDDEN_CLASSNAME = `${CLASSNAME}--hidden`;
const SHOWN_CLASSNAME = `${CLASSNAME}--shown`;

function createTooltipDomElement() {
	require('./TooltipElement.css');
	const rootElement = createElement('div', {classList: [CLASSNAME, HIDDEN_CLASSNAME]});
	const messageElement = createElement('pre', {classList: [CONTENT_CLASSNAME]});
	rootElement.appendChild(messageElement);
	return rootElement;
}


class TooltipElement {
	constructor() {
		this._handler = new EventHandler();
		const rootElement = this._rootElement = createTooltipDomElement();
		this._messageElement = rootElement.querySelector(`.${CONTENT_CLASSNAME}`);
	}
	dispose() {
		this.detach();

		const rootElement = this._rootElement;
		if (rootElement.parentElement) {
			rootElement.parentElement.removeChild(rootElement);
		}

		this._handler.dispose();
		this._rootElement = null;
		this._messageElement = null;
	}
	attach(grid, col, row, content) {
		const rootElement = this._rootElement;
		const messageElement = this._messageElement;

		rootElement.classList.remove(SHOWN_CLASSNAME);
		rootElement.classList.add(HIDDEN_CLASSNAME);

		if (this._attachCell(grid, col, row)) {
			rootElement.classList.add(SHOWN_CLASSNAME);
			rootElement.classList.remove(HIDDEN_CLASSNAME);

			messageElement.textContent = content;
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
			// rootElement.parentElement.removeChild(rootElement);
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
				return false;//範囲外
			}
		} else {
			if (top < 0) {
				return false;//範囲外
			}
		}
		if (col >= frozenColCount && frozenColCount > 0) {
			const {rect: frozenRect} = grid.getAttachCellArea(frozenColCount - 1, row);
			if (left < frozenRect.right) {
				return false;//範囲外
			}
		} else {
			if (left < 0) {
				return false;//範囲外
			}
		}
		const {offsetHeight, offsetWidth} = element;
		if (offsetHeight < top) {
			return false;//範囲外
		}
		if (offsetWidth < left) {
			return false;//範囲外
		}

		rootElement.style.top = `${top.toFixed()}px`;
		rootElement.style.left = `${(left + width / 2).toFixed()}px`;
		rootElement.style['min-width'] = `${width.toFixed()}px`;
		if (rootElement.parentElement !== element) {
			element.appendChild(rootElement);
		}
		return true;
	}
}

module.exports = TooltipElement;