'use strict';


class Inline {
	constructor(content) {
		this._content = content || '';
	}
	width({ctx}) {
		return ctx.measureText(this._content).width;
	}
	font() {
		return null;
	}
	color() {
		return null;
	}
	canDraw() {
		return true;
	}
	onReady(fn) {
		
	}
	draw({
		ctx,
		canvashelper,
		rect,
		offset,
		offsetLeft,
		offsetRight,
	}) {
		canvashelper.fillTextRect(ctx, this._content,
				rect.left, rect.top, rect.width, rect.height,
				{
					offset: offset + 1,
					padding: {
						left: offsetLeft,
						right: offsetRight,
					}
				});
	}
}
module.exports = Inline;