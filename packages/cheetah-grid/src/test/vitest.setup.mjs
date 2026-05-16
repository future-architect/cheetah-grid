import {expect, it, test} from 'vitest';
import imageMatcher from 'image-matcher';
import * as cheetahGrid from '../js/main';

import './specs/test-helper.js';

globalThis.cheetahGrid = cheetahGrid;
window.cheetahGrid = cheetahGrid;

function wrapDoneCallback(base) {
	const wrapped = function(name, fn, options) {
		if (typeof fn === 'function' && fn.length > 0) {
			return base(name, () => new Promise((resolve, reject) => {
				const done = (error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				};
				try {
					const result = fn(done);
					if (result && typeof result.then === 'function') {
						result.then(resolve, reject);
					}
				} catch (error) {
					reject(error);
				}
			}), options);
		}
		return base(name, fn, options);
	};
	Object.assign(wrapped, base);
	return wrapped;
}

globalThis.it = wrapDoneCallback(it);
globalThis.test = wrapDoneCallback(test);

expect.extend({
	toMatchImage(received, expected, options = {}) {
		const result = imageMatcher.matchers.toMatchImage(received, expected, options);
		const {unmatchCount, maxColorDistance} = result;
		const {tolerance = 0, delta = 0, blurLevel = 0} = options;

		return {
			pass: result.pass,
			message: () => `unmatch pixels: ${unmatchCount}, max color distance: ${maxColorDistance}, {tolerance: ${tolerance}, delta: ${delta}, blurLevel: ${blurLevel}}`,
		};
	},
});
