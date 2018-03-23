'use strict';

const BaseMessage = require('./BaseMessage');
const WarningMessageElement = require('./internal/WarningMessageElement');
const messageUtils = require('./messageUtils');

const DEEP_ORANGE_A100 = '#ff9e80';

class WarningMessage extends BaseMessage {
	createMessageElementInternal() {
		return new WarningMessageElement();
	}
	drawCellMessageInternal(message, context, style, helper, info) {
		const {bgColor} = style;
		const {selected} = context.getSelectState();

		helper.drawBorderWithClip(context, (ctx) => {
			if (!selected) {
				messageUtils.drawExclamationMarkBox(context, {
					bgColor: DEEP_ORANGE_A100,
					color: bgColor,
				}, helper);
			}
		});
	}
}

module.exports = WarningMessage;