'use strict';

const {extend} = require('../internal/utils');
const DrawGrid = require('../core/DrawGrid');
const EVENT_TYPE = extend(DrawGrid.EVENT_TYPE, {
	CHANGED_VALUE: 'changed_value',
});
module.exports = EVENT_TYPE;