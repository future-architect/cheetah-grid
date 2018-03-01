'use strict';
const {
	isDef,
	event: {
		getKeyCode,
		cancel: cancelEvent,
	}
} = require('../../../internal/utils');

const EventHandler = require('../../../internal/EventHandler');
	
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESC = 27;

const CLASSNAME = 'cheetah-grid__inline-menu';
const ITEM_CLASSNAME = CLASSNAME + '__menu-item';
const HIDDEN_CLASSNAME = CLASSNAME + '--hidden';
const SHOWN_CLASSNAME = CLASSNAME + '--shown';
const EMPTY_ITEM_CLASSNAME = ITEM_CLASSNAME + '--empty';

function findItemParents(target) {
	let el = target;
	while (!el.classList.contains(ITEM_CLASSNAME)) {
		el = el.parentElement;
		if (!el || el.classList.contains(CLASSNAME)) {
			return undefined;
		}
	}
	return el;
}

function isFocusable(el) {
	return isDef(el.tabIndex) && el.tabIndex > -1;
}
function findPrevFocusable(el) {
	let n = el.previousSibling;
	while (n && !isFocusable(n)) {
		n = n.previousSibling;
	}
	return n;
}
function findNextFocusable(el) {
	let n = el.nextSibling;
	while (n && !isFocusable(n)) {
		n = n.nextSibling;
	}
	return n;
}

function createMenuElement() {
	require('./InlineMenuElement.css');
	const rootElement = document.createElement('ul');
	rootElement.classList.add(CLASSNAME);
	return rootElement;
}
function attachElement(element, rect, menu) {
	menu.style.top = rect.top.toFixed() + 'px';
	menu.style.left = rect.left.toFixed() + 'px';
	menu.style.width = rect.width.toFixed() + 'px';
	menu.style['line-height'] = rect.height.toFixed() + 'px';
	element.appendChild(menu);
}

function openMenu(grid, editor, col, row, value, menu) {
	const {options, classList} = editor;
	menu.classList.remove(SHOWN_CLASSNAME);
	menu.classList.add(HIDDEN_CLASSNAME);
	menu.innerHTML = '';
	menu.style.font = grid.font || '16px sans-serif';
	let emptyItemEl = null;
	let valueItemEl = null;
		
	options.forEach((option, i) => {
		const item = document.createElement('li');
		item.classList.add(ITEM_CLASSNAME);
		item.tabIndex = 0;
		item.dataset.valueindex = i;
		if (option.classList) {
			item.classList.add(...(Array.isArray(option.classList) ? option.classList : [option.classList]));
		}

		const caption = document.createElement('span');
		caption.textContent = option.caption;

		item.appendChild(caption);
		menu.appendChild(item);
		if (option.value === value) {
			valueItemEl = item;
			item.dataset.select = true;
		}
		if (option.value === '' || !isDef(option.value)) {
			item.classList.add(EMPTY_ITEM_CLASSNAME);
			emptyItemEl = item;
		}
	});
	const focusEl = valueItemEl || emptyItemEl || menu.children[0];
	if (classList) {
		menu.classList.add(...classList);
	}
	const children = Array.prototype.slice.call(menu.children, 0);
	const focusIndex = children.indexOf(focusEl);
	const {element, rect} = grid.getAttachCellArea(col, row);

	// Cover the right line
	rect.width++;

	// append for calculation
	attachElement(element, rect, menu);

	// Make the selection item at the middle
	let offset = 0;
	for (let i = 0; i < focusIndex; i++) {
		offset += children[i].offsetHeight;
	}
	rect.offsetTop(-offset);
	menu.style['transform-origin'] = `center ${offset + Math.ceil(children[focusIndex].offsetHeight / 2)}px 0px`;
	attachElement(element, rect, menu);

	// Control not to overflow the screen range
	const menuClientRect = menu.getBoundingClientRect();
	let menuTop = menuClientRect.top;
	const menuBottom = menuClientRect.top + menuClientRect.height;
	const winBottom = window.innerHeight;
	if (menuBottom > winBottom) {
		const diff = menuBottom - winBottom;
		menuTop -= diff;
	}
	if (menuTop < 0/*winTop*/) {
		menuTop = 0;
	}
	if (menuTop !== menuClientRect.top) {
		rect.offsetTop(-(menuClientRect.top - menuTop));
		// re update
		attachElement(element, rect, menu);
	}
		
	if (focusEl) {
		focusEl.focus();
	}
	menu.classList.remove(HIDDEN_CLASSNAME);
	menu.classList.add(SHOWN_CLASSNAME);
}

