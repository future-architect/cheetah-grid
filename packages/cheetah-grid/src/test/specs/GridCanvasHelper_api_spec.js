/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const GridCanvasHelper = cheetahGrid.GridCanvasHelper;

	function createCanvasContext(calls) {
		const states = [];
		return {
			canvas: {
				style: {
					letterSpacing: '',
				},
			},
			font: '__grid_canvas_helper_12px__',
			fillStyle: '#000',
			strokeStyle: '#000',
			textAlign: 'left',
			textBaseline: 'top',
			lineWidth: 1,
			shadowColor: '',
			shadowBlur: 0,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			measureText: function(text) {
				return {width: Math.max(String(text).length * 8, 8)};
			},
			save: function() {
				states.push({
					font: this.font,
					fillStyle: this.fillStyle,
					strokeStyle: this.strokeStyle,
					textAlign: this.textAlign,
					textBaseline: this.textBaseline,
					lineWidth: this.lineWidth,
					shadowColor: this.shadowColor,
					shadowBlur: this.shadowBlur,
					shadowOffsetX: this.shadowOffsetX,
					shadowOffsetY: this.shadowOffsetY,
				});
				calls.push(['save']);
			},
			restore: function() {
				Object.assign(this, states.pop());
				calls.push(['restore']);
			},
			beginPath: function() {
				calls.push(['beginPath']);
			},
			closePath: function() {
				calls.push(['closePath']);
			},
			rect: function(left, top, width, height) {
				calls.push(['rect', left, top, width, height]);
			},
			clip: function() {
				calls.push(['clip']);
			},
			fill: function() {
				calls.push(['fill', this.fillStyle]);
			},
			stroke: function() {
				calls.push(['stroke', this.strokeStyle, this.lineWidth]);
			},
			strokeRect: function(left, top, width, height) {
				calls.push(['strokeRect', left, top, width, height, this.strokeStyle, this.lineWidth]);
			},
			moveTo: function(x, y) {
				calls.push(['moveTo', x, y]);
			},
			lineTo: function(x, y) {
				calls.push(['lineTo', x, y]);
			},
			arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
				calls.push(['arc', x, y, radius, startAngle, endAngle, anticlockwise]);
			},
			fillText: function(text, x, y) {
				calls.push(['fillText', text, x, y, this.fillStyle, this.font]);
			},
		};
	}

	function createGrid(calls, selection) {
		return {
			selection: selection || {
				select: {col: 1, row: 1},
				range: {
					start: {col: 1, row: 1},
					end: {col: 2, row: 2},
				},
			},
			theme: {
				font: '13px sans-serif',
				underlayBackgroundColor: '#fafafa',
				color: function(args) {
					return args.row === 0 ? null : '#111';
				},
				frozenRowsColor: '#222',
				defaultBgColor: '#fff',
				frozenRowsBgColor: '#eee',
				selectionBgColor: '#cde',
				highlightBgColor: '#def',
				borderColor: ['#100', '#200', '#300', '#400'],
				frozenRowsBorderColor: '#555',
				highlightBorderColor: '#f00',
				checkbox: {
					uncheckBgColor: '#fff',
					checkBgColor: '#333',
					borderColor: '#444',
				},
				radioButton: {
					checkColor: '#111',
					uncheckBorderColor: '#222',
					checkBorderColor: '#333',
					uncheckBgColor: '#444',
					checkBgColor: '#555',
				},
				button: {
					color: '#010',
					bgColor: '#020',
				},
				tree: {
					lineStyle: 'dashed',
					lineColor: '#030',
					lineWidth: 2,
					treeIcon: {path: 'M0 0h1v1z', width: 8},
				},
				header: {
					sortArrowColor: '#040',
				},
				messages: {
					infoBgColor: '#050',
					errorBgColor: '#060',
					warnBgColor: '#070',
					boxWidth: 12,
					markHeight: 6,
				},
				indicators: {
					topLeftColor: '#080',
					topLeftSize: 1,
					topRightColor: '#090',
					topRightSize: 2,
					bottomRightColor: '#0a0',
					bottomRightSize: 3,
					bottomLeftColor: '#0b0',
					bottomLeftSize: 4,
				},
			},
			isFrozenCell: function(_col, row) {
				return row === 0 ? {row: true, col: false} : null;
			},
			setCellOverflowText: function(col, row, value) {
				calls.push(['overflow', col, row, value]);
			},
			invalidateCell: function(col, row) {
				calls.push(['invalidate', col, row]);
			},
		};
	}

	function createContext(col, row, calls, selection, drawRect) {
		const rect = {
			left: 10,
			top: 20,
			width: 80,
			height: 36,
			right: 90,
			bottom: 56,
		};
		const ctx = createCanvasContext(calls);
		return {
			col,
			row,
			getRect: function() {
				return rect;
			},
			getDrawRect: function() {
				return drawRect === undefined ? rect : drawRect;
			},
			getContext: function() {
				return ctx;
			},
			getSelection: function() {
				return selection || {
					select: {col: 1, row: 1},
					range: {
						start: {col: 1, row: 1},
						end: {col: 2, row: 2},
					},
				};
			},
		};
	}

	describe('GridCanvasHelper API', function() {
		it('resolves theme values, calculators, padding, and clip rectangles', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const context = createContext(1, 1, calls);
			const noDrawContext = createContext(1, 1, calls, null, null);

			expect(helper.theme.font).toEqual('13px sans-serif');
			expect(helper.theme.underlayBackgroundColor).toEqual('#fafafa');
			expect(helper.theme.checkbox.checkBgColor).toEqual('#333');
			expect(helper.theme.radioButton.checkColor).toEqual('#111');
			expect(helper.theme.radioButton.uncheckBorderColor).toEqual('#222');
			expect(helper.theme.radioButton.checkBorderColor).toEqual('#333');
			expect(helper.theme.radioButton.uncheckBgColor).toEqual('#444');
			expect(helper.theme.radioButton.checkBgColor).toEqual('#555');
			expect(helper.theme.getThemeValue('button', 'color')).toEqual('#010');
			expect(helper.theme.button.color).toEqual('#010');
			expect(helper.theme.button.bgColor).toEqual('#020');
			expect(helper.theme.tree.lineStyle).toEqual('dashed');
			expect(helper.theme.tree.lineColor).toEqual('#030');
			expect(helper.theme.tree.lineWidth).toEqual(2);
			expect(helper.theme.tree.treeIcon).toEqual({path: 'M0 0h1v1z', width: 8});
			expect(helper.theme.header.sortArrowColor).toEqual('#040');
			expect(helper.theme.messages.infoBgColor).toEqual('#050');
			expect(helper.theme.messages.errorBgColor).toEqual('#060');
			expect(helper.theme.messages.warnBgColor).toEqual('#070');
			expect(helper.theme.messages.boxWidth).toEqual(12);
			expect(helper.theme.messages.markHeight).toEqual(6);
			expect(helper.theme.indicators.topLeftColor).toEqual('#080');
			expect(helper.theme.indicators.topLeftSize).toEqual(1);
			expect(helper.theme.indicators.topRightColor).toEqual('#090');
			expect(helper.theme.indicators.topRightSize).toEqual(2);
			expect(helper.theme.indicators.bottomRightColor).toEqual('#0a0');
			expect(helper.theme.indicators.bottomRightSize).toEqual(3);
			expect(helper.theme.indicators.bottomLeftColor).toEqual('#0b0');
			expect(helper.theme.indicators.bottomLeftSize).toEqual(4);

			const calculator = helper.createCalculator(context, '__grid_canvas_helper_12px__');
			expect(calculator.calcWidth('50%')).toEqual(40);
			expect(calculator.calcHeight('50%')).toEqual(18);
			expect(calculator.calcHeight('1em')).toEqual(8);
			expect(helper.toBoxArray('#111')).toEqual(['#111', '#111', '#111', '#111']);
			expect(helper.toBoxPixelArray(['1em', '25%', 2, 4], context, '__grid_canvas_helper_12px__')).toEqual([
				8,
				20,
				2,
				4,
			]);
			expect(helper.getColor(function(args) {
				return `${args.col}:${args.row}`;
			}, 3, 4, context.getContext())).toEqual('3:4');
			expect(helper.getStyleProperty(function(args) {
				return args.grid === grid ? 'grid' : 'other';
			}, 3, 4, context.getContext())).toEqual('grid');

			helper.drawWithClip(noDrawContext, function() {
				calls.push(['should-not-draw']);
			});
			helper.drawBorderWithClip(noDrawContext, function() {
				calls.push(['should-not-border']);
			});
			helper.drawWithClip(context, function(ctx) {
				ctx.fillStyle = '#draw';
				ctx.fill();
			});
			helper.drawBorderWithClip(context, function(ctx) {
				ctx.strokeStyle = '#border';
				ctx.stroke();
			});

			expect(calls).not.toContainEqual(['should-not-draw']);
			expect(calls).not.toContainEqual(['should-not-border']);
			expect(calls).toContainEqual(['rect', 10, 20, 80, 36]);
			expect(calls).toContainEqual(['clip']);
			expect(calls).toContainEqual(['fill', '#draw']);
			expect(calls).toContainEqual(['stroke', '#border', 1]);
		});

		it('fills, borders, and resolves selection-aware colors', function() {
			const calls = [];
			const selection = {
				select: {col: 1, row: 1},
				range: {
					start: {col: 1, row: 1},
					end: {col: 2, row: 2},
				},
			};
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const selected = createContext(1, 1, calls, selection);
			const ranged = createContext(2, 2, calls, selection);
			const defaultCell = createContext(3, 3, calls, selection);
			const frozen = createContext(0, 0, calls, selection);
			const rightOfSelected = createContext(2, 1, calls, selection);
			const belowSelected = createContext(1, 2, calls, selection);

			expect(helper.getFillColorState(ranged)).toEqual('#cde');
			expect(helper.getFillColorState(defaultCell, {fillColor: '#custom'})).toEqual('#custom');
			expect(helper.getFillColorState(selected)).toEqual('#def');
			expect(helper.getFillColorState(frozen)).toEqual('#eee');
			expect(helper.getFillColorState(defaultCell)).toEqual('#fff');

			helper.fillText('hello', 1, 2, frozen, {
				font: function(args) {
					return args.row === 0 ? '10px serif' : undefined;
				},
			});
			helper.text('frozen', frozen, {offset: 2});
			helper.multilineText(['frozen'], frozen, {offset: 2});
			helper.fillCell(defaultCell);
			helper.fillCellWithState(ranged);
			helper.fillRect({left: 1, top: 2, width: 3, height: 4}, defaultCell, {fillColor: '#fill'});
			helper.fillRectWithState({left: 2, top: 3, width: 4, height: 5}, selected);
			helper.border(defaultCell, {lineWidth: 1});
			helper.border(defaultCell, {borderColor: '#single', lineWidth: 2});
			helper.border(defaultCell, {borderColor: ['#a', '#b', '#c', '#d'], lineWidth: 4});
			helper.borderWithState(selected);
			helper.borderWithState(frozen);
			helper.borderWithState(rightOfSelected);
			helper.borderWithState(belowSelected);

			expect(calls).toContainEqual(['fillText', 'hello', 1, 2, '#222', '10px serif']);
			expect(calls.filter(function(call) {
				return call[0] === 'fillText' && call[1] === 'frozen' && call[4] === '#222';
			}).length).toEqual(2);
			expect(calls).toContainEqual(['fill', '#fff']);
			expect(calls).toContainEqual(['fill', '#cde']);
			expect(calls).toContainEqual(['fill', '#fill']);
			expect(calls).toContainEqual(['fill', '#def']);
			expect(calls).toContainEqual(['strokeRect', 10, 20, 79, 35, '#single', 2]);
			expect(calls).toContainEqual(['moveTo', 9.5, 20]);
			expect(calls).toContainEqual(['lineTo', 9.5, 56]);
			expect(calls).toContainEqual(['moveTo', 10, 19.5]);
			expect(calls).toContainEqual(['lineTo', 90, 19.5]);
		});

		it('draws text, multiline text, checkboxes, radio buttons, and buttons', function() {
			const calls = [];
			const selection = {
				select: {col: 5, row: 5},
				range: {
					start: {col: 5, row: 5},
					end: {col: 5, row: 5},
				},
			};
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const context = createContext(3, 3, calls, selection);
			const bottomContext = createContext(4, 4, calls, selection);

			const overflowTextStart = calls.length;
			helper.text('long text that will overflow', context, {
				padding: ['1em', '4px', '2px', '3px'],
				textOverflow: '!',
				trailingIcon: {content: 'T', width: 8},
				icons: [{content: 'I', width: 8, color: '#999'}],
				font: function() {
					return '__grid_canvas_helper_12px__';
				},
			});
			const overflowTextCalls = calls.slice(overflowTextStart);
			expect(overflowTextCalls).toContainEqual(['overflow', 3, 3, 'long text that will overflow']);
			expect(overflowTextCalls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return [call[1], call[4]];
			})).toEqual([
				['I', '#999'],
				['long t', '#111'],
				['!', '#111'],
				['T', '#111'],
			]);
			helper.multilineText(['first very long line', 'second'], bottomContext, {
				autoWrapText: true,
				lineClamp: 'auto',
				textOverflow: 'ellipsis',
				trailingIcon: {content: 'T', width: 8},
				lineHeight: '1em',
				textBaseline: 'bottom',
				padding: 2,
			});
			helper.multilineText(['plain', 'lines'], context, {
				textOverflow: 'clip',
				lineClamp: 0,
				trailingIcon: {content: 'T', width: 8},
			});
			const lineClampStart = calls.length;
			helper.multilineText(['short', 'rows'], context, {
				offset: 2,
				lineClamp: 3,
				textOverflow: 'clip',
			});
			const lineClampCalls = calls.slice(lineClampStart);
			expect(lineClampCalls).toContainEqual(['overflow', 3, 3, false]);
			expect(lineClampCalls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return call[1];
			})).toEqual(['short', 'rows']);
			helper.checkbox(true, context, {
				animElapsedTime: 0.25,
				padding: '1em',
				checkBgColor: '#checked',
			});
			helper.checkbox(false, context, {
				animElapsedTime: 0.25,
				padding: 2,
			});
			helper.checkbox(true, context, {
				animElapsedTime: 1,
			});
			helper.checkbox(true, context, {
				animElapsedTime: 0,
			});
			const inline = helper.buildCheckBoxInline(true, context, {
				checkBgColor: '#inline',
			});
			inline.draw({
				ctx: context.getContext(),
				canvashelper: cheetahGrid.tools.canvashelper,
				rect: context.getRect(),
				offset: 2,
				offsetLeft: 1,
				offsetRight: 2,
				offsetTop: 3,
				offsetBottom: 4,
			});
			helper.radioButton(true, context, {
				animElapsedTime: 0.25,
				checkColor: '#radio',
				uncheckBorderColor: '#unchecked-border',
				checkBorderColor: '#checked-border',
			});
			helper.radioButton(false, context, {
				animElapsedTime: 0.25,
				uncheckBgColor: '#unchecked',
			});
			helper.button('Run', context, {
				padding: [2, 3, 4, 5],
				bgColor: function() {
					return '#button';
				},
				color: '#button-text',
				shadow: {
					color: '#shadow',
					blur: 2,
					offset: {x: 1, y: 2},
				},
				textOverflow: '...',
			});

			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return [call[1], call[4]];
			})).toContainEqual(['Run', '#button-text']);
			expect(calls).toContainEqual(['fill', '#333']);
			expect(calls).toContainEqual(['fill', '#fff']);
			expect(calls).toContainEqual(['fill', '#button']);
			expect(calls).toContainEqual(['fill', '#inline']);
			expect(calls).toContainEqual(['fill', '#radio']);
		});
	});
})();
