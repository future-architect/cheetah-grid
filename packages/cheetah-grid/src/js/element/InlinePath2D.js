'use strict';

const Inline = require('./Inline');
const {calcStartPosition} = require('../internal/canvases');
const path2DManager = require('../internal/path2DManager');

class InlinePath2D extends Inline {
	constructor(
			{
				path,
				width,
				height,
				color,
			}) {
		super();
		// このタイミングでないとIEでPath2Dのpolyfillが反映されない
		this._path = new path2DManager.Path2D(path);
		this._width = width;
		this._height = height;
		this._color = color;
	}
	width({ctx}) {
		return this._width;
	}
	font() {
		return null;
	}
	color() {
		return this._color;
	}
	canDraw() {
		return true;
	}
	onReady(callback) {
	}
	draw({
		ctx,
		canvashelper,
		rect,
		offset,
		offsetLeft,
		offsetRight,
		offsetTop,
		offsetBottom,
	}) {
		offset++;
		const padding = {
			left: offsetLeft,
			right: offsetRight,
			top: offsetTop,
			bottom: offsetBottom,
		};
		ctx.save();
		try {
			ctx.beginPath();
			ctx.rect(rect.left, rect.top, rect.width, rect.height);
			//clip
			ctx.clip();

			//文字描画
			const pos = calcStartPosition(ctx, rect, this._width, this._height, {
				offset,
				padding
			});
			ctx.translate(pos.x, pos.y);
			ctx.fill(this._path);
		} finally {
			ctx.restore();
		}
	}
}

module.exports = InlinePath2D;