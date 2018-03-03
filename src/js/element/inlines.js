'use strict';


const Inline = require('./Inline');
const InlineIcon = require('./InlineIcon');
const InlineImage = require('./InlineImage');
const InlineSvg = require('./InlineSvg');
const InlineDrawer = require('./InlineDrawer');
const InlinePath2D = require('./InlinePath2D');
const {isDef} = require('../internal/utils');
const {calcStartPosition} = require('../internal/canvases');
const icons = require('../icons');
const path2DManager = require('../internal/path2DManager');

function drawRegisteredIcon(ctx, icon,
		drawWidth, drawHeight,
		left, top, width, height,
		{
			offset = 2,
			padding,
		} = {}) {
	const rect = {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
	};
	ctx.save();
	try {
		ctx.beginPath();
		ctx.rect(rect.left, rect.top, rect.width, rect.height);
		//clip
		ctx.clip();

		//文字描画
		const pos = calcStartPosition(ctx, rect, drawWidth, drawHeight, {
			offset,
			padding
		});
		path2DManager.fill(icon, ctx, pos.x, pos.y, drawWidth, drawHeight);
	} finally {
		ctx.restore();
	}
}


module.exports = {
	iconOf(icon) {
		if (icon instanceof Inline) {
			return icon;
		}
		if (!icon) {
			return null;
		}
		if (icon.font && icon.content) {
			return new InlineIcon(icon);
		}
		if (icon.src) {
			return new InlineImage({
				src: icon.src,
				width: icon.width,
				height: icon.width,
			});
		}
		if (icon.svg) {
			return new InlineSvg({
				svg: icon.svg,
				width: icon.width,
				height: icon.width,
			});
		}
		if (icon.path) {
			return new InlinePath2D({
				path: icon.path,
				width: icon.width,
				height: icon.width,
				color: icon.color,
			});
		}
		const regedIcons = icons.get();
		if (icon.name && regedIcons[icon.name]) {
			const regedIcon = regedIcons[icon.name];
			const width = icon.width || Math.max(regedIcon.width, regedIcon.height);
			return new InlineDrawer({
				draw({
					ctx,
					canvashelper,
					rect,
					offset,
					offsetLeft,
					offsetRight,
				}) {
					drawRegisteredIcon(ctx, regedIcon,
							width, width,
							rect.left, rect.top, rect.width, rect.height,
							{
								offset: offset + 1,
								padding: {
									left: offsetLeft,
									right: offsetRight,
								}
							});
				},
				width,
				height: width,
				color: icon.color,
			});
		}
		return new InlineIcon(icon);
	},
	of(content) {
		if (!isDef(content)) {
			return null;
		}
		if (content instanceof Inline) {
			return content;
		}
		return new Inline(content);
	},
	buildInlines(icons, inline) {
		const result = [];
		if (icons) {
			result.push(...(icons.map((icon) => this.iconOf(icon)).filter((e) => !!e)));
		}
		if (Array.isArray(inline) && inline.filter((il) => il instanceof Inline).length) {
			result.push(...(inline.map((il) => this.of(il)).filter((e) => !!e)));
		} else {
			const il = this.of(inline);
			if (il) {
				result.push(il);
			}
		}
		return result;
	}
};