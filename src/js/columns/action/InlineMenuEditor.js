'use strict';
{
	const {
		event: {
			getKeyCode,
			cancel: cancelEvent,
		},
		isDef,
	} = require('../../internal/utils');
	const {normalize} = require('../../internal/menu-items');
	
	const Editor = require('./Editor');
	const EventHandler = require('../../internal/EventHandler');
	const {EVENT_TYPE: {
		SELECTED_CELL,
		CLICK_CELL,
		KEYDOWN,
		SCROLL,
		MOUSEOVER_CELL,
		MOUSEOUT_CELL,
		MOUSEMOVE_CELL,
	}} = require('../../core/DrawGrid');
	
	const KEY_TAB = 9;
	const KEY_ENTER = 13;
	const KEY_F2 = 113;
	const KEY_UP = 38;
	const KEY_DOWN = 40;
	const KEY_ESC = 27;


	let globalBindGrid;
	let globalBindCell;
	let globalBindEditor;
	let globalMenuElement;
	const handler = new EventHandler();

	function findItemParents(target) {
		let el = target;
		while (!el.classList.contains('cheetah-grid__inline-menu-editor__menu-item')) {
			el = el.parentElement;
			if (!el || el.classList.contains('cheetah-grid__inline-menu-editor')) {
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

	function bindElementEvent(element) {
		const stopPropagationOnly = (e) => e.stopPropagation();// gridにイベントが伝播しないように
		
		handler.on(element, 'mousedown', stopPropagationOnly);
		handler.on(element, 'touchstart', stopPropagationOnly);
		handler.on(element, 'dblclick', stopPropagationOnly);

		handler.on(element, 'click', (e) => {
			e.stopPropagation();
			const item = findItemParents(e.target);
			if (!item) {
				return;
			}
			input(item.dataset.valueindex);
		});
		handler.on(element, 'keydown', (e) => {
			const item = findItemParents(e.target);
			if (!item) {
				return;
			}
			const keyCode = getKeyCode(e);
			if (keyCode === KEY_ENTER) {
				input(item.dataset.valueindex);
				cancelEvent(e);
			} else if (keyCode === KEY_ESC) {
				onClose(true);
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
						let n = element.querySelector('.cheetah-grid__inline-menu-editor__menu-item');
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
						const items = element.querySelectorAll('.cheetah-grid__inline-menu-editor__menu-item');
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

	function createMenuElement() {
		const rootElement = document.createElement('ul');
		rootElement.classList.add('cheetah-grid__inline-menu-editor');
		bindElementEvent(rootElement);
		return rootElement;
	}
	function getMenuElement() {
		return globalMenuElement || (globalMenuElement = createMenuElement());
	}
	function openCellMenu(grid, cell, editor, value) {
		const {options, classList} = editor;
		const menu = getMenuElement();
		menu.classList.remove('show');
		menu.classList.add('hide');
		menu.innerHTML = '';
		menu.style.font = grid.font || '16px sans-serif';
		let emptyItemEl = null;
		let valueItemEl = null;
		
		options.forEach((option, i) => {
			const item = document.createElement('li');
			item.classList.add('cheetah-grid__inline-menu-editor__menu-item');
			item.tabIndex = 0;
			item.dataset.valueindex = i;

			const caption = document.createElement('span');
			caption.textContent = option.caption;

			item.appendChild(caption);
			menu.appendChild(item);
			if (option.value == value) { // eslint-disable-line eqeqeq
				valueItemEl = item;
				item.dataset.select = true;
			}
			if (option.value === '' || !isDef(option.value)) {
				emptyItemEl = item;
			}
		});
		const focusEl = valueItemEl || emptyItemEl || menu.children[0];
		if (classList) {
			classList.forEach((cls) => menu.classList.add(cls));
		}
		const focusIndex = Array.prototype.slice.call(menu.children, 0).indexOf(focusEl);
		const rect = grid.getCellRect(cell.col, cell.row);

		// Cover the right line
		rect.width++;

		// Make the selection item at the middle
		const lineHeight = rect.height;
		rect.offsetTop(-focusIndex * lineHeight);

		grid.appendChildElement(menu, rect, {heightStyleName: 'line-height'});

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
			grid.appendChildElement(menu, rect, {heightStyleName: 'line-height'});
		}
		
		if (focusEl) {
			focusEl.focus();
		}
		menu.classList.add('show');
		menu.classList.remove('hide');
		
		globalBindGrid = grid;
		globalBindCell = cell;
		globalBindEditor = editor;
	}
	function input(valueindex) {
		if (!globalBindGrid || !globalBindCell || !globalBindEditor) {
			return;
		}
		const editor = globalBindEditor;
		const value = editor.options[valueindex].value;
		const grid = globalBindGrid;
		const cell = globalBindCell;
		grid.doChangeValue(cell.col, cell.row, () => value);
		onClose(true);
	}

	function onOpen(editor, grid, cell) {
		grid.doGetCellValue(cell.col, cell.row, (value) => {
			openCellMenu(grid, cell, editor, value);
		});
	}
	function offFocusable(el) {
		el.tabIndex = -1;
		Array.prototype.slice.call(el.children, 0).forEach(offFocusable);
	}
	function onClose(gridFocus) {
		if (!globalBindEditor) {
			return;
		}
		const editor = globalBindEditor;
		if (globalMenuElement) {
			const {classList} = editor;
			const menu = globalMenuElement;
			if (classList) {
				classList.forEach((cls) => menu.classList.remove(cls));
			}
			menu.classList.remove('show');
			menu.classList.add('hide');
			offFocusable(menu);
		}

		const grid = globalBindGrid;
		const {col, row} = globalBindCell;
		grid.invalidateCell(col, row);
		if (gridFocus) {
			grid.focus();
		}

		globalBindGrid = null;
		globalBindCell = null;
		globalBindEditor = null;
	}

	class InlineMenuEditor extends Editor {
		constructor(option = {}) {
			super(option);
			this._classList = option.classList;
			this._options = normalize(option.options);
		}
		dispose() {
		}
		get classList() {
			return this._classList && (Array.isArray(this._classList) ? this._classList : [this._classList]);
		}
		set classList(classList) {
			this._classList = classList;
		}
		get options() {
			return this._options;
		}
		set options(options) {
			this._options = normalize(options);
		}
		clone() {
			return new InlineMenuEditor(this);
		}
		bindGridEvent(grid, col, util) {
			const open = (cell) => {
				if (this.readOnly || this.disabled) {
					return;
				}
				onOpen(this, grid, cell);
			};

			return [
				grid.listen(CLICK_CELL, (cell) => {
					if (!util.isTarget(cell.col, cell.row)) {
						return;
					}
					open({
						col: cell.col,
						row: cell.row
					});
				}),
				grid.listen(KEYDOWN, (keyCode, e) => {
					if (keyCode !== KEY_F2 && keyCode !== KEY_ENTER) {
						return;
					}
					const sel = grid.selection.select;
					if (!util.isTarget(sel.col, sel.row)) {
						return;
					}
					open({
						col: sel.col,
						row: sel.row
					});
				}),
				grid.listen(SELECTED_CELL, (cell, selected) => {
					onClose();
				}),
				grid.listen(SCROLL, () => {
					onClose();
				}),

				// mouse move
				grid.listen(MOUSEOVER_CELL, (e) => {
					if (this.readOnly || this.disabled) {
						return;
					}
					if (!util.isTarget(e.col, e.row)) {
						return;
					}
					grid.getElement().style.cursor = 'pointer';
				}),
				grid.listen(MOUSEMOVE_CELL, (e) => {
					if (this.readOnly || this.disabled) {
						return;
					}
					if (!util.isTarget(e.col, e.row)) {
						return;
					}
					if (!grid.getElement().style.cursor) {
						grid.getElement().style.cursor = 'pointer';
					}
				}),
				grid.listen(MOUSEOUT_CELL, (e) => {
					if (!util.isTarget(e.col, e.row)) {
						return;
					}
					grid.getElement().style.cursor = '';
				}),
			];
		}
	}

	module.exports = InlineMenuEditor;
}