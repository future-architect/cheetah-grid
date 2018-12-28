'use strict';

const {browser} = require('./utils');

function getPath2D() {
	if (window.Path2D && !browser.Edge) {
		return window.Path2D;
	}
	return require('./legacy/canvas/Path2D');
}

module.exports = {
	fill(module, ctx, x, y, w, h) {
		ctx.save();
		try {
			const {width, height} = module;
			const {ud: upsideDown, x: offsetX = 0, y: offsetY = 0} = module;
			w = w || width;
			h = h || height;
			const xrate = w / width;
			const yrate = h / (upsideDown ? -height : height);
			x = x || 0;
			y = upsideDown ? ((y || 0) + (-height * yrate)) : (y || 0);

			ctx.translate(x, y);
			ctx.scale(xrate, yrate);
			if (offsetX !== 0 || offsetY !== 0) {
				ctx.translate(offsetX, offsetY);
			}
			const Path2D = getPath2D();
			module.path2d = module.path2d || (new Path2D(module.d));
			ctx.fill(module.path2d);
		} finally {
			ctx.restore();
		}
	},
	get Path2D() {
		return getPath2D();
	},
};
