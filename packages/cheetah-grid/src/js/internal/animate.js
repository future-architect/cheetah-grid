'use strict';

function cubicBezier(x2, y2, x3, y3) {
	let step;
	const err = 0.0001;

	x2 *= 3;
	y2 *= 3;
	x3 *= 3;
	y3 *= 3;

	return function(t) {
		let p,
			a,
			b,
			c,
			d,
			x,
			s;
		if (t < 0 || 1 < t) {
			throw new Error(t);
		}

		p = step || t;

		do {
			a = 1 - p;
			b = a * a;
			c = p * p;
			d = c * p;

			x = x2 * b * p + x3 * a * c + d;
			s = t - x;
			p += s * 0.5;
		} while (err < Math.abs(s));

		step = p;
		return	y2 * b * p + y3 * a * c + d;
	};
}
const EASINGS = {
	linear(p) {
		return p;
	},
	easeIn: cubicBezier(0.420, 0.000, 1.000, 1.000),
	easeOut: cubicBezier(0.000, 0.000, 0.580, 1.000),
	easeInOut: cubicBezier(0.420, 0.000, 0.580, 1.000),
};

const raf = window.requestAnimationFrame || setTimeout;

function now() {
	return Date.now();
}
/**
	 * <pre>
	 * Animates.
	 * </pre>
	 * @function
	 * @param {number} duration animation time.
	 * @param {function} step
	 * @param {function|string} easing
	 * @returns {object} Deferred object.
	 */
module.exports = (duration, step, easing) => {
	const startedAt = now();

	if (!easing) {
		easing = EASINGS.easeInOut;
	} else if (typeof easing === 'string') {
		easing = EASINGS[easing];
	}

	let canceledFlg = false;
	const createAnim = (resolve, reject) => {
		const anim = () => {
			const point = now() - startedAt;
			if (canceledFlg) {
				//cancel
				if (reject) { reject(); }
			} else if (point >= duration) {
				//end
				step(1);
				if (resolve) { resolve(); }
			} else {
				step(easing(point / duration));

				raf(anim, 1);
			}
		};
		return anim;
	};
	const cancel = () => {
		canceledFlg = true;
	};
	if (window.Promise) {
		const result = new window.Promise((resolve, reject) => {
			const anim = createAnim(resolve, reject);
			step(0);
			anim();
		});
		result.cancel = cancel;
		return result;
	} else {
		const anim = createAnim(() => {}, () => {});
		step(0);
		anim();
		return {
			cancel,
		};
	}
};
