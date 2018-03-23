'use strict';

const Rect = require('../../internal/Rect');
module.exports = {
	drawExclamationMarkBox(context, style, helper) {
		
		const {bgColor, color} = style;
		const ctx = context.getContext();
		const rect = context.getRect();
		// draw box
		ctx.fillStyle = bgColor;
		const boxRect = rect.copy();
		boxRect.left = boxRect.right - 24;
		ctx.fillRect(boxRect.left, boxRect.top, boxRect.width, boxRect.height - 1);

		// draw exclamation mark
		const fillColor = color;
		const height = 20;
		const width = height / 5;
		const left = boxRect.left + (boxRect.width - width) / 2;
		const top = boxRect.top + (boxRect.height - height) / 2;
		helper.fillRectWithState(new Rect(left, top, width, height / 5 * 3),
				context, {fillColor});
		helper.fillRectWithState(new Rect(left, top + height / 5 * 4, width, height / 5),
				context, {fillColor});
	},
	drawInfomationMarkBox(context, style, helper) {
		
		const {bgColor, color} = style;
		const ctx = context.getContext();
		const rect = context.getRect();
		// draw box
		ctx.fillStyle = bgColor;
		const boxRect = rect.copy();
		boxRect.left = boxRect.right - 24;
		ctx.fillRect(boxRect.left, boxRect.top, boxRect.width, boxRect.height - 1);

		// draw i mark
		const fillColor = color;
		const height = 20;
		const width = height / 5;
		const left = boxRect.left + (boxRect.width - width) / 2;
		const top = boxRect.top + (boxRect.height - height) / 2;
		helper.fillRectWithState(new Rect(left, top, width, height / 5),
				context, {fillColor});
		helper.fillRectWithState(new Rect(left, top + height / 5 * 2, width, height / 5 * 3),
				context, {fillColor});
	},
};
