'use strict';

class BaseMessage {
	constructor(grid) {
		this._grid = grid;
	}
	dispose() {
		this.detachMessageElement();
		if (this._messageElement) {
			this._messageElement.dispose();
		}
		this._messageElement = null;
	}
	_getMessageElement() {
		return this._messageElement || (this._messageElement = this.createMessageElementInternal());
	}
	createMessageElementInternal() {

	}
	drawCellMessageInternal(message, context, style, helper, info) {

	}
	attachMessageElement(col, row, message) {
		const messageElement = this._getMessageElement();
		messageElement.attach(this._grid, col, row, message);
	}
	moveMessageElement(col, row) {
		const messageElement = this._getMessageElement();
		messageElement.move(this._grid, col, row);
	}
	detachMessageElement() {
		const messageElement = this._getMessageElement();
		messageElement._detach();
	}
	drawCellMessage(message, context, style, helper, info) {
		this.drawCellMessageInternal(message, context, style, helper, info);
	}
}

module.exports = BaseMessage;