'use strict';

const BaseMessage = require('./BaseMessage');
const ErrorMessageElement = require('./internal/ErrorMessageElement');
const messageUtils = require('./messageUtils');

const RED_A100 = '#ff8a80';

class ErrorMessage extends BaseMessage {
	createMessageElementInternal() {
		return new ErrorMessageElement();
	}
	drawCellMessageInternal(message, context, style, helper, grid, info) {
		const {bgColor} = style;
		const {selected} = context.getSelectState();

		if (!selected || !grid.hasFocusGrid()) {
			helper.drawBorderWithClip(context, (ctx) => {
				messageUtils.drawExclamationMarkBox(context, {
					bgColor: RED_A100,
					color: bgColor,
				}, helper);
			});
		}
	}
}

module.exports = ErrorMessage;