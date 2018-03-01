'use strict';

function normalize(options) {
	if (!options) {
		return [];
	}
	if (Array.isArray(options)) {
		return options;
	}
	if (typeof options === 'string') {
		return normalize(JSON.parse(options));
	}
	const result = [];
	for (const k in options) {
		result.push({
			value: k,
			caption: options[k]
		});
	}
	return result;
}
function toObject(options) {
	const obj = {};
	normalize(options).forEach((opt) => (obj[opt.value] = opt.caption));
	return obj;
}

module.exports = {
	normalize,
	toObject
};
