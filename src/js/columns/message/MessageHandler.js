'use strict';


const {isPromise} = require('../../internal/utils');
const {
	SELECTED_CELL,
	SCROLL,
	CHANGED_VALUE
} = require('../../list-grid/EVENT_TYPE');
const ErrorMessage = require('./ErrorMessage');
const WarningMessage = require('./WarningMessage');
const InfoMessage = require('./InfoMessage');


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
	drawCellMessage(message, context, style, helper, info) {

		if (!message || isPromise(message)) {
			return;
		}
		const instance = this._getMessageInstanceOfMessage(message);
		instance.drawCellMessage(message, context, style, helper, info);
	}
	_attach(col, row, message) {
		const info = this._attachInfo;
		const instance = this._getMessageInstanceOfMessage(message);
		if (info && info.instance !== instance) {
			info.instance.detachMessageElement();
		}
		instance.attachMessageElement(col, row, this._toMessageText(message));
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
			if (!message || isPromise(message)) {
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
	}
	_getMessageInstanceOfMessage(message) {
		message = message || '';
		if (typeof message === 'string') {
			return this._createMessageInstance('error', ErrorMessage);
		}
		const type = ('' + message.type).toLowerCase();
		if (type === 'info') {
			return this._createMessageInstance('info', InfoMessage);
		} else if (type === 'warning') {
			return this._createMessageInstance('warning', WarningMessage);
		}
		return this._createMessageInstance('error', ErrorMessage);
	}
	_toMessageText(message) {
		message = message || '';
		if (typeof message === 'string') {
			return message;
		}
		if (message.message) {
			return message.message;
		}
		return '' + message;
	}
	_createMessageInstance(name, Message) {
		const messageInstances = this._messageInstances;
		return messageInstances[name] || (messageInstances[name] = new Message(this._grid));
	}
}

module.exports = MessageHandler;