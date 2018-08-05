'use strict';

const {
	SELECTED_CELL,
	SCROLL,
	CHANGED_VALUE,
	MOUSEOVER_CELL,
	MOUSEOUT_CELL
} = require('../list-grid/EVENT_TYPE');
const Tooltip = require('./Tooltip');

const TOOLTIP_INSTANCE_FACTORY = {
	'overflow-text'(grid) {
		return new Tooltip(grid);
	},
};

function getTooltipInstanceInfo(grid, col, row) {
	//
	// overflow text tooltip
	const overflowText = grid.getCellOverflowText(col, row);
	if (overflowText) {
		return {
			type: 'overflow-text',
			content: overflowText
		};
	}
	return null;
}

class TooltipHandler {
	constructor(grid) {
		this._grid = grid;
		this._tooltipInstances = {};
		this._bindGridEvent(grid);
	}
	dispose() {
		const tooltipInstances = this._tooltipInstances;
		for (const k in tooltipInstances) {
			tooltipInstances[k].dispose();
		}
		this._tooltipInstances = null;
	}
	_attach(col, row) {
		const info = this._attachInfo;
		const instanceInfo = this._getTooltipInstanceInfo(col, row);
		if (info && (!instanceInfo || info.instance !== instanceInfo.instance)) {
			info.instance.detachTooltipElement();
			this._attachInfo = null;
		}
		if (!instanceInfo) {
			return;
		}
		const {instance} = instanceInfo;
		instance.attachTooltipElement(col, row, instanceInfo.content);
		this._attachInfo = {col, row, instance};
	}
	_move(col, row) {
		const info = this._attachInfo;
		if (!info || info.col !== col || info.row !== row) {
			return;
		}
		const {instance} = info;
		instance.moveTooltipElement(col, row);
	}
	_detach() {
		const info = this._attachInfo;
		if (!info) {
			return;
		}
		const {instance} = info;
		instance.detachTooltipElement();
		this._attachInfo = null;
	}
	_isAttachCell(col, row) {
		const info = this._attachInfo;
		if (!info) {
			return false;
		}
		return (info.col === col && info.row === row);
	}
	_bindGridEvent(grid) {
		grid.listen(MOUSEOVER_CELL, (e) => {
			this._attach(e.col, e.row);
		});
		grid.listen(MOUSEOUT_CELL, (e) => {
			this._detach();
		});
		grid.listen(SELECTED_CELL, (e) => {
			if (this._isAttachCell(e.col, e.row)) {
				this._detach(e);
			}
		});
		grid.listen(SCROLL, () => {
			const info = this._attachInfo;
			if (!info) {
				return;
			}
			this._move(info.col, info.row);
		});
		grid.listen(CHANGED_VALUE, (e) => {
			if (this._isAttachCell(e.col, e.row)) {
				this._detach();
				this._attach(e.col, e.row);
			}
		});
	}
	_getTooltipInstanceInfo(col, row) {
		const grid = this._grid;
		const tooltipInstances = this._tooltipInstances;
		const info = getTooltipInstanceInfo(grid, col, row);
		if (!info) {
			return null;
		}
		const {type} = info;
		const instance = tooltipInstances[type] || (tooltipInstances[type] = TOOLTIP_INSTANCE_FACTORY[type](grid));
		return {
			instance,
			type,
			content: info.content
		};
	}
}

module.exports = TooltipHandler;