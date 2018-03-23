/*eslint no-bitwise:0*/
'use strict';
{
	const {calcStartPosition, getFontSize} = require('./internal/canvases');
	const inlines = require('./element/inlines');
	const canvashelper = require('./tools/canvashelper');
	const themes = require('./themes');
	const {colorToRGB} = require('./internal/color');
	const Rect = require('./internal/Rect');
	const {getChainSafe, getOrApply, style: {toBoxArray}} = require('./internal/utils');
	const fonts = require('./internal/fonts');
	const calc = require('./internal/calc');

	function invalidateCell(context, grid) {
		const {col, row} = context;
		grid.invalidateCell(col, row);
	}
	function getColor(color, col, row, grid, context) {
		return getOrApply(color, {
			col,
			row,
			grid,
			context,
		});
	}
	function getThemeColor(grid, ...names) {
		return getChainSafe(grid.theme, ...names) || getChainSafe(themes.default, ...names);
	}
	function testFontLoad(font, value, context, grid) {
		if (font) {
			if (!fonts.check(font, value)) {
				fonts.load(font, value, () => invalidateCell(context, grid));
				return false;
			}
		}
		return true;
	}

	function drawInlines(ctx, inlines, rect, offset, offsetTop, offsetBottom, col, row, grid) {
		function drawInline(inline, offsetLeft, offsetRight) {
			if (inline.canDraw()) {
				ctx.save();
				try {
					ctx.fillStyle = getColor(inline.color() || ctx.fillStyle, col, row, grid, ctx);
					ctx.font = inline.font() || ctx.font;
					inline.draw({
						ctx,
						canvashelper,
						rect,
						offset,
						offsetLeft,
						offsetRight,
						offsetTop,
						offsetBottom,
					});
				} finally {
					ctx.restore();
				}
			} else {
				inline.onReady(() => grid.invalidateCell(col, row));
				//noop
			}
		}
		if (inlines.length === 1) {
			//1件の場合は幅計算が不要なため分岐
			const inline = inlines[0];
			drawInline(inline, 0, 0);
		} else {
			const inlineWidths = inlines.map((inline) => (inline.width({ctx}) || 0) - 0);
			let offsetRight = inlineWidths.reduce((a, b) => a + b);

			let offsetLeft = 0;
			inlines.forEach((inline, index) => {
				const inlineWidth = inlineWidths[index];
				offsetRight -= inlineWidth;
				drawInline(inline, offsetLeft, offsetRight);
				offsetLeft += inlineWidth;
			});
		}
	}

	function _inlineRect(grid, ctx, inline, rect, col, row,
			{
				offset,
				color,
				textAlign,
				textBaseline,
				font,
				icons,
			} = {}) {

		//文字style
		ctx.fillStyle = getColor(color, col, row, grid, ctx);
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;
		ctx.font = font || ctx.font;

		const actInlines = inlines.buildInlines(icons, inline);
		drawInlines(ctx, actInlines, rect, offset, 0, 0, col, row, grid);
	}

	function _multiInlineRect(grid, ctx, multiInlines, rect, col, row,
			{
				offset,
				color,
				textAlign,
				textBaseline,
				font,
				lineHeight,
				icons,
			} = {}) {
		//文字style
		ctx.fillStyle = getColor(color, col, row, grid, ctx);
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;
		ctx.font = font || ctx.font;

		multiInlines = [...multiInlines];


		let paddingTop = 0;
		let paddingBottom = lineHeight * (multiInlines.length - 1);

		if (ctx.textBaseline === 'top' || ctx.textBaseline === 'hanging') {
			const em = getFontSize(ctx, ctx.font).height;
			const pad = (lineHeight - em) / 2;
			paddingTop += pad;
			paddingBottom -= pad;
		} else if (ctx.textBaseline === 'bottom' || ctx.textBaseline === 'alphabetic' || ctx.textBaseline === 'ideographic') {
			const em = getFontSize(ctx, ctx.font).height;
			const pad = (lineHeight - em) / 2;
			paddingTop -= pad;
			paddingBottom += pad;
		}
		const line = multiInlines.shift() || '';
		const actInlines = inlines.buildInlines(icons, line);
		drawInlines(ctx, actInlines, rect, offset, paddingTop, paddingBottom, col, row, grid);
		paddingTop += lineHeight;
		paddingBottom -= lineHeight;
		while (multiInlines.length) {
			const line = multiInlines.shift();
			const actInlines = inlines.buildInlines(undefined, line);
			drawInlines(ctx, actInlines, rect, offset, paddingTop, paddingBottom, col, row, grid);
			paddingTop += lineHeight;
			paddingBottom -= lineHeight;
		}

	}


	function drawCheckbox(ctx, rect, check, helper,
			{
				animElapsedTime = 1,
				uncheckBgColor = helper.theme.checkbox.uncheckBgColor,
				checkBgColor = helper.theme.checkbox.checkBgColor,
				borderColor = helper.theme.checkbox.borderColor,
				textAlign = 'center',
				textBaseline = 'middle',
			} = {}) {
		const boxWidth = canvashelper.measureCheckbox(ctx).width;
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;
		const pos = calcStartPosition(ctx, rect, boxWidth + 1/*罫線分+1*/, boxWidth + 1/*罫線分+1*/);
		if (0 < animElapsedTime && animElapsedTime < 1) {
			const uncheckBgRGB = colorToRGB(uncheckBgColor);
			const checkBgRGB = colorToRGB(checkBgColor);
			const checkRGB = (colorName) => {
				const start = uncheckBgRGB[colorName];
				const end = checkBgRGB[colorName];
				if (animElapsedTime >= 1) {
					return end;
				}
				const diff = start - end;
				return Math.ceil(start - diff * animElapsedTime);
			};
			const uncheckRGB = (colorName) => {
				const end = uncheckBgRGB[colorName];
				const start = checkBgRGB[colorName];
				if (animElapsedTime >= 1) {
					return end;
				}
				const diff = end - start;
				return Math.ceil(start + diff * animElapsedTime);
			};
			uncheckBgColor = check ? uncheckBgColor : `rgb(${uncheckRGB('r')} , ${uncheckRGB('g')}, ${uncheckRGB('b')})`;
			checkBgColor = `rgb(${checkRGB('r')} , ${checkRGB('g')}, ${checkRGB('b')})`;
		}

		canvashelper.drawCheckbox(ctx, pos.x, pos.y, check ? animElapsedTime : false, {
			uncheckBgColor,
			checkBgColor,
			borderColor,
		});
	}

	class Theme {
		constructor(grid) {
			this._grid = grid;
		}
		getThemeColor(...name) {
			return getThemeColor(this._grid, ...name);
		}
		get font() {
			return getThemeColor(this._grid, 'font');
		}
		get underlayBackgroundColor() {
			return getThemeColor(this._grid, 'underlayBackgroundColor');
		}
		// color
		get color() {
			return getThemeColor(this._grid, 'color');
		}
		get frozenRowsColor() {
			return getThemeColor(this._grid, 'frozenRowsColor');
		}
		// background
		get defaultBgColor() {
			return getThemeColor(this._grid, 'defaultBgColor');
		}
		get frozenRowsBgColor() {
			return getThemeColor(this._grid, 'frozenRowsBgColor');
		}
		get selectionBgColor() {
			return getThemeColor(this._grid, 'selectionBgColor');
		}
		// border
		get borderColor() {
			return getThemeColor(this._grid, 'borderColor');
		}
		get frozenRowsBorderColor() {
			return getThemeColor(this._grid, 'frozenRowsBorderColor');
		}
		get hiliteBorderColor() {
			return getThemeColor(this._grid, 'hiliteBorderColor');
		}
		get checkbox() {
			const grid = this._grid;
			return this._checkbox || (this._checkbox = {
				get uncheckBgColor() {
					return getThemeColor(grid, 'checkbox', 'uncheckBgColor');
				},
				get checkBgColor() {
					return getThemeColor(grid, 'checkbox', 'checkBgColor');
				},
				get borderColor() {
					return getThemeColor(grid, 'checkbox', 'borderColor');
				}
			});
		}
		get button() {
			const grid = this._grid;
			return this._button || (this._button = {
				get color() {
					return getThemeColor(grid, 'button', 'color');
				},
				get bgColor() {
					return getThemeColor(grid, 'button', 'bgColor');
				},
			});
		}

	}
	

	function strokeRect(ctx, color, left, top, width, height) {
		if (!Array.isArray(color)) {
			if (color) {
				ctx.strokeStyle = color;
				ctx.strokeRect(left, top, width, height);
			}
		} else {
			const borderColors = toBoxArray(color);
			canvashelper.strokeColorsRect(ctx, borderColors, left, top, width, height);
		}
	}

	class GridCanvasHelper {
		constructor(grid) {
			this._grid = grid;
			this._theme = new Theme(grid);
		}
		createCalculator(context, font) {
			return {
				calcWidth(width) {
					return calc.toPx(width, {
						get full() {
							const rect = context.getRect();
							return rect.width;
						},
						get em() {
							return getFontSize(context.getContext(), font).width;
						}
					});
				},
				calcHeight(height) {
					return calc.toPx(height, {
						get full() {
							const rect = context.getRect();
							return rect.height;
						},
						get em() {
							return getFontSize(context.getContext(), font).height;
						}
					});
				}
			};
		}
		getColor(color, col, row, ctx) {
			return getColor(color, col, row, this._grid, ctx);
		}
		toBoxArray(obj) {
			return toBoxArray(obj);
		}
		toBoxPixelArray(value, context, font) {
			if (typeof value === 'string' || Array.isArray(value)) {
				const calculator = this.createCalculator(context, font);
				const box = toBoxArray(value);
				return [
					calculator.calcHeight(box[0]),
					calculator.calcWidth(box[1]),
					calculator.calcHeight(box[2]),
					calculator.calcWidth(box[3]),
				];
			}
			return toBoxArray(value);
		}
		get theme() {
			return this._theme;
		}
		drawWithClip(context, draw) {
			const drawRect = context.getDrawRect();
			if (!drawRect) {
				return;
			}
			const ctx = context.getContext();

			ctx.save();
			try {
				ctx.beginPath();
				ctx.rect(drawRect.left, drawRect.top, drawRect.width, drawRect.height);
				//clip
				ctx.clip();

				draw(ctx);
			} finally {
				ctx.restore();
			}
		}
		drawBorderWithClip(context, draw) {
			const drawRect = context.getDrawRect();
			if (!drawRect) {
				return;
			}
			const rect = context.getRect();
			const ctx = context.getContext();
			ctx.save();
			try {
				//罫線用clip
				ctx.beginPath();
				let clipLeft = drawRect.left;
				let clipWidth = drawRect.width;
				if (drawRect.left === rect.left) {
					clipLeft += -1;
					clipWidth += 1;
				}
				let clipTop = drawRect.top;
				let clipHeight = drawRect.height;
				if (drawRect.top === rect.top) {
					clipTop += -1;
					clipHeight += 1;
				}
				ctx.rect(clipLeft, clipTop, clipWidth, clipHeight);
				ctx.clip();

				draw(ctx);
			} finally {
				ctx.restore();
			}
		}
		text(text, context,
				{
					padding,
					offset = 2,
					color,
					textAlign = 'left',
					textBaseline = 'middle',
					font,
					icons,
				} = {}) {
			let rect = context.getRect();

			const {col, row} = context;

			if (!color) {
				({color} = this.theme);
				// header color
				const isFrozenCell = this._grid.isFrozenCell(col, row);
				if (isFrozenCell && isFrozenCell.row) {
					color = this.theme.frozenRowsColor;
				}
			}

			this.drawWithClip(context, (ctx) => {
				if (padding) {
					padding = this.toBoxPixelArray(padding, context, font);
					const left = rect.left + padding[3];
					const top = rect.top + padding[0];
					const width = rect.width - padding[1] - padding[3];
					const height = rect.height - padding[0] - padding[2];
					rect = new Rect(left, top, width, height);
				}
				_inlineRect(this._grid, ctx, text, rect, col, row,
						{
							offset,
							color,
							textAlign,
							textBaseline,
							font,
							icons,
						});
			});
		}
		multilineText(multilines, context,
				{
					padding,
					offset = 2,
					color,
					textAlign = 'left',
					textBaseline = 'middle',
					font,
					lineHeight = '1em',
					icons,
				} = {}) {
			let rect = context.getRect();

			const {col, row} = context;

			if (!color) {
				({color} = this.theme);
				// header color
				const isFrozenCell = this._grid.isFrozenCell(col, row);
				if (isFrozenCell && isFrozenCell.row) {
					color = this.theme.frozenRowsColor;
				}
			}

			this.drawWithClip(context, (ctx) => {
				if (padding) {
					padding = this.toBoxPixelArray(padding, context, font);
					const left = rect.left + padding[3];
					const top = rect.top + padding[0];
					const width = rect.width - padding[1] - padding[3];
					const height = rect.height - padding[0] - padding[2];
					rect = new Rect(left, top, width, height);
				}
				const calculator = this.createCalculator(context, font);
				lineHeight = calculator.calcHeight(lineHeight);
				_multiInlineRect(this._grid, ctx, multilines, rect, col, row,
						{
							offset,
							color,
							textAlign,
							textBaseline,
							font,
							lineHeight,
							icons,
						});
			});
		}
		fillText(text, x, y, context,
				{
					color,
					textAlign = 'left',
					textBaseline = 'top',
					font,
				} = {}) {

			const {col, row} = context;

			if (!color) {
				({color} = this.theme);
				// header color
				const isFrozenCell = this._grid.isFrozenCell(col, row);
				if (isFrozenCell && isFrozenCell.row) {
					color = this.theme.frozenRowsColor;
				}
			}
			const ctx = context.getContext();
			ctx.save();
			try {
				ctx.fillStyle = getColor(color, col, row, this._grid, ctx);
				ctx.textAlign = textAlign;
				ctx.textBaseline = textBaseline;
				ctx.font = font || ctx.font;
				ctx.fillText(text, x, y);
			} finally {
				ctx.restore();
			}
		}
		fillCell(context,
				{
					fillColor = this.theme.defaultBgColor,
				} = {}) {
			const rect = context.getRect();

			this.drawWithClip(context, (ctx) => {
				const {col, row} = context;
				ctx.fillStyle = getColor(fillColor, col, row, this._grid, ctx);

				ctx.beginPath();
				ctx.rect(rect.left, rect.top, rect.width, rect.height);
				ctx.fill();
			});
		}
		fillCellWithState(context, option = {}) {
			option.fillColor = this.getFillColorState(context, option);
			this.fillCell(context, option);
		}
		fillRect(rect, context,
				{
					fillColor = this.theme.defaultBgColor,
				} = {}) {

			const ctx = context.getContext();
			ctx.save();
			try {
				const {col, row} = context;
				ctx.fillStyle = getColor(fillColor, col, row, this._grid, ctx);
				
				ctx.beginPath();
				ctx.rect(rect.left, rect.top, rect.width, rect.height);
				ctx.fill();
			} finally {
				ctx.restore();
			}
		}
		fillRectWithState(rect, context, option = {}) {
			option.fillColor = this.getFillColorState(context, option);

			this.fillRect(rect, context, option);
		}
		getFillColorState(context, option = {}) {
			const state = context.getSelectState();
			const {col, row} = context;
			if (!state.selected && state.selection) {
				return this.theme.selectionBgColor;
			} else {
				const isFrozenCell = this._grid.isFrozenCell(col, row);
				if (isFrozenCell && isFrozenCell.row) {
					return this.theme.frozenRowsBgColor;
				}
			}
			return option.fillColor || this.theme.defaultBgColor;
		}
		border(context,
				{
					borderColor = this.theme.borderColor,
					lineWidth = 1,
				} = {}) {
			const rect = context.getRect();

			this.drawBorderWithClip(context, (ctx) => {
				const {col, row} = context;
				const borderColors = getColor(borderColor, col, row, this._grid, ctx);
				
				if (lineWidth === 1) {
					ctx.lineWidth = 1;
					strokeRect(ctx, borderColors, rect.left - 0.5, rect.top - 0.5, rect.width, rect.height);
				} else if (lineWidth === 2) {
					ctx.lineWidth = 2;
					strokeRect(ctx, borderColors, rect.left, rect.top, rect.width - 1, rect.height - 1);
				} else {
					ctx.lineWidth = lineWidth;
					const startOffset = (lineWidth / 2) - 1;
					strokeRect(ctx, borderColors,
							rect.left + startOffset,
							rect.top + startOffset,
							rect.width - lineWidth + 1,
							rect.height - lineWidth + 1
					);
				}
			});
		}
		borderWithState(context, option = {}) {
			const rect = context.getRect();
			const state = context.getSelectState();
			const {col, row} = context;

			//罫線
			if (state.selected) {
				option.borderColor = this.theme.hiliteBorderColor;
				option.lineWidth = 2;
				this.border(context, option);
			} else {
				// header color
				const isFrozenCell = this._grid.isFrozenCell(col, row);
				if (isFrozenCell && isFrozenCell.row) {
					option.borderColor = this.theme.frozenRowsBorderColor;
				}

				option.lineWidth = 1;
				this.border(context, option);

				//追加処理
				const sel = this._grid.selection.select;
				if (sel.col + 1 === col && sel.row === row) {
					//右が選択されている
					this.drawBorderWithClip(context, (ctx) => {
						const borderColors = toBoxArray(
								getColor(this.theme.hiliteBorderColor, sel.col, sel.row, this._grid, ctx)
						);
						ctx.lineWidth = 1;
						ctx.strokeStyle = borderColors[1];
						ctx.beginPath();
						ctx.moveTo(rect.left - 0.5, rect.top);
						ctx.lineTo(rect.left - 0.5, rect.bottom);
						ctx.stroke();
					});
				} else if (sel.col === col && sel.row + 1 === row) {
					//上が選択されている
					this.drawBorderWithClip(context, (ctx) => {
						const borderColors = toBoxArray(
								getColor(this.theme.hiliteBorderColor, sel.col, sel.row, this._grid, ctx)
						);
						ctx.lineWidth = 1;
						ctx.strokeStyle = borderColors[0];
						ctx.beginPath();
						ctx.moveTo(rect.left, rect.top - 0.5);
						ctx.lineTo(rect.right, rect.top - 0.5);
						ctx.stroke();
					});
				}
			}
		}
		checkbox(check, context, option = {}) {
			this.drawWithClip(context, (ctx) => {
				drawCheckbox(ctx, context.getRect(), check, this, option);
			});
		}
		button(caption, context,
				{
					bgColor = this.theme.button.bgColor,
					padding,
					offset = 2,
					color = this.theme.button.color,
					textAlign = 'center',
					textBaseline = 'middle',
					shadow,
					font,
					icons,
				} = {}) {
			const rect = context.getRect();

			this.drawWithClip(context, (ctx) => {
				const {col, row} = context;
				padding = this.toBoxPixelArray(padding || rect.height / 8, context, font);
				const left = rect.left + padding[3];
				const top = rect.top + padding[0];
				const width = rect.width - padding[1] - padding[3];
				const height = rect.height - padding[0] - padding[2];

				canvashelper.drawButton(ctx, left, top, width, height, {
					bgColor,
					radius: rect.height / 8,
					offset,
					shadow,
				});
				_inlineRect(this._grid, ctx, caption, new Rect(left, top, width, height),
						col, row,
						{
							offset,
							color,
							textAlign,
							textBaseline,
							font,
							icons,
						});
			});
		}
		testFontLoad(font, value, context) {
			return testFontLoad(font, value, context, this._grid);
		}
	}

	module.exports = GridCanvasHelper;
}