'use strict';

const BaseAction = require('./action/BaseAction');
const SortHeaderAction = require('./action/SortHeaderAction');
const CheckHeaderAction = require('./action/CheckHeaderAction');

class ImmutableSortHeaderAction extends SortHeaderAction {
	get disabled() {
		return this._disabled;
	}
}
class ImmutableCheckHeaderAction extends CheckHeaderAction {
	get disabled() {
		return this._disabled;
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
		SORT: new ImmutableSortHeaderAction(),
		CHECK: new ImmutableCheckHeaderAction(),
	},
	get BaseAction() {
		return BaseAction;
	},
	get SortHeaderAction() {
		return SortHeaderAction;
	},
	get CheckHeaderAction() {
		return CheckHeaderAction;
	},
	of(headerAction) {
		if (!headerAction) {
			return undefined;
		} else if (typeof headerAction === 'string') {
			return action.ACTIONS[headerAction.toUpperCase()] || action.of(null);
		} else {
			return headerAction;
		}
	},
	ofCell(headerCell) {
		if (headerCell.sort) {
			if (headerCell.sort === 'function') {
				// 0.9.0 Backward compatibility
				const sort = ({order, col, grid}) => headerCell.sort(order, col, grid);
				return new ImmutableSortHeaderAction({sort});
			}
			return action.ACTIONS.SORT;
		}
		return action.of(headerCell.action);
	}
};
module.exports = action;
