'use strict';
const {obj: {setReadonly}} = require('../../internal/utils');
const {normalize} = require('../../internal/menu-items');

const Editor = require('./Editor');
const {EVENT_TYPE: {
	SELECTED_CELL,
	CLICK_CELL,
	KEYDOWN,
	SCROLL,
	MOUSEOVER_CELL,
	MOUSEOUT_CELL,
	MOUSEMOVE_CELL,
}} = require('../../core/DrawGrid');
const InlineMenuElement = require('./internal/InlineMenuElement');
const {INLINE_MENU_EDITOR_STATE_ID: _} = require('../../internal/symbolManager');

let globalElement = null;
let bindGridCount = 0;
function attachMenu(grid, cell, editor, value) {
	if (!grid[_]) {
		setReadonly(grid, _, {});
	}
	if (!globalElement) {
		globalElement = new InlineMenuElement();
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
function detachMenu(gridFocus) {
	if (globalElement) {
		globalElement.detach(gridFocus);
	}
}

const KEY_ENTER = 13;
const KEY_F2 = 113;

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
	onChangeDisabledInternal() {
		// cancel input
		detachMenu(true);
	}
	onChangeReadOnlyInternal() {
		// cancel input
		detachMenu(true);
	}
	bindGridEvent(grid, col, util) {
		const open = (cell) => {
			if (this.readOnly || this.disabled) {
				return;
			}
			grid.doGetCellValue(cell.col, cell.row, (value) => {
				attachMenu(grid, cell, this, value);
			});
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
			grid.listen(SELECTED_CELL, (e) => {
				detachMenu();
			}),
			grid.listen(SCROLL, () => {
				detachMenu(true);
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