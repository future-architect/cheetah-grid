'use strict';

const EventHandler = require('./EventHandler');
const handler = new EventHandler();

let ratio;
function setRatio() {
	ratio = Math.ceil(window.devicePixelRatio || 1);
	if (ratio > 1 && (ratio % 2) !== 0) {
		ratio += 1;
	}
}
setRatio();
handler.on(window, 'resize', setRatio);

module.exports = {
	transform(canvas) {
		const ctx = canvas.getContext('2d');

		const getAttribute = canvas.getAttribute;
		canvas.getAttribute = function(name, ...args) {
			let result = getAttribute.call(this, name, ...args);
			if (name === 'width' || name === 'height') {
				result /= ratio;
			}
			return result;
		};
		const setAttribute = canvas.setAttribute;
		canvas.setAttribute = function(name, val, ...args) {
			const wh = name === 'width' || name === 'height';
			if (wh) {
				val *= ratio;
			}
			const result = setAttribute.call(this, name, val, ...args);
			if (wh) {
				ctx.scale(ratio, ratio);
			}
			return result;
		};

		Object.defineProperty(canvas, 'width', {
			get() {
				return canvas.getAttribute('width');
			},
			set: (val) => {
				canvas.setAttribute('width', Math.floor(val));
			},
			configurable: true,
			enumerable: true,
		});
		Object.defineProperty(canvas, 'height', {
			get() {
				return canvas.getAttribute('height');
			},
			set: (val) => {
				canvas.setAttribute('height', Math.floor(val));
			},
			configurable: true,
			enumerable: true,
		});
		const drawImage = ctx.drawImage;
		ctx.drawImage = function(img, ...args) {
			if (img !== canvas || ratio === 1) {
				return drawImage.call(this, img, ...args);
			}
			this.save();
			try {
				this.scale(1 / ratio, 1 / ratio);
				if (args.length > 4) {
					args[4] = args[4] * ratio;
					args[5] = args[5] * ratio;
				} else {
					args[0] = args[0] * ratio;
					args[1] = args[1] * ratio;
				}
				return drawImage.call(this, img, ...args);
			} finally {
				this.restore();
			}
		};

		return canvas;
	}
};