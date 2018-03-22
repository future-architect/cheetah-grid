'use strict';

const BaseMessage = require('./BaseMessage');
const MessageElement = require('./internal/MessageElement');

const Rect = require('../../internal/Rect');

const GREY_L2 = '#e0e0e0';
// const GREY_L1 = '#bdbdbd';
	
class InfoMessage extends BaseMessage {
	createMessageElementInternal() {
		return new MessageElement();
	}
	drawCellMessageInternal(message, context, style, helper, info) {
		const {bgColor} = style;

		const {selected} = context.getSelectState();

		const rect = context.getRect();

		helper.drawBorderWithClip(context, (ctx) => {
			if (!selected) {
				// draw box
				ctx.fillStyle = GREY_L2;
				const boxRect = rect.copy();
				boxRect.left = boxRect.right - 24;
				ctx.fillRect(boxRect.left, boxRect.top, boxRect.width, boxRect.height - 1);

				// draw i mark
				const fillColor = bgColor;
				const height = 20;
				const width = height / 5;
				const left = boxRect.left + (boxRect.width - width) / 2;
				const top = boxRect.top + (boxRect.height - height) / 2;
				helper.fillRectWithState(new Rect(left, top, width, height / 5),
						context, {fillColor});
				helper.fillRectWithState(new Rect(left, top + height / 5 * 2, width, height / 5 * 3),
						context, {fillColor});
			}
		});
	}
}

module.exports = InfoMessage;