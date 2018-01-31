'use strict';

function parse(calcStr) {
	function replacer(match, num, unit) {
		switch (unit) {
		case '%':
			return `(${num} * this.full / 100)`;
		case 'em':
			return `(${num} * this.em)`;
		case 'px':
			return `(${num})`;
		default:
			throw new Error('calc error');
		}
	}
	const script = calcStr.replace(/^calc\((.*)\)$/, '$1').
		replace(/(\d+)([A-Za-z%]+)/g, replacer).
		replace(/(\d*\.\d+)([A-Za-z%]+)/g, replacer)
	;
	return {
		eval(context) {
			return (() => {
				function calc(v) { // eslint-disable-line no-unused-vars
					return v;
				}
				return eval(script);// eslint-disable-line no-eval
			}).call(context);
		}
	};
}
function toPx(value, context) {
	if (/^calc\(.*\)$/.test(value)) {
		return parse(value).eval(context);
	}
	if (/^[+-]?\d+\.?\d*%$/.test(value)) {
		return context.full * value.substr(0, value.length - 1) / 100;
	}
	if (/^[+-]?\d+\.?\d*px$/.test(value)) {
		return value.substr(0, value.length - 2) - 0;
	}
	if (/^[+-]?\d+\.?\d*em$/.test(value)) {
		return context.em * (value.substr(0, value.length - 2) - 0);
	}
	return value - 0;
}

module.exports = {
	parse,
	toPx(value, context) {
		if (typeof value === 'string') {
			return toPx(value.trim(), context);
		}
		return value - 0;
	}
};