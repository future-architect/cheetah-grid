'use strict';

function parse(calcStr) {
	function replacer(match, num, unit) {
		if (unit === '%') {
			return `(${num} * fullValue / 100)`;
		}
		if (unit === 'px') {
			return `(${num})`;
		}
		throw new Error('calc error');
	}
	const script = calcStr.replace(/^calc\((.*)\)$/, '$1').replace(/(\d+)([A-Za-z%]+)/g, replacer);
	return {
		eval(fullValue) {
			function calc(v) { // eslint-disable-line no-unused-vars
				return v;
			}
			return eval(script);// eslint-disable-line no-eval
		}
	};
}
function toPx(value, fullValue) {
	if (/^calc\(.*\)$/.test(value)) {
		return parse(value).eval(fullValue);
	}
	if (/^[+-]?\d+\.?\d*%$/.test(value)) {
		return fullValue * value.substr(0, value.length - 1) / 100;
	}
	if (/^[+-]?\d+\.?\d*px$/.test(value)) {
		return value.substr(0, value.length - 2) - 0;
	}
	return value - 0;
}

module.exports = {
	parse,
	toPxWidth(value, context) {
		if (typeof value === 'string') {
			return toPx(value.trim(), context.width);
		}
		return value - 0;
	}
};