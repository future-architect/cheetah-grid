'use strict';

const {isDef, str: {genChars, genWords}} = require('../internal/utils');

function getWidth(ctx, content) {
	return ctx.measureText(content).width;
}

function breakWidth(ctx, content, itr, candidateIndex, width) {
	const chars = [];
	let ret = itr.next();
	for (let i = 0; i < candidateIndex && ret !== null; i++, ret = itr.next()) {
		chars.push(ret);
	}
	let beforeWidth = getWidth(ctx, chars.join(''));
	if (beforeWidth > width) {
		while (chars.length) {
			const c = chars.pop();
			beforeWidth -= getWidth(ctx, c);
			if (beforeWidth <= width) {
				break;
			}
		}
	} else if (beforeWidth < width) {
		while (ret !== null) {
			const charWidth = getWidth(ctx, ret);
			if (beforeWidth + charWidth > width) {
				break;
			}
			chars.push(ret);
			beforeWidth += charWidth;
			ret = itr.next();
		}
	}
	const beforeContent = chars.join('').replace(/\s+$/, '');
	const afterContent = content.slice(beforeContent.length).replace(/^\s+/, '');
	return {
		before: beforeContent ? new Inline(beforeContent) : null,
		after: afterContent ? new Inline(afterContent) : null,
	};
}

class Inline {
	constructor(content) {
		this._content = isDef(content) ? content : '';
	}
	width({ctx}) {
		return getWidth(ctx, this._content);
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
		offsetTop,
		offsetBottom,
	}) {
		canvashelper.fillTextRect(ctx, this._content,
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
	canBreak() {
		return !!this._content;
	}
	splitIndex(index) {
		const content = this._content;
		const itr = genChars(content);
		const chars = [];
		let ret = itr.next();
		for (let i = 0; i < index && ret !== null; i++, ret = itr.next()) {
			chars.push(ret);
		}
		const beforeContent = chars.join('');
		const afterContent = content.slice(beforeContent.length);
		return {
			before: beforeContent ? new Inline(beforeContent) : null,
			after: afterContent ? new Inline(afterContent) : null,
		};
	}
	breakWord(ctx, width) {
		const content = this._content;
		const allWidth = this.width({ctx});
		const candidate = Math.floor(this._content.length * width / allWidth);
		const itr = genWords(content);
		return breakWidth(ctx, content, itr, candidate, width);
	}
	breakAll(ctx, width) {
		const content = this._content;
		const allWidth = this.width({ctx});
		const candidate = Math.floor(this._content.length * width / allWidth);
		const itr = genChars(content);
		return breakWidth(ctx, content, itr, candidate, width);
	}
	toString() {
		return this._content;
	}
}
module.exports = Inline;