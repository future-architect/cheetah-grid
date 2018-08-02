'use strict';

const BaseTooltip = require('./BaseTooltip');
const TooltipElement = require('./internal/TooltipElement');

class Tooltip extends BaseTooltip {
	createTooltipElementInternal() {
		return new TooltipElement();
	}
}

module.exports = Tooltip;