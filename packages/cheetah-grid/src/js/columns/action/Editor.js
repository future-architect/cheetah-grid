'use strict';


const BaseAction = require('./BaseAction');
class Editor extends BaseAction {
	constructor(option = {}) {
		super(option);
		this._readOnly = option.readOnly;
	}
	get readOnly() {
		return this._readOnly;
	}
	set readOnly(readOnly) {
		this._readOnly = !!readOnly;
		this.onChangeReadOnlyInternal();
	}
	clone() {
		return new Editor(this);
	}
	onChangeReadOnlyInternal() {}
}
module.exports = Editor;
