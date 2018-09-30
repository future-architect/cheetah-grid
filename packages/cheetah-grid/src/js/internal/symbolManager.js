'use strict';

const Symbol = window.Symbol ? window.Symbol : (() => {
	function random() {
		const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const cl = c.length;
		let r = '';
		for (let i = 0; i < 10; i++) {
			r += c[Math.floor(Math.random() * cl)];
		}
		return r;
	}
	return (name) => {
		if (name) {
			return `#${name}_${random()}`;
		} else {
			return `#_${random()}`;
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

