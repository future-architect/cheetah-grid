'use strict';
{

	function calcBasePosition(ctx, rect,
			{
				offset = 0,
				padding: {
					left: paddingLeft = 0,
					right: paddingRight = 0,
				} = {},
			} = {}) {
		// const textAlign = ctx.textAlign || 'left';
		// const textBaseline = ctx.textBaseline || 'middle';
		// ctx.textAlign = textAlign;
		// ctx.textBaseline = textBaseline;

		// let x = rect.left + offset + paddingLeft;
		// if (textAlign === 'right' || textAlign === 'end') {
		// 	x = rect.right - offset - paddingRight;
		// } else if (textAlign === 'center') {
		// 	x = rect.left + ((rect.width + paddingLeft - paddingRight) / 2);
		// }
		// let y = rect.top + offset;
		// if (textBaseline === 'bottom' || textBaseline === 'alphabetic' || textBaseline === 'ideographic') {
		// 	y = rect.bottom - offset;
		// } else if (textBaseline === 'middle') {
		// 	y = rect.top + (rect.height / 2);
		// }
		// return {x, y};
		return calcStartPosition(ctx, rect, 0, 0, {
			offset,
			padding: {
				left: paddingLeft,
				right: paddingRight,
			}
		});
	}
	function calcStartPosition(ctx, rect, width, height,
			{
				offset = 0,
				padding: {
					left: paddingLeft = 0,
					right: paddingRight = 0,
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
		let y = rect.top + offset;
		if (textBaseline === 'bottom' || textBaseline === 'alphabetic' || textBaseline === 'ideographic') {
			y = rect.bottom - height - offset;
		} else if (textBaseline === 'middle') {
			y = rect.top + ((rect.height - height) / 2);
		}
		return {x, y};
	}

	module.exports = {
		calcBasePosition,
		calcStartPosition,
	};
}