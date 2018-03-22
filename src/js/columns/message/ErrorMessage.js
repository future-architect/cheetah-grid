'use strict';


const Rect = require('../../internal/Rect');
const BaseMessage = require('./BaseMessage');
const ErrorMessageElement = require('./internal/ErrorMessageElement');

const RED_A100 = '#ff8a80';
// const RED_A400 = '#FF1744';

class ErrorMessage extends BaseMessage {
	createMessageElementInternal() {
		return new ErrorMessageElement();
	}
	drawCellMessageInternal(message, context, style, helper, info) {
		const {bgColor} = style;

		const {selected} = context.getSelectState();

		const rect = context.getRect();

		helper.drawBorderWithClip(context, (ctx) => {
			if (!selected) {
				// draw box
				ctx.fillStyle = RED_A100;
				const boxRect = rect.copy();
				boxRect.left = boxRect.right - 24;
				ctx.fillRect(boxRect.left, boxRect.top, boxRect.width, boxRect.height - 1);

				// draw exclamation mark
				const fillColor = bgColor;
				const height = 20;
				const width = height / 5;
				const left = boxRect.left + (boxRect.width - width) / 2;
				const top = boxRect.top + (boxRect.height - height) / 2;
				helper.fillRectWithState(new Rect(left, top, width, height / 5 * 3),
						context, {fillColor});
				helper.fillRectWithState(new Rect(left, top + height / 5 * 4, width, height / 5),
						context, {fillColor});
			}
		});
	}
}

module.exports = ErrorMessage;