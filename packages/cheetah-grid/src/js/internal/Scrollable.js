'use strict';

const EventHandler = require('./EventHandler');
const style = require('./style');
const {browser} = require('./utils');

const MAX_SCROLL = browser.heightLimit - 1000;

function _update(scrollable) {
	let domHeight;
	if (scrollable._height > MAX_SCROLL) {
		const sbSize = style.getScrollBarSize();
		const {offsetHeight} = scrollable._scrollable;
		const vScrollRange = MAX_SCROLL - offsetHeight + sbSize;
		const rScrollRange = scrollable._height - offsetHeight + sbSize;
		scrollable._p = vScrollRange / rScrollRange;
		domHeight = MAX_SCROLL;
	} else {
		scrollable._p = 1;
		domHeight = scrollable._height;
	}

	scrollable._endPointElement.style.top = `${domHeight.toFixed()}px`;
	scrollable._endPointElement.style.left = `${scrollable._width.toFixed()}px`;

}

class Scrollable {
	constructor() {
		this._handler = new EventHandler();

		this._scrollable = document.createElement('div');
		this._scrollable.classList.add('grid-scrollable');
		this._height = 0;
		this._width = 0;

		this._endPointElement = document.createElement('div');
		this._endPointElement.classList.add('grid-scroll-end-point');
		_update(this);
		this._scrollable.appendChild(this._endPointElement);

		// const mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel'; //FF doesn't recognize mousewheel as of FF3.x
		// this._handler.on(this._scrollable, mousewheelevt, (evt) => {
		// const delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
		// const point = Math.min(Math.abs(delta) / 12, this.scrollHeight / 5);
		// this.scrollTop += delta < 0 ? point : -point;
		// });
	}
	calcTop(top) {
		const relativeTop = top - this.scrollTop;
		return this._scrollable.scrollTop + relativeTop;
	}
	getElement() {
		return this._scrollable;
	}
	setScrollSize(width, height) {
		this._width = width;
		this._height = height;
		_update(this);
	}
	get scrollWidth() {
		return this._width;
	}
	set scrollWidth(width) {
		this._width = width;
		_update(this);
	}
	get scrollHeight() {
		return this._height;
	}
	set scrollHeight(height) {
		this._height = height;
		_update(this);
	}
	get scrollLeft() {
		return Math.ceil(this._scrollable.scrollLeft);
	}
	set scrollLeft(scrollLeft) {
		this._scrollable.scrollLeft = scrollLeft;
	}
	get scrollTop() {
		return Math.ceil(this._scrollable.scrollTop / this._p);
	}
	set scrollTop(scrollTop) {
		this._scrollable.scrollTop = scrollTop * this._p;
	}
	onScroll(fn) {
		this._handler.on(this._scrollable, 'scroll', fn);
	}
	dispose() {
		this._handler.dispose();
	}
}


module.exports = Scrollable;
