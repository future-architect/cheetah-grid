'use strict';

const BaseAction = require('./action/BaseAction');
const Action = require('./action/Action');
const Editor = require('./action/Editor');
const CheckEditor = require('./action/CheckEditor');
const ButtonAction = require('./action/ButtonAction');
const SmallDialogInputEditor = require('./action/SmallDialogInputEditor');
const InlineInputEditor = require('./action/InlineInputEditor');
const InlineMenuEditor = require('./action/InlineMenuEditor');

class ImmutableCheckEditor extends CheckEditor {
	get disabled() {
		return this._disabled;
	}
	get readOnly() {
		return this._readOnly;
	}
}
class ImmutableInputEditor extends SmallDialogInputEditor {
	get disabled() {
		return this._disabled;
	}
	get readOnly() {
		return this._readOnly;
	}
}

/**
 * column actions
 * @type {Object}
 * @namespace cheetahGrid.columns.action
 * @memberof cheetahGrid.columns
 */
const action = {
	ACTIONS: {
		CHECK: new ImmutableCheckEditor(),
		INPUT: new ImmutableInputEditor(),
	},
	get BaseAction() {
		return BaseAction;
	},
	get Editor() {
		return Editor;
	},
	get Action() {
		return Action;
	},
	get CheckEditor() {
		return CheckEditor;
	},
	get ButtonAction() {
		return ButtonAction;
	},
	get SmallDialogInputEditor() {
		return SmallDialogInputEditor;
	},
	get InlineInputEditor() {
		return InlineInputEditor;
	},
	get InlineMenuEditor() {
		return InlineMenuEditor;
	},
	of(columnAction) {
		if (!columnAction) {
			return undefined;
		} else if (typeof columnAction === 'string') {
			return action.ACTIONS[columnAction.toUpperCase()] || action.of(null);
		} else {
			return columnAction;
		}
	},
};
module.exports = action;
