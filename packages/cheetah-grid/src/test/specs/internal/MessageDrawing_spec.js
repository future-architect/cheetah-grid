/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createRect() {
		return {
			left: 10,
			top: 20,
			width: 100,
			height: 40,
			right: 110,
			bottom: 60,
			copy: function() {
				return Object.assign({}, this);
			},
		};
	}

	function createContext(selected, calls) {
		return {
			col: 1,
			row: 2,
			getRect: createRect,
			getContext: function() {
				return {
					fillStyle: '',
					fillRect: function(left, top, width, height) {
						if (calls) {
							calls.push(['fillRect', left, top, width, height, this.fillStyle]);
						}
					},
				};
			},
			getSelection: function() {
				return {
					select: selected || {col: 9, row: 9},
				};
			},
		};
	}

	function createGrid(focused) {
		return {
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			hasFocusGrid: function() {
				return focused;
			},
		};
	}

	function createHelper(calls) {
		return {
			theme: {
				messages: {
					errorBgColor: null,
					warnBgColor: 'warnTheme',
					infoBgColor: 'infoTheme',
					boxWidth: 20,
					markHeight: 10,
				},
			},
			getColor: function(color, col, row) {
				return color ? `${color}:${col}:${row}` : null;
			},
			drawBorderWithClip: function(context, callback) {
				calls.push(['clip', context.col, context.row]);
				const ctx = {
					fillStyle: '',
					fillRect: function(left, top, width, height) {
						calls.push(['fillRect', left, top, width, height, this.fillStyle]);
					},
				};
				callback(ctx);
			},
			fillRectWithState: function(rect, _context, option) {
				calls.push(['mark', rect.left, rect.top, rect.width, rect.height, option.fillColor]);
			},
		};
	}
	function createMarkBoxFixture(calls) {
		const ctx = {
			fillStyle: '',
			fillRect: function(left, top, width, height) {
				calls.push(['fillRect', left, top, width, height, this.fillStyle]);
			},
		};
		return {
			context: {
				getContext: function() {
					return ctx;
				},
				getRect: createRect,
			},
			helper: {
				fillRectWithState: function(rect, _context, option) {
					calls.push(['mark', rect.left, rect.top, rect.width, rect.height, option.fillColor]);
				},
			},
		};
	}

	describe('message drawing', function() {
		it('draws exclamation mark boxes', async function() {
			const utils = await import('../../../js/columns/message/messageUtils.ts');
			const calls = [];
			const {context, helper} = createMarkBoxFixture(calls);

			utils.drawExclamationMarkBox(context, {
				bgColor: 'errorBg',
				color: 'ink',
				boxWidth: 20,
				markHeight: 10,
			}, helper);

			expect(calls).toEqual([
				['fillRect', 90, 20, 100, 39, 'errorBg'],
				['mark', 139, 35, 2, 6, 'ink'],
				['mark', 139, 43, 2, 2, 'ink'],
			]);
		});

		it('draws information mark boxes', async function() {
			const utils = await import('../../../js/columns/message/messageUtils.ts');
			const calls = [];
			const {context, helper} = createMarkBoxFixture(calls);

			utils.drawInformationMarkBox(context, {
				bgColor: 'infoBg',
				color: 'ink',
				boxWidth: 20,
				markHeight: 10,
			}, helper);

			expect(calls).toEqual([
				['fillRect', 90, 20, 100, 39, 'infoBg'],
				['mark', 139, 35, 2, 2, 'ink'],
				['mark', 139, 39, 2, 6, 'ink'],
			]);
		});

		it('draws error, warning, and info markers when the cell is not actively selected', async function() {
			const {ErrorMessage} = await import('../../../js/columns/message/ErrorMessage.ts');
			const {WarningMessage} = await import('../../../js/columns/message/WarningMessage.ts');
			const {InfoMessage} = await import('../../../js/columns/message/InfoMessage.ts');
			const calls = [];
			const helper = createHelper(calls);
			const grid = createGrid(true);
			const style = {bgColor: 'cellBg'};

			new ErrorMessage(grid).drawCellMessageInternal({}, createContext(null, calls), style, helper, grid, {});
			new WarningMessage(grid).drawCellMessageInternal({}, createContext(null, calls), style, helper, grid, {});
			new InfoMessage(grid).drawCellMessageInternal({}, createContext(null, calls), style, helper, grid, {});

			expect(calls.filter(function(call) {
				return call[0] === 'clip';
			})).toEqual([
				['clip', 1, 2],
				['clip', 1, 2],
				['clip', 1, 2],
			]);
			expect(calls).toContainEqual(['fillRect', 90, 20, 100, 39, '#ff8a80']);
			expect(calls).toContainEqual(['fillRect', 90, 20, 100, 39, 'warnTheme:1:2']);
			expect(calls).toContainEqual(['fillRect', 90, 20, 100, 39, 'infoTheme:1:2']);
		});

		it('skips marker drawing while the selected cell has grid focus', async function() {
			const {ErrorMessage} = await import('../../../js/columns/message/ErrorMessage.ts');
			const calls = [];
			const grid = createGrid(true);

			new ErrorMessage(grid).drawCellMessageInternal(
					{},
					createContext({col: 1, row: 2}),
					{bgColor: 'cellBg'},
					createHelper(calls),
					grid,
					{}
			);

			expect(calls).toEqual([]);
		});
	});
})();
