'use strict';
{
	class Rect {
		constructor(left, top, width, height) {
			this._left = left;
			this._top = top;
			this._width = width;
			this._height = height;
		}
		static bounds(left, top, right, bottom) {
			return new Rect(left, top, right - left, bottom - top);
		}
		static max(rect1, rect2) {
			return Rect.bounds(
					Math.min(rect1.left, rect2.left),
					Math.min(rect1.top, rect2.top),
					Math.max(rect1.right, rect2.right),
					Math.max(rect1.bottom, rect2.bottom)
			);
		}
		get left() {
			return this._left;
		}
		set left(left) {
			const right = this.right;
			this._left = left;
			this.right = right;
		}
		get top() {
			return this._top;
		}
		set top(top) {
			const bottom = this.bottom;
			this._top = top;
			this.bottom = bottom;
		}
		get width() {
			return this._width;
		}
		set width(width) {
			this._width = width;
			this._right = undefined;
		}
		get height() {
			return this._height;
		}
		set height(height) {
			this._height = height;
			this._bottom = undefined;
		}
		get right() {
			return this._right !== undefined ? this._right : (this._right = this.left + this.width);
		}
		set right(right) {
			this._right = right;
			this.width = right - this.left;
		}
		get bottom() {
			return this._bottom !== undefined ? this._bottom : (this._bottom = this.top + this.height);
		}
		set bottom(bottom) {
			this._bottom = bottom;
			this.height = bottom - this.top;
		}
		offsetLeft(offset) {
			this._left += offset;
			this._right = undefined;
		}
		offsetTop(offset) {
			this._top += offset;
			this._bottom = undefined;
		}
		copy() {
			return new Rect(this.left, this.top, this.width, this.height);
		}
		intersection(rect) {
			const x0 = Math.max(this.left, rect.left);
			const x1 = Math.min(this.left + this.width, rect.left + rect.width);
			if (x0 <= x1) {
				const y0 = Math.max(this.top, rect.top);
				const y1 = Math.min(this.top + this.height, rect.top + rect.height);
				if (y0 <= y1) {
					return Rect.bounds(x0, y0, x1, y1);
				}
			}
			return null;
		}
		contains(another) {
			return this.left <= another.left &&
					this.left + this.width >= another.left + another.width &&
					this.top <= another.top &&
					this.top + this.height >= another.top + another.height;
		}
		inPoint(x, y) {
			return this.left <= x &&
					this.left + this.width >= x &&
					this.top <= y &&
					this.top + this.height >= y;
		}
	}
	module.exports = Rect;
}