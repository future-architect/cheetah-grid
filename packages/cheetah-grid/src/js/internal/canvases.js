'use strict';
{
	const fontSizeCache = {};
	function getFontSize(ctx, font) {
		if (fontSizeCache[font]) {
			return fontSizeCache[font];
		}
		const bk = ctx.font;
		try {
			ctx.font = font || ctx.font;
			const em = ctx.measureText('あ').width;
			return (fontSizeCache[font] = {
				width: em,
				height: em
			});
		} finally {
			ctx.font = bk;
		}
	}

	function calcBasePosition(ctx, rect,
			{
				offset = 0,
				padding: {
					left: paddingLeft = 0,
					right: paddingRight = 0,
					top: paddingTop = 0,
					bottom: paddingBottom = 0,
				} = {},
			} = {}) {
		return calcStartPosition(ctx, rect, 0, 0, {
			offset,
			padding: {
				left: paddingLeft,
				right: paddingRight,
				top: paddingTop,
				bottom: paddingBottom,
			}
		});
	}
	function calcStartPosition(ctx, rect, width, height,
			{
				offset = 0,
				padding: {
					left: paddingLeft = 0,
					right: paddingRight = 0,
					top: paddingTop = 0,
					bottom: paddingBottom = 0,
				} = {},
			} = {}) {
		const textAlign = ctx.textAlign || 'left';
		const textBaseline = ctx.textBaseline || 'middle';
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;

		let x = rect.left + offset + paddingLeft;
		if (textAlign === 'right' || textAlign === 'end') {
			x = rect.right - width - offset - paddingRight;
		} else if (textAlign === 'center') {
			x = rect.left + ((rect.width - width + paddingLeft - paddingRight) / 2);
		}
		let y = rect.top + offset + paddingTop;
		if (textBaseline === 'bottom' || textBaseline === 'alphabetic' || textBaseline === 'ideographic') {
			y = rect.bottom - height - offset - paddingBottom;
		} else if (textBaseline === 'middle') {
			y = rect.top + ((rect.height - height + paddingTop - paddingBottom) / 2);
		}
		return {x, y};
	}

	module.exports = {
		calcBasePosition,
		calcStartPosition,
		getFontSize,
	};
}