function closeMenu(grid, col, row, menu, valueindex) {
	menu.classList.remove(SHOWN_CLASSNAME);
	menu.classList.add(HIDDEN_CLASSNAME);
	offFocusable(menu);
}

function offFocusable(el) {
	el.tabIndex = -1;
	Array.prototype.slice.call(el.children, 0).forEach(offFocusable);
}


class InlineMenuElement {
	constructor() {
		this._handler = new EventHandler();
		this._menu = createMenuElement();
		this._bindMenuEvents();
	}
	dispose() {
		this.detach();
		this._handler.dispose();
		this._menu = null;
		this._beforePropEditor = null;
	}
	attach(grid, editor, col, row, value) {
		const menu = this._menu;

		if (this._beforePropEditor) {
			const {classList} = this._beforePropEditor;
			if (classList) {
				menu.classList.remove(...classList);
			}
		}

		openMenu(grid, editor, col, row, value, menu);
		this._activeData = {grid, col, row, editor};
		this._beforePropEditor = editor;
	}
	detach(gridFocus, valueindex) {
		if (this._isActive()) {
			const {grid, col, row} = this._activeData;
			const menu = this._menu;
			closeMenu(grid, col, row, menu, valueindex);

			grid.invalidateCell(col, row);
			if (gridFocus) {
				grid.focus();
			}
		}
		this._activeData = null;
	}
	_doChangeValue(valueindex) {
		if (!this._isActive()) {
			return;
		}
		const {grid, col, row, editor} = this._activeData;
		const value = editor.options[valueindex].value;
		grid.doChangeValue(col, row, () => value);
	}
	_isActive() {
		const menu = this._menu;
		if (!menu || !menu.parentElement) {
			return false;
		}
		if (!this._activeData) {
			return false;
		}
		return true;
	}
	_bindMenuEvents() {
		const handler = this._handler;
		const menu = this._menu;

		const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
		
		handler.on(menu, 'mousedown', stopPropagationOnly);
		handler.on(menu, 'touchstart', stopPropagationOnly);
		handler.on(menu, 'dblclick', stopPropagationOnly);

		handler.on(menu, 'click', (e) => {
			e.stopPropagation();
			const item = findItemParents(e.target);
			if (!item) {
				return;
			}
			const valueindex = item.dataset.valueindex;
			this._doChangeValue(item.dataset.valueindex);
			this.detach(true, valueindex);
		});
		handler.on(menu, 'keydown', (e) => {
			const item = findItemParents(e.target);
			if (!item) {
				return;
			}
			const keyCode = getKeyCode(e);
			if (keyCode === KEY_ENTER) {
				const valueindex = item.dataset.valueindex;
				this._doChangeValue(valueindex);
				this.detach(true, valueindex);
				cancelEvent(e);
			} else if (keyCode === KEY_ESC) {
				this.detach(true);
				cancelEvent(e);
			} else if (keyCode === KEY_UP) {
				const n = findPrevFocusable(item);
				if (n) {
					n.focus();
					cancelEvent(e);
				}
			} else if (keyCode === KEY_DOWN) {
				const n = findNextFocusable(item);
				if (n) {
					n.focus();
					cancelEvent(e);
				}
			} else if (keyCode === KEY_TAB) {
				if (!e.shiftKey) {
					if (!findNextFocusable(item)) {
						let n = menu.querySelector('.' + ITEM_CLASSNAME);
						if (!isFocusable(n)) {
							n = findNextFocusable(n);
						}
						if (n) {
							n.focus();
							cancelEvent(e);
						}
					}
				} else {
					if (!findPrevFocusable(item)) {
						const items = menu.querySelectorAll('.' + ITEM_CLASSNAME);
						let n = items[items.length - 1];
						if (!isFocusable(n)) {
							n = findPrevFocusable(n);
						}
						if (n) {
							n.focus();
							cancelEvent(e);
						}
					}
				}
			}
		});
	}
}

module.exports = InlineMenuElement;