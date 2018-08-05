'use strict';

class BaseTooltip {
	constructor(grid) {
		this._grid = grid;
	}
	dispose() {
		this.detachTooltipElement();
		if (this._tooltipElement) {
			this._tooltipElement.dispose();
		}
		this._tooltipElement = null;
	}
	_getTooltipElement() {
		return this._tooltipElement || (this._tooltipElement = this.createTooltipElementInternal());
	}
	createTooltipElementInternal() {

	}
	attachTooltipElement(col, row, content) {
		const tooltipElement = this._getTooltipElement();
		tooltipElement.attach(this._grid, col, row, content);
	}
	moveTooltipElement(col, row) {
		const tooltipElement = this._getTooltipElement();
		tooltipElement.move(this._grid, col, row);
	}
	detachTooltipElement() {
		const tooltipElement = this._getTooltipElement();
		tooltipElement._detach();
	}
}

module.exports = BaseTooltip;