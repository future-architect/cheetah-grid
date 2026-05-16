/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {Column} = cheetahGrid.columns.type;
	const {Style} = cheetahGrid.columns.style;

	function createContext(row) {
		const drawRect = {
			left: 0,
			top: row * 20,
			width: 100,
			height: 20,
			right: 100,
			bottom: row * 20 + 20,
		};
		const current = {
			col: 1,
			row,
			getDrawRect: function() {
				return drawRect;
			},
		};
		return {
			col: 1,
			row,
			getRect: function() {
				return drawRect;
			},
			getContext: function() {
				return {
					globalAlpha: 1,
				};
			},
			toCurrentContext: function() {
				return current;
			},
		};
	}

	function createHelper(calls) {
		return {
			theme: {
				indicators: {
					topLeftColor: 'themeTopLeft',
					topLeftSize: 4,
					topRightColor: 'themeTopRight',
					topRightSize: 5,
					bottomRightColor: 'themeBottomRight',
					bottomRightSize: 6,
					bottomLeftColor: 'themeBottomLeft',
					bottomLeftSize: 7,
				},
			},
			getColor: function(color, col, row) {
				return `${color}:${col}:${row}`;
			},
			drawBorderWithClip: function(context, callback) {
				calls.push(['indicatorClip', context.col, context.row]);
				const ctx = {
					fillStyle: '',
					beginPath: function() {
						calls.push(['beginPath']);
					},
					moveTo: function(x, y) {
						calls.push(['moveTo', x, y]);
					},
					lineTo: function(x, y) {
						calls.push(['lineTo', x, y]);
					},
					closePath: function() {
						calls.push(['closePath']);
					},
					fill: function() {
						calls.push(['fill', this.fillStyle]);
					},
				};
				callback(ctx);
			},
			testFontLoad: function(font, text, context) {
				calls.push(['testFontLoad', font, text, context]);
			},
			text: function(text, context, option) {
				calls.push(['text', text, context, option]);
			},
		};
	}

	function createGrid(helper) {
		return {
			getGridCanvasHelper: function() {
				return helper;
			},
			configure: function(name) {
				if (name === 'fadeinWhenCallbackInPromise') {
					return false;
				}
				return undefined;
			},
		};
	}

	function createDrawInfo(style, bases, messages) {
		return {
			style,
			getRecord: function() {
				return Promise.resolve({id: 1});
			},
			drawCellBase: function(option) {
				bases.push(option || {});
			},
			getIcon: function() {
				return null;
			},
			getMessage: function() {
				return Promise.resolve('message');
			},
			messageHandler: {
				drawCellMessage: function(message, context) {
					messages.push([message, context]);
				},
			},
		};
	}

	describe('BaseColumn.onDrawCell', function() {
		it('waits for promise records, values, and messages before drawing', async function() {
			const calls = [];
			const bases = [];
			const messages = [];
			const helper = createHelper(calls);
			const grid = createGrid(helper);
			const context = createContext(2);
			const column = new Column();

			await column.onDrawCell(Promise.resolve('async value'), createDrawInfo(new Style({
				color: 'ink',
				font: '12px sans-serif',
				textOverflow: 'ellipsis',
			}), bases, messages), context, grid);

			const currentContext = context.toCurrentContext();
			expect(bases).toEqual([{}]);
			expect(calls).toEqual([
				['testFontLoad', '12px sans-serif', 'async value', currentContext],
				['text', 'async value', currentContext, {
					textAlign: 'left',
					textBaseline: 'middle',
					color: 'ink',
					font: '12px sans-serif',
					padding: undefined,
					textOverflow: 'ellipsis',
					icons: undefined,
				}],
			]);
			expect(messages).toEqual([['message', currentContext]]);
		});

		it('skips promise drawing when the current context no longer has a draw rect', async function() {
			const calls = [];
			const bases = [];
			const messages = [];
			const helper = createHelper(calls);
			const grid = createGrid(helper);
			const context = {
				col: 1,
				row: 2,
				toCurrentContext: function() {
					return {
						getDrawRect: function() {
							return null;
						},
					};
				},
			};
			const column = new Column();

			await column.onDrawCell(Promise.resolve('async value'), createDrawInfo(new Style(), bases, messages), context, grid);

			expect(bases).toEqual([{}]);
			expect(calls).toEqual([]);
			expect(messages).toEqual([]);
		});

		it('draws sync values, messages, indicators, and fadein overlay state', async function() {
			const {COLUMN_FADEIN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const calls = [];
			const bases = [];
			const messages = [];
			const helper = createHelper(calls);
			const grid = createGrid(helper);
			grid[COLUMN_FADEIN_STATE_ID] = {
				cells: {
					'1:2': {opacity: 0.25},
				},
			};
			const context = createContext(2);
			const ctx = {
				globalAlpha: 1,
			};
			context.getContext = function() {
				return ctx;
			};
			const column = new Column();
			const info = {
				style: new Style({
					bgColor: 'cell-bg',
					color: 'ink',
					font: '12px sans-serif',
					textOverflow: 'ellipsis',
					indicatorTopLeft: 'triangle',
					indicatorBottomRight: {style: 'triangle', color: 'custom', size: 3},
				}),
				getRecord: function() {
					return {id: 1};
				},
				drawCellBase: function(option) {
					bases.push({
						option: option || {},
						alpha: ctx.globalAlpha,
					});
				},
				getIcon: function() {
					return null;
				},
				getMessage: function() {
					return 'sync message';
				},
				messageHandler: {
					drawCellMessage: function(message, contextArg, styleArg) {
						messages.push([message, contextArg, styleArg]);
					},
				},
			};

			column.onDrawCell('sync value', info, context, grid);

			expect(bases).toEqual([
				{option: {}, alpha: 1},
				{option: {bgColor: 'cell-bg'}, alpha: 1},
				{option: {}, alpha: 0.75},
			]);
			expect(ctx.globalAlpha).toEqual(1);
			expect(calls[0]).toEqual(['testFontLoad', '12px sans-serif', 'sync value', context]);
			expect(calls[1]).toEqual(['text', 'sync value', context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'ink',
				font: '12px sans-serif',
				padding: undefined,
				textOverflow: 'ellipsis',
				icons: undefined,
			}]);
			expect(calls.filter(function(call) {
				return call[0] === 'indicatorClip';
			})).toEqual([
				['indicatorClip', 1, 2],
				['indicatorClip', 1, 2],
			]);
			expect(calls).toContainEqual(['fill', 'themeTopLeft:1:2']);
			expect(calls).toContainEqual(['fill', 'custom']);
			expect(messages).toEqual([['sync message', context, info.style]]);
		});
	});
})();
