'use strict';
{
	const Symbol = window.Symbol ? window.Symbol : (() => {
		let nextId = 1;
		return (name) => {
			const id = nextId++;
			if (name) {
				return ` $$$ ${name} - ${id} $$$ `;
			} else {
				return ` $$$ ${id} $$$ `;
			}
		};
	})();
	const mem = {};

	module.exports = {
		get(name) {
			if (name) {
				return mem[name] ? mem[name] : (mem[name] = Symbol(name));
			} else {
				return Symbol();
			}
		},
		get PROTECTED_SYMBOL() {
			return this.get('protected');
		},
		get CHECK_COLUMN_STATE_ID() {
			return this.get('chkcol.stateID');
		},
		get BUTTON_COLUMN_STATE_ID() {
			return this.get('btncol.stateID');
		},
		get COLUMN_FADEIN_STATE_ID() {
			return this.get('col.fadein_stateID');
		},
		get BRANCH_GRAPH_COLUMN_STATE_ID() {
			return this.get('branch_graph_col.stateID');
		},
		get SMALL_DIALOG_INPUT_EDITOR_STATE_ID() {
			return this.get('small_dialog_input_editor.stateID');
		},
		get INLINE_INPUT_EDITOR_STATE_ID() {
			return this.get('inline_input_editor.stateID');
		},
		get INLINE_MENU_EDITOR_STATE_ID() {
			return this.get('inline_menu_editor.stateID');
		}
	};

}