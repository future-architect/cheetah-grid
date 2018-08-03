'use strict';

const {obj: {setReadonly}} = require('../../internal/utils');
const Action = require('./Action');
const {BUTTON_COLUMN_STATE_ID} = require('../../internal/symbolManager');
class ButtonAction extends Action {
	getState(grid) {
		if (!grid[BUTTON_COLUMN_STATE_ID]) {
			setReadonly(grid, BUTTON_COLUMN_STATE_ID, {});
		}
		return grid[BUTTON_COLUMN_STATE_ID];
	}
}

module.exports = ButtonAction;
