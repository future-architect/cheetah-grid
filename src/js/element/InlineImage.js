'use strict';

const Inline = require('./Inline');
const {getCacheOrLoad} = require('../internal/imgs');
const {isPromise} = require('../internal/utils');

class InlineImage extends Inline {
	constructor(
			{
				src,
				width,
				height,
				imageLeft,
				imageTop,
				imageWidth,
				imageHeight,
			}) {
		super();
		this._src = src;
		this._width = width;
		this._height = height;
		this._imageLeft = imageLeft;
		this._imageTop = imageTop;
		this._imageWidth = imageWidth;
		this._imageHeight = imageHeight;

		this._onloaded = [];


		this._loaded = false;
		if (isPromise(src)) {
			src.then((s) => {
				this._src = s;
				this._loadImage(s);
			});
		} else {
			this._loadImage(src);
		}

	}
	_loadImage(src) {
		const img = this._inlineImg = getCacheOrLoad('InlineImage', 50, src);
		if (isPromise(img)) {
			img.then((i) => {
				this._loaded = true;
				this._inlineImg = i;

				this._onloaded.forEach((fn) => fn());
			});
		} else {
			this._loaded = true;
		}
	}
	width({ctx}) {
		return this._width || (this._loaded ? this._inlineImg.width : 0);
	}
	font() {
		return null;
	}
	color() {
		return null;
	}
	canDraw() {
		return this._loaded;
	}
	onReady(callback) {
		if (isPromise(this._src) || isPromise(this._inlineImg)) {
			this._onloaded.push(() => callback());
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
		const img = this._inlineImg;
		canvashelper.drawInlineImageRect(ctx, img,
				this._imageLeft || 0, this._imageTop || 0,
				this._imageWidth || img.width, this._imageHeight || img.height,
				this._width || img.width, this._height || img.height,
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

module.exports = InlineImage;