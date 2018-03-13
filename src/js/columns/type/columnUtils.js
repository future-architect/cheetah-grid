'use strict';
{
	const {isPromise} = require('../../internal/utils');
	const icons = require('../../internal/icons');
	const Rect = require('../../internal/Rect');
	const RED_A400 = '#FF1744';
	const DEEP_ORANGE_600 = '#F4511E';
	module.exports = {
		loadIcons(icon, context, helper, callback) {
			if (icon) {
				if (isPromise(icon)) {
					icon.then((i) => {
						this.loadIcon(i, context.toCurrentContext(), callback);
					});
					icon = null;
				} else {
					const iconList = icons.toNormarizeArray(icon);
					iconList.forEach((i) => {
						helper.testFontLoad(i.font, i.content, context);
					});
					icon = iconList;
				}
			}
			callback(icon, context);
		},
		drawMessage(msg, context, helper, {font, bgColor}) {
			if (!msg) {
				return;
			}
			const {selected} = context.getSelectState();
	
			const rect = context.getRect();


			helper.drawBorderWithClip(context, (ctx) => {
				if (!selected) {
				// draw box
					ctx.fillStyle = '#ff8a80';
					// ctx.fillStyle = '#eee';
					const boxRect = rect.copy();
					boxRect.left = boxRect.right - 24;
					ctx.fillRect(boxRect.left, boxRect.top, boxRect.width, boxRect.height - 1);

					// // draw cercle
					// ctx.fillStyle = DEEP_ORANGE_600;
					// ctx.beginPath();
					// ctx.arc(boxRect.left + boxRect.width / 2, boxRect.top + boxRect.height / 2, 10, 0, Math.PI * 2, false);
					// ctx.fill();

					// draw exclamation mark
					const fillColor = bgColor;
					const height = 20;
					const width = height / 5;
					const left = boxRect.left + (boxRect.width - width) / 2;
					const top = boxRect.top + (boxRect.height - height) / 2;
					helper.fillRectWithState(new Rect(left, top, width, height / 5 * 3),
							context, {fillColor});
					helper.fillRectWithState(new Rect(left, top + height / 5 * 4, width, height / 5),
							context, {fillColor});
				}
			});
			context.addLayerDraw(0, (ctx) => {
				if (selected) {
					ctx.strokeStyle = RED_A400;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(rect.left, rect.bottom - 1.5);
					ctx.lineTo(rect.right, rect.bottom - 1.5);
					ctx.stroke();
					// ctx.strokeRect(rect.left + 0.5, rect.top + 0.5, rect.width - 2, rect.height - 2);

					const {width} = ctx.measureText(msg);
					const height = ctx.measureText('あ').width;
					ctx.save();
					try {
					//0.75rem
						ctx.translate(rect.left, rect.bottom);
						ctx.scale(0.75, 0.75);
						const r = new Rect(0, 0, width + 4, height + 16);
						helper.fillRect(r, context, {fillColor: bgColor});

						helper.fillText(msg, 2, 8, context,
								{
									color: RED_A400,
									textAlign: 'left',
									textBaseline: 'top',
									font,
								});
					} finally {
						ctx.restore();
					}
				} else {
					ctx.strokeStyle = DEEP_ORANGE_600;
					ctx.lineWidth = 1;
				// ctx.strokeRect(rect.left - 0.5, rect.top - 0.5, rect.width, rect.height);
				}
			});


		}
	};
}