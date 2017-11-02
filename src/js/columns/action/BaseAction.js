'use strict';
{
	

	class BaseAction {
		constructor(option = {}) {
			this._disabled = option.disabled;
		}
		get disabled() {
			return this._disabled;
		}
		set disabled(disabled) {
			this._disabled = !!disabled;
		}
		clone() {
			return new BaseAction(this);
		}
		bindGridEvent(grid, col, util) {
			return [];
		}
	}
	module.exports = BaseAction;
}