'use strict';
{
	const {calcBasePosition, calcStartPosition, getFontSize} = require('../internal/canvases');
	const {ceil, PI} = Math;

	function strokeColorsRect(ctx, borderColors, left, top, width, height) {
		function strokeRectLines(positions) {
			for (let i = 0; i < borderColors.length; i++) {
				const color = borderColors[i];
				const preColor = borderColors[i - 1];
				if (color) {
					if (preColor !== color) {
						if (preColor) {
							ctx.strokeStyle = preColor;
							ctx.stroke();
						}
						const pos1 = positions[i];
						ctx.beginPath();
						ctx.moveTo(pos1.x, pos1.y);
					}
					const pos2 = positions[i + 1];
					ctx.lineTo(pos2.x, pos2.y);
				} else {
					if (preColor) {
						ctx.strokeStyle = preColor;
						ctx.stroke();
					}
				}
			}
			const preColor = borderColors[borderColors.length - 1];
			if (preColor) {
				ctx.strokeStyle = preColor;
				ctx.stroke();
			}
		}
		if (borderColors[0] === borderColors[1] &&
			borderColors[0] === borderColors[2] &&
			borderColors[0] === borderColors[3]) {
			if (borderColors[0]) {
				ctx.strokeStyle = borderColors[0];
				ctx.strokeRect(left, top, width, height);
			}
		} else {
			strokeRectLines([
				{x: left, y: top},
				{x: left + width, y: top},
				{x: left + width, y: top + height},
				{x: left, y: top + height},
				{x: left, y: top},
			]);
		}
	}
	function roundRect(ctx, left, top, width, height, radius) {
		ctx.beginPath();
		ctx.arc(left + radius, top + radius, radius, -PI, -0.5 * PI, false);
		ctx.arc(left + width - radius, top + radius, radius, -0.5 * PI, 0, false);
		ctx.arc(left + width - radius, top + height - radius, radius, 0, 0.5 * PI, false);
		ctx.arc(left + radius, top + height - radius, radius, 0.5 * PI, PI, false);
		ctx.closePath();
	}
	function fillRoundRect(ctx, left, top, width, height, radius) {
		roundRect(ctx, left, top, width, height, radius);
		ctx.fill();
	}
	function strokeRoundRect(ctx, left, top, width, height, radius) {
		roundRect(ctx, left, top, width, height, radius);
		ctx.stroke();
	}
	function fillTextRect(ctx, text, left, top, width, height,
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
			const pos = calcBasePosition(ctx, rect, {
				offset,
				padding
			});

			ctx.fillText(text, pos.x, pos.y);
		} finally {
			ctx.restore();
		}
	}
	function drawInlineImageRect(ctx, image,
			srcLeft, srcTop, srcWidth, srcHeight,
			destWidth, destHeight,
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
			const pos = calcStartPosition(ctx, rect, destWidth, destHeight, {
				offset,
				padding
			});

			ctx.drawImage(image,
					srcLeft, srcTop, srcWidth, srcHeight,
					pos.x, pos.y, destWidth, destHeight
			);
		} finally {
			ctx.restore();
		}
	}

	/**
	 * Returns an object containing the width of the checkbox.
	 * @param  {CanvasRenderingContext2D} ctx canvas context
	 * @return {Object} Object containing the width of the checkbox
	 * @memberof cheetahGrid.tools.canvashelper
	 */
	function measureCheckbox(ctx) {
		return {
			width: getFontSize(ctx, null).width
		};
	}

	/**
	 * draw Checkbox
	 * @param  {CanvasRenderingContext2D} ctx canvas context
	 * @param  {number} x The x coordinate where to start drawing the checkbox (relative to the canvas)
	 * @param  {number} y The y coordinate where to start drawing the checkbox (relative to the canvas)
	 * @param  {boolean|number} check checkbox check status
	 * @param  {object} option option
	 * @return {void}
	 * @memberof cheetahGrid.tools.canvashelper
	 */
	function drawCheckbox(ctx, x, y, check,
			{
				uncheckBgColor = '#FFF',
				checkBgColor = 'rgb(76, 73, 72)',
				borderColor = '#000',
				boxSize = measureCheckbox(ctx).width,
			} = {}) {
		const checkPoint = typeof check === 'number' ? (check > 1 ? 1 : check) : 1;

		ctx.save();
		try {
			ctx.fillStyle = check ? checkBgColor : uncheckBgColor;

			fillRoundRect(
					ctx,
					ceil(x) - 1,
					ceil(y) - 1,
					ceil(boxSize + 1),
					ceil(boxSize + 1),
					boxSize / 5
			);
			ctx.lineWidth = 1;
			ctx.strokeStyle = borderColor;
			strokeRoundRect(
					ctx,
					ceil(x) - 0.5,
					ceil(y) - 0.5,
					ceil(boxSize),
					ceil(boxSize),
					boxSize / 5
			);
			if (check) {
				ctx.lineWidth = ceil(boxSize / 10);
				ctx.strokeStyle = uncheckBgColor;
				let leftWidth = boxSize / 4;
				let rightWidth = boxSize / 2 * 0.9;
				const leftLeftPos = x + boxSize * 0.2;
				const leftTopPos = y + boxSize / 2;

				if (checkPoint < 0.5) {
					leftWidth *= (checkPoint * 2);
				}

				ctx.beginPath();
				ctx.moveTo(leftLeftPos, leftTopPos);
				ctx.lineTo(leftLeftPos + leftWidth, leftTopPos + leftWidth);
				if (checkPoint > 0.5) {
					if (checkPoint < 1) {
						rightWidth *= ((checkPoint - 0.5) * 2);
					}
					ctx.lineTo(leftLeftPos + leftWidth + rightWidth, leftTopPos + leftWidth - rightWidth);
				}
				ctx.stroke();
			}
		} finally {
			ctx.restore();
		}
	}
	function drawButton(ctx, left, top, width, height, option = {}) {
		const {
			backgroundColor = '#FFF',
			bgColor = backgroundColor,
			radius = 4,
			shadow = {},
		} = option;
		ctx.save();
		try {
			ctx.fillStyle = bgColor;

			if (shadow) {
				const {
					color = 'rgba(0, 0, 0, 0.24)',
					blur = 1,
					offsetX = 0,
					offsetY = 2,
					offset: {
						x: ox = offsetX,
						y: oy = offsetY
					} = {},
				} = shadow;
				ctx.shadowColor = color;
				ctx.shadowBlur = blur; //ぼかし
				ctx.shadowOffsetX = ox;
				ctx.shadowOffsetY = oy;
			}

			fillRoundRect(
					ctx,
					ceil(left),
					ceil(top),
					ceil(width),
					ceil(height),
					radius
			);
		} finally {
			ctx.restore();
		}
	}

	/**
	 * canvashelper
	 * @type {Object}
	 * @namespace cheetahGrid.tools.canvashelper
	 * @memberof cheetahGrid.tools
	 */
	const canvashelper = {
		roundRect,
		fillRoundRect,
		strokeRoundRect,
		drawCheckbox,
		measureCheckbox,
		fillTextRect,
		drawButton,
		drawInlineImageRect,
		strokeColorsRect,
	};


	module.exports = canvashelper;
}