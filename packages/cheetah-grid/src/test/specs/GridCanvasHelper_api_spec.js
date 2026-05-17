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

	function createSelection() {
		return {
			select: {col: 1, row: 1},
			range: {
				start: {col: 1, row: 1},
				end: {col: 2, row: 2},
			},
		};
	}
	function createUnselectedFixture(calls) {
		const selection = {
			select: {col: 5, row: 5},
			range: {
				start: {col: 5, row: 5},
				end: {col: 5, row: 5},
			},
		};
		const grid = createGrid(calls, selection);
		const helper = new GridCanvasHelper(grid);
		return {
			context: createContext(3, 3, calls, selection),
			grid,
			helper,
			selection,
		};
	}

	describe('GridCanvasHelper API', function() {
		it('resolves base and control theme values from the grid theme', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);

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
		});

		it('resolves message and indicator theme values from the grid theme', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);

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
		});

		it('calculates box sizes and resolves style callbacks', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const context = createContext(1, 1, calls);

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
		});

		it('skips clipped draw callbacks when the draw rectangle is missing', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const noDrawContext = createContext(1, 1, calls, null, null);

			helper.drawWithClip(noDrawContext, function() {
				calls.push(['should-not-draw']);
			});

			expect(calls).toEqual([]);
		});

		it('skips clipped border callbacks when the draw rectangle is missing', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const noDrawContext = createContext(1, 1, calls, null, null);

			helper.drawBorderWithClip(noDrawContext, function() {
				calls.push(['should-not-border']);
			});

			expect(calls).toEqual([]);
		});

		it('clips draw callbacks to the cell draw rectangle', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const context = createContext(1, 1, calls);

			helper.drawWithClip(context, function(ctx) {
				ctx.fillStyle = '#draw';
				ctx.fill();
			});

			expect(calls).toEqual([
				['save'],
				['beginPath'],
				['rect', 10, 20, 80, 36],
				['clip'],
				['fill', '#draw'],
				['restore'],
			]);
		});

		it('clips border callbacks with a one-pixel border allowance', function() {
			const calls = [];
			const grid = createGrid(calls);
			const helper = new GridCanvasHelper(grid);
			const context = createContext(1, 1, calls);

			helper.drawBorderWithClip(context, function(ctx) {
				ctx.strokeStyle = '#border';
				ctx.stroke();
			});

			expect(calls).toEqual([
				['save'],
				['beginPath'],
				['rect', 9, 19, 81, 37],
				['clip'],
				['stroke', '#border', 1],
				['restore'],
			]);
		});

		it('resolves selection-aware fill colors', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const selected = createContext(1, 1, calls, selection);
			const ranged = createContext(2, 2, calls, selection);
			const defaultCell = createContext(3, 3, calls, selection);
			const frozen = createContext(0, 0, calls, selection);

			expect(helper.getFillColorState(ranged)).toEqual('#cde');
			expect(helper.getFillColorState(defaultCell, {fillColor: '#custom'})).toEqual('#custom');
			expect(helper.getFillColorState(selected)).toEqual('#def');
			expect(helper.getFillColorState(frozen)).toEqual('#eee');
			expect(helper.getFillColorState(defaultCell)).toEqual('#fff');
		});

		it('draws direct frozen-row text with frozen-row color and resolved font', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const frozen = createContext(0, 0, calls, selection);

			helper.fillText('hello', 1, 2, frozen, {
				font: function(args) {
					return args.row === 0 ? '10px serif' : undefined;
				},
			});

			expect(calls).toContainEqual(['fillText', 'hello', 1, 2, '#222', '10px serif']);
		});

		it('draws single-line frozen-row cell text with frozen-row color', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const frozen = createContext(0, 0, calls, selection);

			helper.text('frozen', frozen, {offset: 2});

			expect(calls).toContainEqual(['fillText', 'frozen', 13, 38, '#222', '__grid_canvas_helper_12px__']);
		});

		it('draws multiline frozen-row cell text with frozen-row color', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const frozen = createContext(0, 0, calls, selection);

			helper.multilineText(['frozen'], frozen, {offset: 2});

			expect(calls).toContainEqual(['fillText', 'frozen', 13, 38, '#222', '__grid_canvas_helper_12px__']);
		});

		it('fills cells and rectangles with default, selected, and custom colors', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const selected = createContext(1, 1, calls, selection);
			const ranged = createContext(2, 2, calls, selection);
			const defaultCell = createContext(3, 3, calls, selection);

			helper.fillCell(defaultCell);
			expect(calls.slice()).toContainEqual(['fill', '#fff']);
			calls.length = 0;

			helper.fillCellWithState(ranged);
			expect(calls).toContainEqual(['fill', '#cde']);
			calls.length = 0;

			helper.fillRect({left: 1, top: 2, width: 3, height: 4}, defaultCell, {fillColor: '#fill'});
			expect(calls).toContainEqual(['rect', 1, 2, 3, 4]);
			expect(calls).toContainEqual(['fill', '#fill']);
			calls.length = 0;

			helper.fillRectWithState({left: 2, top: 3, width: 4, height: 5}, selected);
			expect(calls).toContainEqual(['rect', 2, 3, 4, 5]);
			expect(calls).toContainEqual(['fill', '#def']);
		});

		it('draws borders with the requested line width and colors', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const defaultCell = createContext(3, 3, calls, selection);

			helper.border(defaultCell, {lineWidth: 1});
			expect(calls).toContainEqual(['moveTo', 9.5, 19.5]);
			expect(calls).toContainEqual(['lineTo', 89.5, 19.5]);
			expect(calls).toContainEqual(['stroke', '#100', 1]);
			calls.length = 0;

			helper.border(defaultCell, {borderColor: '#single', lineWidth: 2});
			expect(calls).toContainEqual(['strokeRect', 10, 20, 79, 35, '#single', 2]);
			calls.length = 0;

			helper.border(defaultCell, {borderColor: ['#a', '#b', '#c', '#d'], lineWidth: 4});
			expect(calls).toContainEqual(['moveTo', 11, 21]);
			expect(calls).toContainEqual(['lineTo', 88, 21]);
			expect(calls).toContainEqual(['stroke', '#a', 4]);
		});

		it('draws state borders for selected, frozen, and adjacent selected cells', function() {
			const calls = [];
			const selection = createSelection();
			const grid = createGrid(calls, selection);
			const helper = new GridCanvasHelper(grid);
			const selected = createContext(1, 1, calls, selection);
			const frozen = createContext(0, 0, calls, selection);
			const rightOfSelected = createContext(2, 1, calls, selection);
			const belowSelected = createContext(1, 2, calls, selection);

			helper.borderWithState(selected);
			expect(calls).toContainEqual(['strokeRect', 10, 20, 79, 35, '#f00', 2]);
			calls.length = 0;

			helper.borderWithState(frozen);
			expect(calls).toContainEqual(['strokeRect', 9.5, 19.5, 80, 36, '#555', 1]);
			calls.length = 0;

			helper.borderWithState(rightOfSelected);
			expect(calls).toContainEqual(['moveTo', 9.5, 20]);
			expect(calls).toContainEqual(['lineTo', 9.5, 56]);
			calls.length = 0;

			helper.borderWithState(belowSelected);
			expect(calls).toContainEqual(['moveTo', 10, 19.5]);
			expect(calls).toContainEqual(['lineTo', 90, 19.5]);
		});

		it('draws overflowing text with leading and trailing icons', function() {
			const calls = [];
			const {context, helper} = createUnselectedFixture(calls);

			helper.text('long text that will overflow', context, {
				padding: ['1em', '4px', '2px', '3px'],
				textOverflow: '!',
				trailingIcon: {content: 'T', width: 8},
				icons: [{content: 'I', width: 8, color: '#999'}],
				font: function() {
					return '__grid_canvas_helper_12px__';
				},
			});

			expect(calls).toContainEqual(['overflow', 3, 3, 'long text that will overflow']);
			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return [call[1], call[4]];
			})).toEqual([
				['I', '#999'],
				['long t', '#111'],
				['!', '#111'],
				['T', '#111'],
			]);
		});

		it('draws auto-wrapped multiline text with a trailing icon', function() {
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
			const bottomContext = createContext(4, 4, calls, selection);

			helper.multilineText(['first very long line', 'second'], bottomContext, {
				autoWrapText: true,
				lineClamp: 'auto',
				textOverflow: 'ellipsis',
				trailingIcon: {content: 'T', width: 8},
				lineHeight: '1em',
				textBaseline: 'bottom',
				padding: 2,
			});

			expect(calls).toContainEqual(['overflow', 4, 4, false]);
			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return call[1];
			})).toEqual(['first', 'very', 'long li', '…', 'T']);
		});

		it('draws unclamped multiline text with a trailing icon', function() {
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

			helper.multilineText(['plain', 'lines'], context, {
				textOverflow: 'clip',
				lineClamp: 0,
				trailingIcon: {content: 'T', width: 8},
			});

			expect(calls).toContainEqual(['overflow', 3, 3, false]);
			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return call[1];
			})).toEqual(['plain', 'lines', 'T']);
		});

		it('draws multiline text up to the requested line clamp', function() {
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

			helper.multilineText(['short', 'rows'], context, {
				offset: 2,
				lineClamp: 3,
				textOverflow: 'clip',
			});

			expect(calls).toContainEqual(['overflow', 3, 3, false]);
			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return call[1];
			})).toEqual(['short', 'rows']);
		});

		it('draws checkbox animation colors for checked and unchecked states', function() {
			const calls = [];
			const {context, helper} = createUnselectedFixture(calls);

			helper.checkbox(true, context, {
				animElapsedTime: 0.25,
				padding: '1em',
				checkBgColor: '#000000',
			});
			expect(calls).toContainEqual(['fill', 'rgb(192, 192, 192)']);
			calls.length = 0;

			helper.checkbox(false, context, {
				animElapsedTime: 0.25,
				padding: 2,
			});
			expect(calls).toContainEqual(['fill', 'rgb(102, 102, 102)']);
			calls.length = 0;

			helper.checkbox(true, context, {
				animElapsedTime: 1,
			});
			expect(calls).toContainEqual(['fill', '#333']);
			calls.length = 0;

			helper.checkbox(true, context, {
				animElapsedTime: 0,
			});
			expect(calls).toContainEqual(['fill', '#fff']);
		});

		it('builds checkbox inline drawers with the provided checked color', function() {
			const calls = [];
			const {context, helper} = createUnselectedFixture(calls);

			const inline = helper.buildCheckBoxInline(true, context, {
				checkBgColor: '#112233',
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

			expect(calls).toContainEqual(['fill', '#112233']);
		});

		it('draws checked and unchecked radio buttons with interpolated colors', function() {
			const calls = [];
			const {context, helper} = createUnselectedFixture(calls);

			helper.radioButton(true, context, {
				animElapsedTime: 0.25,
				checkColor: '#123456',
				uncheckBorderColor: '#222222',
				checkBorderColor: '#666666',
				uncheckBgColor: '#111111',
				checkBgColor: '#555555',
			});
			expect(calls).toContainEqual(['fill', 'rgb(34, 34, 34)']);
			expect(calls).toContainEqual(['stroke', 'rgb(51, 51, 51)', 1]);
			expect(calls).toContainEqual(['fill', '#123456']);
			calls.length = 0;

			helper.radioButton(false, context, {
				animElapsedTime: 0.25,
				checkColor: '#654321',
				uncheckBorderColor: '#222222',
				checkBorderColor: '#333333',
				uncheckBgColor: '#111111',
				checkBgColor: '#555555',
			});
			expect(calls).toContainEqual(['fill', 'rgb(68, 68, 68)']);
			expect(calls).toContainEqual(['stroke', 'rgb(47, 47, 47)', 1]);
			expect(calls).toContainEqual(['fill', '#654321']);
		});

		it('draws buttons with resolved background and text colors', function() {
			const calls = [];
			const {context, helper} = createUnselectedFixture(calls);

			helper.button('Run', context, {
				padding: [2, 3, 4, 5],
				bgColor: function() {
					return '#223344';
				},
				color: '#eeeeee',
				shadow: {
					color: '#111111',
					blur: 2,
					offset: {x: 1, y: 2},
				},
				textOverflow: '...',
			});

			expect(calls.filter(function(call) {
				return call[0] === 'fillText';
			}).map(function(call) {
				return [call[1], call[4]];
			})).toEqual([['Run', '#eeeeee']]);
			expect(calls).toContainEqual(['fill', '#223344']);
		});
	});
})();
