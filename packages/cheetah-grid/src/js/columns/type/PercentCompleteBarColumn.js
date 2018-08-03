'use strict';

const PercentCompleteBarStyle = require('../style/PercentCompleteBarStyle');
const {getOrApply, str} = require('../../internal/utils');
const Column = require('./Column');


const MARGIN = 2;

class PercentCompleteBarColumn extends Column {
	constructor(option = {}) {
		super(option);
		this._min = option.min || 0;
		this._max = option.max || (this._min + 100);
		this._formatter = option.formatter || ((v) => v);
	}
	get StyleClass() {
		return PercentCompleteBarStyle;
	}
	clone() {
		return new PercentCompleteBarColumn(this);
	}
	drawInternal(value, context, style, helper, grid, info) {
		super.drawInternal(this._formatter(value), context, style, helper, grid, info);
		const {
			barColor,
			barBgColor,
			barHeight,
		} = style;

		let svalue = `${value}`;
		if (str.endsWith(svalue, '%')) {
			svalue = svalue.substr(0, svalue.length - 1);
		}
		const num = svalue - 0;
		const rate = num < this._min ? 0
			: num > this._max ? 1
			: (num - this._min) / (this._max - this._min);

		helper.drawWithClip(context, (ctx) => {
			const rect = context.getRect();

			const barMaxWidth = rect.width - MARGIN * 2 - 1/*罫線*/;
			const barTop = rect.bottom - MARGIN - barHeight - 1/*罫線*/;
			const barLeft = rect.left + MARGIN;
			ctx.fillStyle = getOrApply(barBgColor, rate * 100) || '#f0f3f5';
			ctx.beginPath();
			ctx.rect(barLeft, barTop, barMaxWidth, barHeight);
			ctx.fill();


			const barSize = Math.min(barMaxWidth * rate, barMaxWidth);
			ctx.fillStyle = getOrApply(barColor, rate * 100) || '#20a8d8';
			ctx.beginPath();
			ctx.rect(barLeft, barTop, barSize, barHeight);
			ctx.fill();
		});
	}
}
module.exports = PercentCompleteBarColumn;
