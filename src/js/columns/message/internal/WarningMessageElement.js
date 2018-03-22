'use strict';
const MessageElement = require('./MessageElement');

const CLASSNAME = 'cheetah-grid__warning-message-element';
const MESSAGE_CLASSNAME = CLASSNAME + '__message';


class WarningMessageElement extends MessageElement {
	constructor() {
		super();
		require('./WarningMessageElement.css');
		this._rootElement.classList.add(CLASSNAME);
		this._messageElement.classList.add(MESSAGE_CLASSNAME);
	}
}

module.exports = WarningMessageElement;