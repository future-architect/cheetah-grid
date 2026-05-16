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
			toCurrentContext: function() {
				return current;
			},
		};
	}

	function createHelper(calls) {
		return {
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
	});
})();
