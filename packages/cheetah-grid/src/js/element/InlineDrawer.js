'use strict';


const Inline = require('./Inline');

class InlineDrawer extends Inline {
	constructor(
			{
				draw,
				width,
				height,
				color,
			}) {
		super();

		this._draw = draw;
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
		this._draw({
			ctx,
			canvashelper,
			rect,
			offset,
			offsetLeft,
			offsetRight,
			offsetTop,
			offsetBottom,
		});
	}
	canBreak() {
		return false;
	}
	toString() {
		return '';
	}
}

module.exports = InlineDrawer;