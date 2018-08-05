'use strict';


const Inline = require('./Inline');
const fonts = require('../internal/fonts');

class InlineIcon extends Inline {
	constructor(icon) {
		super();
		this._icon = icon || {};
	}
	width({ctx}) {
		const icon = this._icon;
		if (icon.width) {
			return icon.width;
		}
		if (icon.font && fonts.check(icon.font, icon.content)) {
			ctx.save();
			try {
				ctx.font = icon.font || ctx.font;
				return ctx.measureText(icon.content).width;
			} finally {
				ctx.restore();
			}
		}
		return null;
	}
	font() {
		return this._icon.font;
	}
	color() {
		return this._icon.color;
	}
	canDraw() {
		const icon = this._icon;
		return icon.font ? fonts.check(icon.font, icon.content) : true;
	}
	onReady(callback) {
		const icon = this._icon;
		if (icon.font && !fonts.check(icon.font, icon.content)) {
			fonts.load(icon.font, icon.content, callback);
		}
	}
	draw(
			{
				ctx,
				canvashelper,
				rect,
				offset,
				offsetLeft,
				offsetRight,
				offsetTop,
				offsetBottom,
			}) {
		const icon = this._icon;
		if (icon.content) {
			canvashelper.fillTextRect(ctx, icon.content,
					rect.left, rect.top, rect.width, rect.height,
					{
						offset: offset + 1,
						padding: {
							left: offsetLeft,
							right: offsetRight,
							top: offsetTop,
							bottom: offsetBottom,
						}
					});
		}
	}
	canBreak() {
		return false;
	}
	toString() {
		return '';
	}
}

module.exports = InlineIcon;