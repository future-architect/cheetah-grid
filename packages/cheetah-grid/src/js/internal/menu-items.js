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

module.exports = {
	normalize,
};
