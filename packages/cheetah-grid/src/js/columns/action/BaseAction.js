'use strict';


class BaseAction {
	constructor(option = {}) {
		this._disabled = option.disabled;
	}
	get disabled() {
		return this._disabled;
	}
	set disabled(disabled) {
		this._disabled = disabled;
		this.onChangeDisabledInternal();
	}
	clone() {
		return new BaseAction(this);
	}
	bindGridEvent(grid, col, util) {
		return [];
	}
	onChangeDisabledInternal() {}
}
module.exports = BaseAction;
