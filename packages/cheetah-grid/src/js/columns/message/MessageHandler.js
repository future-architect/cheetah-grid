'use strict';


const {isPromise} = require('../../internal/utils');
const {
	SELECTED_CELL,
	SCROLL,
	CHANGED_VALUE,
	FOCUS_GRID,
	BLUR_GRID
} = require('../../list-grid/EVENT_TYPE');
const ErrorMessage = require('./ErrorMessage');
const WarningMessage = require('./WarningMessage');
const InfoMessage = require('./InfoMessage');

const EMPTY_MESSAGE = {
	type: 'error',
	message: undefined,
};

const MESSAGE_INSTANCE_FACTORY = {
	error(grid) {
		return new ErrorMessage(grid);
	},
	info(grid) {
		return new InfoMessage(grid);
	},
	warning(grid) {
		return new WarningMessage(grid);
	}
};

function normalizeMessage(message) {
	if (!message || isPromise(message)) {
		return EMPTY_MESSAGE;
	}
	if (typeof message === 'string') {
		return {
			type: 'error',
			message,
			original: message,
		};
	}
	const type = message.type || 'error';
	if (type && type in MESSAGE_INSTANCE_FACTORY) {
		return {
			type: type.toLowerCase(),
			message: `${message.message}`,
			original: message,
		};
	}
	return {
		type: 'error',
		message: `${message}`,
		original: message,
	};


}
function hasMessage(message) {
	return !!normalizeMessage(message).message;
}
class MessageHandler {
	constructor(grid, getMessage) {
		this._grid = grid;
		this._messageInstances = {};
		this._bindGridEvent(grid, getMessage);
	}
	dispose() {
		const messageInstances = this._messageInstances;
		for (const k in messageInstances) {
			messageInstances[k].dispose();
		}
		this._messageInstances = null;
	}
	drawCellMessage(message, context, style, helper, grid, info) {

		if (!hasMessage(message)) {
			return;
		}
		const instance = this._getMessageInstanceOfMessage(message);
		instance.drawCellMessage(message, context, style, helper, grid, info);
	}
	_attach(col, row, message) {
		const info = this._attachInfo;
		const instance = this._getMessageInstanceOfMessage(message);
		if (info && info.instance !== instance) {
			info.instance.detachMessageElement();
		}
		instance.attachMessageElement(col, row, normalizeMessage(message));
		this._attachInfo = {col, row, instance};
	}
	_move(col, row) {
		const info = this._attachInfo;
		if (!info || info.col !== col || info.row !== row) {
			return;
		}
		const {instance} = info;
		instance.moveMessageElement(col, row);
	}
	_detach() {
		const info = this._attachInfo;
		if (!info) {
			return;
		}
		const {instance} = info;
		instance.detachMessageElement();
		this._attachInfo = null;
	}
	_bindGridEvent(grid, getMessage) {
		const onSelectMessage = (sel) => {
			const message = getMessage(sel.col, sel.row);
			if (!hasMessage(message)) {
				this._detach();
			} else {
				this._attach(sel.col, sel.row, message);
			}

		};
		grid.listen(SELECTED_CELL, (e) => {
			if (!e.selected) {
				return;
			}
			if (e.before.col === e.col && e.before.row === e.row) {
				return;
			}
			onSelectMessage(e);
		});
		grid.listen(SCROLL, () => {
			const sel = grid.selection.select;
			this._move(sel.col, sel.row);
		});
		grid.listen(CHANGED_VALUE, (e) => {
			const sel = grid.selection.select;
			if (sel.col !== e.col || sel.row !== e.row) {
				return;
			}
			onSelectMessage(e);
		});
		grid.listen(FOCUS_GRID, (e) => {
			const sel = grid.selection.select;
			onSelectMessage(sel);
		});
		grid.listen(BLUR_GRID, (e) => {
			this._detach();
		});
	}
	_getMessageInstanceOfMessage(message) {
		const messageInstances = this._messageInstances;
		const {type} = normalizeMessage(message);
		return messageInstances[type] || (messageInstances[type] = MESSAGE_INSTANCE_FACTORY[type](this._grid));
	}
}

module.exports = MessageHandler;